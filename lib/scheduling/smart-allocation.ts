/**
 * Sistema de alocação inteligente de guias para sessões de tour
 */

import { prisma } from '@/lib/prisma';

interface Guia {
  id: string;
  nome: string;
  idiomas: string;
  status: string;
}

interface SessaoTour {
  id: string;
  dataHora: Date;
  duracaoMin: number;
  tour: {
    idiomas: string;
  };
}

interface SugestaoGuia {
  guia: Guia;
  score: number;
  motivos: string[];
  disponivel: boolean;
}

export async function sugerirGuiasParaSessao(
  sessaoId: string
): Promise<SugestaoGuia[]> {
  const sessao = await prisma.sessaoTour.findUnique({
    where: { id: sessaoId },
    include: {
      tour: {
        select: { idiomas: true },
      },
    },
  });

  if (!sessao) {
    throw new Error('Sessão não encontrada');
  }

  // Buscar todos os guias ativos
  const guias = await prisma.guia.findMany({
    where: { status: 'ATIVO' },
    include: {
      sessoes: {
        where: {
          dataHora: {
            gte: new Date(
              sessao.dataHora.getTime() - sessao.duracaoMin * 60 * 1000
            ),
            lte: new Date(
              sessao.dataHora.getTime() + sessao.duracaoMin * 60 * 1000
            ),
          },
          status: { in: ['AGENDADA', 'EM_ANDAMENTO'] },
        },
      },
      reviews: {
        select: { nota: true },
      },
    },
  });

  // Idiomas necessários para o tour
  const idiomasNecessarios = sessao.tour.idiomas.split(',').map((i) => i.trim());

  const sugestoes: SugestaoGuia[] = guias.map((guia) => {
    const idiomasGuia = guia.idiomas.split(',').map((i) => i.trim());
    let score = 0;
    const motivos: string[] = [];

    // Verificar disponibilidade (conflito de horário)
    const disponivel = guia.sessoes.length === 0;
    
    if (!disponivel) {
      motivos.push('Indisponível (sessão no mesmo horário)');
      score -= 1000; // Penalidade severa
    }

    // Verificar compatibilidade de idiomas
    const idiomasCompativeis = idiomasNecessarios.filter((idioma) =>
      idiomasGuia.includes(idioma)
    );

    if (idiomasCompativeis.length === idiomasNecessarios.length) {
      score += 100;
      motivos.push(`Fala todos os idiomas necessários (${idiomasCompativeis.join(', ')})`);
    } else if (idiomasCompativeis.length > 0) {
      score += 50 * idiomasCompativeis.length;
      motivos.push(`Fala ${idiomasCompativeis.length} de ${idiomasNecessarios.length} idiomas`);
    } else {
      score -= 50;
      motivos.push('Não fala os idiomas necessários');
    }

    // Avaliar experiência (total de tours realizados)
    if (guia.totalTours > 50) {
      score += 30;
      motivos.push(`Muito experiente (${guia.totalTours} tours)`);
    } else if (guia.totalTours > 20) {
      score += 20;
      motivos.push(`Experiente (${guia.totalTours} tours)`);
    } else if (guia.totalTours > 5) {
      score += 10;
      motivos.push(`Em desenvolvimento (${guia.totalTours} tours)`);
    }

    // Avaliar avaliações
    if (guia.reviews.length > 0) {
      const mediaNotas =
        guia.reviews.reduce((acc, r) => acc + r.nota, 0) / guia.reviews.length;
      
      if (mediaNotas >= 4.5) {
        score += 25;
        motivos.push(`Excelente avaliação (${mediaNotas.toFixed(1)}★)`);
      } else if (mediaNotas >= 4.0) {
        score += 15;
        motivos.push(`Boa avaliação (${mediaNotas.toFixed(1)}★)`);
      } else if (mediaNotas >= 3.5) {
        score += 5;
        motivos.push(`Avaliação regular (${mediaNotas.toFixed(1)}★)`);
      }
    }

    // Verificar carga de trabalho no dia
    const inicioDia = new Date(sessao.dataHora);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(sessao.dataHora);
    fimDia.setHours(23, 59, 59, 999);

    const sessoesNoDia = guia.sessoes.filter(
      (s) => s.dataHora >= inicioDia && s.dataHora <= fimDia
    ).length;

    if (sessoesNoDia === 0) {
      score += 10;
      motivos.push('Disponível o dia todo');
    } else if (sessoesNoDia === 1) {
      score += 5;
      motivos.push('1 sessão já agendada no dia');
    } else if (sessoesNoDia >= 3) {
      score -= 10;
      motivos.push(`Carga alta (${sessoesNoDia} sessões no dia)`);
    }

    return {
      guia: {
        id: guia.id,
        nome: guia.nome,
        idiomas: guia.idiomas,
        status: guia.status,
      },
      score,
      motivos,
      disponivel,
    };
  });

  // Ordenar por score (maior primeiro)
  return sugestoes.sort((a, b) => b.score - a.score);
}

