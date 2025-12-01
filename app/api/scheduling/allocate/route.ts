import { NextResponse } from 'next/server';
import { sugerirGuiasParaSessao, verificarDisponibilidadeGuia, otimizarAlocacaoSemanal } from '@/lib/scheduling/smart-allocation';
import { requirePermission } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';

export async function GET(request: Request) {
  // Apenas admin pode acessar otimização de alocação
  const { error: authError } = await requirePermission(Permission.ALLOCATE_GUIDE);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const sessaoId = searchParams.get('sessaoId');
    const guiaId = searchParams.get('guiaId');
    const dataHora = searchParams.get('dataHora');
    const duracaoMin = searchParams.get('duracaoMin');
    const otimizar = searchParams.get('otimizar');

    // Sugerir guias para uma sessão específica
    if (sessaoId) {
      const sugestoes = await sugerirGuiasParaSessao(sessaoId);
      return NextResponse.json({
        success: true,
        data: sugestoes,
      });
    }

    // Verificar disponibilidade de um guia
    if (guiaId && dataHora && duracaoMin) {
      const disponibilidade = await verificarDisponibilidadeGuia(
        guiaId,
        new Date(dataHora),
        parseInt(duracaoMin)
      );
      return NextResponse.json({
        success: true,
        data: disponibilidade,
      });
    }

    // Otimizar alocação semanal
    if (otimizar === 'semanal') {
      const dataInicio = dataHora ? new Date(dataHora) : new Date();
      const otimizacao = await otimizarAlocacaoSemanal(dataInicio);
      return NextResponse.json({
        success: true,
        data: otimizacao,
      });
    }

    return NextResponse.json(
      { error: 'Parâmetros inválidos' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro na alocação inteligente:', error);
    return NextResponse.json(
      {
        error: 'Erro ao processar alocação',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Apenas admin pode alocar guias
  const { error: authError } = await requirePermission(Permission.ALLOCATE_GUIDE);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { sessaoId, guiaId } = body;

    if (!sessaoId || !guiaId) {
      return NextResponse.json(
        { error: 'sessaoId e guiaId são obrigatórios' },
        { status: 400 }
      );
    }

    // Atualizar a sessão com o guia sugerido
    const { prisma } = await import('@/lib/prisma');
    
    const sessao = await prisma.sessaoTour.update({
      where: { id: sessaoId },
      data: { guiaId },
      include: {
        guia: { select: { nome: true } },
        tour: { select: { nome: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: sessao,
      message: `Guia ${sessao.guia?.nome} alocado com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao alocar guia:', error);
    return NextResponse.json(
      { error: 'Erro ao alocar guia' },
      { status: 500 }
    );
  }
}
