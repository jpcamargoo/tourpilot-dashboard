import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pdfReportGenerator, ReportData } from '@/lib/reports/pdf-generator';
import { AuditLogger } from '@/lib/audit/logger';
import { hasPermission, Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// POST /api/reports/guides - Gerar relatório de guias em PDF
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

    // Buscar guias com suas sessões
    const guias = await prisma.guia.findMany({
      include: {
        sessoes: {
          where: startDate && endDate ? {
            dataHora: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          } : {},
          include: {
            reservas: true,
            tour: true,
          },
        },
        reviews: true,
        transacoes: {
          where: startDate && endDate ? {
            data: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          } : {},
        },
      },
    });

    // Processar dados
    const guiasData = guias.map(guia => {
      const totalSessoes = guia.sessoes.length;
      const totalReservas = guia.sessoes.reduce(
        (acc, s) => acc + s.reservas.length,
        0
      );
      const receita = guia.transacoes.reduce((acc, t) => acc + t.valor, 0);
      const mediaNotas = guia.notasMedia || 0;

      return {
        nome: guia.nome,
        idiomas: guia.idiomas,
        totalSessoes,
        totalReservas,
        receita: `R$ ${receita.toFixed(2)}`,
        mediaNotas: mediaNotas.toFixed(1),
        status: guia.status,
      };
    });

    // Calcular resumo
    const totalGuias = guias.length;
    const totalSessoes = guiasData.reduce((acc, g) => acc + g.totalSessoes, 0);
    const totalReservas = guiasData.reduce((acc, g) => acc + g.totalReservas, 0);
    const mediaGeral = guias.reduce((acc, g) => acc + (g.notasMedia || 0), 0) / totalGuias;

    const reportData: ReportData = {
      title: 'Relatório de Guias',
      subtitle: 'Performance e Avaliações',
      period: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate),
      } : undefined,
      columns: [
        { header: 'Guia', dataKey: 'nome' },
        { header: 'Idiomas', dataKey: 'idiomas' },
        { header: 'Sessões', dataKey: 'totalSessoes' },
        { header: 'Reservas', dataKey: 'totalReservas' },
        { header: 'Receita', dataKey: 'receita' },
        { header: 'Média', dataKey: 'mediaNotas' },
        { header: 'Status', dataKey: 'status' },
      ],
      data: guiasData,
      summary: [
        { label: 'Total de Guias', value: totalGuias },
        { label: 'Sessões Realizadas', value: totalSessoes },
        { label: 'Reservas Atendidas', value: totalReservas },
        { label: 'Média Geral de Notas', value: mediaGeral.toFixed(1) },
      ],
    };

    // Gerar PDF
    const pdfBuffer = await pdfReportGenerator.generateGuidesReport(reportData);

    // Log da ação
    await AuditLogger.logDataExport(
      session.user.id,
      'guides_pdf',
      guiasData.length,
      req.headers.get('x-forwarded-for') || undefined
    );

    // Retornar PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-guias-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de guias:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