export async function verificarDisponibilidadeGuia(
  guiaId: string,
  dataHora: Date,
  duracaoMin: number
): Promise<{
  disponivel: boolean;
  conflitos: Array<{
    id: string;
    tourNome: string;
    dataHora: Date;
    duracaoMin: number;
  }>;
}> {
  const inicioJanela = new Date(dataHora.getTime() - duracaoMin * 60 * 1000);
  const fimJanela = new Date(dataHora.getTime() + duracaoMin * 60 * 1000);

  const conflitos = await prisma.sessaoTour.findMany({
    where: {
      guiaId,
      dataHora: {
        gte: inicioJanela,
        lte: fimJanela,
      },
      status: { in: ['AGENDADA', 'EM_ANDAMENTO'] },
    },
    include: {
      tour: {
        select: { nome: true },
      },
    },
  });

  return {
    disponivel: conflitos.length === 0,
    conflitos: conflitos.map((c) => ({
      id: c.id,
      tourNome: c.tour.nome,
      dataHora: c.dataHora,
      duracaoMin: c.duracaoMin,
    })),
  };
}

export async function otimizarAlocacaoSemanal(
  dataInicio: Date
): Promise<{
  sessoesSemGuia: number;
  sugestoesOtimizacao: Array<{
    sessaoId: string;
    guiaId: string;
    tourNome: string;
    dataHora: Date;
    guiaSugerido: string;
    motivo: string;
  }>;
}> {
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + 7);

  // Buscar sessões sem guia
  const sessoesSemGuia = await prisma.sessaoTour.findMany({
    where: {
      guiaId: null,
      dataHora: {
        gte: dataInicio,
        lt: dataFim,
      },
      status: 'AGENDADA',
    },
    include: {
      tour: {
        select: { nome: true, idiomas: true },
      },
    },
    orderBy: { dataHora: 'asc' },
  });

  const sugestoesOtimizacao = [];

  for (const sessao of sessoesSemGuia) {
    const sugestoes = await sugerirGuiasParaSessao(sessao.id);
    const melhorSugestao = sugestoes.find((s) => s.disponivel);

    if (melhorSugestao) {
      sugestoesOtimizacao.push({
        sessaoId: sessao.id,
        guiaId: melhorSugestao.guia.id,
        tourNome: sessao.tour.nome,
        dataHora: sessao.dataHora,
        guiaSugerido: melhorSugestao.guia.nome,
        motivo: melhorSugestao.motivos[0] || 'Melhor opção disponível',
      });
    }
  }

  return {
    sessoesSemGuia: sessoesSemGuia.length,
    sugestoesOtimizacao,
  };
}

export async function gerarRelatorioDisponibilidadeGuias(
  dataInicio: Date,
  dataFim: Date
): Promise<
  Array<{
    guia: { id: string; nome: string };
    totalSessoes: number;
    horasTrabalho: number;
    diasAtivos: number;
    taxaOcupacao: number;
  }>
> {
  const guias = await prisma.guia.findMany({
    where: { status: 'ATIVO' },
    include: {
      sessoes: {
        where: {
          dataHora: {
            gte: dataInicio,
            lte: dataFim,
          },
          status: { in: ['AGENDADA', 'EM_ANDAMENTO', 'COMPLETADA'] },
        },
        select: {
          dataHora: true,
          duracaoMin: true,
        },
      },
    },
  });

  const diasPeriodo = Math.ceil(
    (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
  );

  return guias.map((guia) => {
    const totalSessoes = guia.sessoes.length;
    const horasTrabalho = guia.sessoes.reduce(
      (acc, s) => acc + s.duracaoMin / 60,
      0
    );

    // Contar dias únicos com sessões
    const diasUnicos = new Set(
      guia.sessoes.map((s) => s.dataHora.toDateString())
    );
    const diasAtivos = diasUnicos.size;

    // Taxa de ocupação (assumindo 8 horas úteis por dia)
    const horasDisponiveisPeriodo = diasPeriodo * 8;
    const taxaOcupacao = (horasTrabalho / horasDisponiveisPeriodo) * 100;

    return {
      guia: {
        id: guia.id,
        nome: guia.nome,
      },
      totalSessoes,
      horasTrabalho: Math.round(horasTrabalho * 10) / 10,
      diasAtivos,
      taxaOcupacao: Math.round(taxaOcupacao * 10) / 10,
    };
  });
}
