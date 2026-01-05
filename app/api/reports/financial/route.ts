import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pdfReportGenerator, ReportData } from '@/lib/reports/pdf-generator';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';
import { hasPermission, Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// POST /api/reports/financial - Gerar relatório financeiro em PDF
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

    // Buscar transações
    const transacoes = await prisma.transacao.findMany({
      where: startDate && endDate ? {
        data: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      } : {},
      include: {
        guia: true,
        sessaoTour: {
          include: {
            tour: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });

    // Processar dados
    const transacoesData = transacoes.map(t => ({
      data: format(t.data, 'dd/MM/yyyy', { locale: ptBR }),
      tipo: t.tipo,
      descricao: t.descricao || '-',
      guia: t.guia?.nome || '-',
      tour: t.sessaoTour?.tour?.nome || '-',
      valor: `${t.moeda} ${t.valor.toFixed(2)}`,
    }));

    // Calcular resumo
    const receita = transacoes
      .filter(t => t.tipo === 'BALANCO' || t.tipo === 'GORJETA')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesas = transacoes
      .filter(t => t.tipo === 'AJUSTE' && t.valor < 0)
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);

    const lucro = receita - despesas;

    const reportData: ReportData = {
      title: 'Relatório Financeiro',
      subtitle: 'Receitas, Despesas e Transações',
      period: startDate && endDate ? {
        start: new Date(startDate),
        end: new Date(endDate),
      } : undefined,
      columns: [
        { header: 'Data', dataKey: 'data' },
        { header: 'Tipo', dataKey: 'tipo' },
        { header: 'Descrição', dataKey: 'descricao' },
        { header: 'Guia', dataKey: 'guia' },
        { header: 'Tour', dataKey: 'tour' },
        { header: 'Valor', dataKey: 'valor' },
      ],
      data: transacoesData,
      summary: [
        { label: '💰 Receita Total', value: `R$ ${receita.toFixed(2)}` },
        { label: '💸 Despesas Totais', value: `R$ ${despesas.toFixed(2)}` },
        { label: '📊 Lucro Líquido', value: `R$ ${lucro.toFixed(2)}` },
        { label: '📈 Total de Transações', value: transacoes.length },
      ],
    };

    // Gerar PDF
    const pdfBuffer = await pdfReportGenerator.generateFinancialReport(reportData);

    // Log da ação
    await AuditLogger.logDataExport(
      session.user.id,
      'financial_pdf',
      transacoesData.length,
      req.headers.get('x-forwarded-for') || undefined
    );

    // Retornar PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório financeiro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
