import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pdfReportGenerator, ReportData } from '@/lib/reports/pdf-generator';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';
import { hasPermission, Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// POST /api/reports/tours - Gerar relatório de tours em PDF
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

    // Buscar dados dos tours
    const tours = await prisma.tour.findMany({
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
          },
        },
      },
    });

    // Processar dados
    const toursData = tours.map(tour => {
      const totalSessoes = tour.sessoes.length;
      const totalReservas = tour.sessoes.reduce(
        (acc, s) => acc + s.reservas.length,
        0
      );
      const receita = tour.sessoes.reduce(
        (acc, s) => acc + s.reservas.reduce((a, r) => a + r.valorTotal, 0),
        0
      );

      return {
        nome: tour.nome,
        totalSessoes,
        totalReservas,
        receita: `R$ ${receita.toFixed(2)}`,
        capacidade: tour.capacidadeMax,
        duracao: `${tour.duracaoMin} min`,
      };
    });

    // Calcular resumo
    const totalTours = tours.length;
    const totalSessoes = toursData.reduce((acc, t) => acc + t.totalSessoes, 0);
    const totalReservas = toursData.reduce((acc, t) => acc + t.totalReservas, 0);
    const receitaTotal = tours.reduce(
      (acc, tour) =>
        acc +
        tour.sessoes.reduce(
          (a, s) => a + s.reservas.reduce((b, r) => b + r.valorTotal, 0),
          0
        ),
      0
    );

    const reportData: ReportData = {
      title: 'Relatório de Tours',
      subtitle: 'Performance e Estatísticas',
      period: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate),
      } : undefined,
      columns: [
        { header: 'Tour', dataKey: 'nome' },
        { header: 'Sessões', dataKey: 'totalSessoes' },
        { header: 'Reservas', dataKey: 'totalReservas' },
        { header: 'Receita', dataKey: 'receita' },
        { header: 'Capacidade', dataKey: 'capacidade' },
        { header: 'Duração', dataKey: 'duracao' },
      ],
      data: toursData,
      summary: [
        { label: 'Total de Tours', value: totalTours },
        { label: 'Total de Sessões', value: totalSessoes },
        { label: 'Total de Reservas', value: totalReservas },
        { label: 'Receita Total', value: `R$ ${receitaTotal.toFixed(2)}` },
      ],
    };

    // Gerar PDF
    const pdfBuffer = await pdfReportGenerator.generateToursReport(reportData);

    // Log da ação
    await AuditLogger.logDataExport(
      session.user.id,
      'tours_pdf',
      toursData.length,
      req.headers.get('x-forwarded-for') || undefined
    );

    // Retornar PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-tours-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de tours:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
