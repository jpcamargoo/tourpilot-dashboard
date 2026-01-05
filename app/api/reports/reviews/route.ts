import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pdfReportGenerator, ReportData } from '@/lib/reports/pdf-generator';
import { AuditLogger } from '@/lib/audit/logger';
import { hasPermission, Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// POST /api/reports/reviews - Gerar relatório de reviews em PDF
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, Permission.GENERATE_REPORTS)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { startDate, endDate } = body;

    // Buscar reviews
    const reviews = await prisma.review.findMany({
      where: startDate && endDate ? {
        dataPublicacao: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      } : {},
      include: {
        tour: true,
        guia: true,
      },
      orderBy: {
        dataPublicacao: 'desc',
      },
    });

    // Processar dados
    const reviewsData = reviews.map(r => ({
      data: format(r.dataPublicacao, 'dd/MM/yyyy', { locale: ptBR }),
      autor: r.nomeAutor || 'Anônimo',
      tour: r.tour?.nome || '-',
      guia: r.guia?.nome || '-',
      nota: r.nota.toFixed(1),
      sentimento: r.sentimento || '-',
      fonte: r.fonte,
      comentario: r.comentario
        ? r.comentario.substring(0, 50) + (r.comentario.length > 50 ? '...' : '')
        : '-',
    }));

    // Calcular estatísticas
    const totalReviews = reviews.length;
    const mediaNota = reviews.reduce((acc, r) => acc + r.nota, 0) / totalReviews;
    const positivos = reviews.filter(r => r.sentimento === 'positivo').length;
    const neutros = reviews.filter(r => r.sentimento === 'neutro').length;
    const negativos = reviews.filter(r => r.sentimento === 'negativo').length;

    const reportData: ReportData = {
      title: 'Relatório de Avaliações',
      subtitle: 'Reviews e Sentimento dos Clientes',
      period: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate),
      } : undefined,
      columns: [
        { header: 'Data', dataKey: 'data' },
        { header: 'Autor', dataKey: 'autor' },
        { header: 'Tour', dataKey: 'tour' },
        { header: 'Guia', dataKey: 'guia' },
        { header: 'Nota', dataKey: 'nota' },
        { header: 'Sentimento', dataKey: 'sentimento' },
        { header: 'Fonte', dataKey: 'fonte' },
      ],
      data: reviewsData,
      summary: [
        { label: 'Total de Reviews', value: totalReviews },
        { label: 'Média de Notas', value: mediaNota.toFixed(2) },
        { label: '😊 Positivos', value: `${positivos} (${((positivos / totalReviews) * 100).toFixed(1)}%)` },
        { label: '😐 Neutros', value: `${neutros} (${((neutros / totalReviews) * 100).toFixed(1)}%)` },
        { label: '😞 Negativos', value: `${negativos} (${((negativos / totalReviews) * 100).toFixed(1)}%)` },
      ],
    };

    // Gerar PDF
    const pdfBuffer = await pdfReportGenerator.generateReviewsReport(reportData);

    // Log da ação
    await AuditLogger.logDataExport(
      session.user.id,
      'reviews_pdf',
      reviewsData.length,
      req.headers.get('x-forwarded-for') || undefined
    );

    // Retornar PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-reviews-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de reviews:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
