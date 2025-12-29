/**
 * Script de Análise de Performance
 * Executa testes e gera relatório de métricas
 * 
 * Uso: npx ts-node scripts/analisar-performance.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
}

const queries: QueryMetrics[] = [];

// Capturar queries
(prisma as any).$on('query', (e: any) => {
  queries.push({
    query: e.query.substring(0, 100), // Primeiros 100 chars
    duration: e.duration,
    timestamp: new Date(),
  });
});

async function testDashboardQueries() {
  console.log('🔍 Testando queries do Dashboard...\n');

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const startTime = Date.now();

  // Simular queries da página principal
  await Promise.all([
    prisma.visitante.count({
      where: { criadoEm: { gte: inicioMes } },
    }),
    prisma.reserva.count({
      where: { dataReserva: { gte: inicioMes } },
    }),
    prisma.review.aggregate({
      _avg: { nota: true },
    }),
    prisma.sessaoTour.findMany({
      where: {
        dataHora: { gte: hoje },
        status: 'AGENDADA',
      },
      select: {
        id: true,
        dataHora: true,
        tour: { select: { nome: true } },
        guia: { select: { nome: true } },
      },
      take: 10,
    }),
  ]);

  const duration = Date.now() - startTime;

  console.log(`✅ Dashboard queries completadas em ${duration}ms`);
  console.log(`📊 Total de queries executadas: ${queries.length}\n`);

  return { duration, queryCount: queries.length };
}

async function testFinancialQueries() {
  console.log('💰 Testando queries da página Financial...\n');

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  queries.length = 0; // Reset contador
  const startTime = Date.now();

  // Simular queries otimizadas
  await Promise.all([
    prisma.sessaoTour.findMany({
      where: {
        status: 'COMPLETADA',
        dataHora: { gte: inicioMes },
      },
      select: {
        tour: {
          select: { precoBase: true, nome: true },
        },
        _count: {
          select: { reservas: true },
        },
      },
    }),
    prisma.transacao.findMany({
      where: { data: { gte: inicioMes } },
      select: {
        id: true,
        data: true,
        tipo: true,
        valor: true,
        guia: { select: { nome: true } },
      },
      take: 100,
    }),
  ]);

  const duration = Date.now() - startTime;

  console.log(`✅ Financial queries completadas em ${duration}ms`);
  console.log(`📊 Total de queries executadas: ${queries.length}\n`);

  return { duration, queryCount: queries.length };
}

async function analyzeQueryPerformance() {
  console.log('📈 Analisando performance das queries...\n');

  const slowQueries = queries.filter((q) => q.duration > 100);
  const avgDuration = queries.reduce((sum, q) => sum + q.duration, 0) / queries.length;
  const maxDuration = Math.max(...queries.map((q) => q.duration));

  console.log('📊 Estatísticas:');
  console.log(`   - Queries executadas: ${queries.length}`);
  console.log(`   - Duração média: ${avgDuration.toFixed(2)}ms`);
  console.log(`   - Duração máxima: ${maxDuration}ms`);
  console.log(`   - Queries lentas (>100ms): ${slowQueries.length}\n`);

  if (slowQueries.length > 0) {
    console.log('⚠️  Queries lentas detectadas:');
    slowQueries.forEach((q) => {
      console.log(`   - ${q.duration}ms: ${q.query}...`);
    });
    console.log();
  }

  // Análise de recomendações
  console.log('💡 Recomendações:');

  if (avgDuration > 50) {
    console.log('   ⚠️  Duração média alta - considere adicionar índices');
  } else {
    console.log('   ✅ Duração média ótima');
  }

  if (slowQueries.length > 0) {
    console.log('   ⚠️  Queries lentas detectadas - revise otimizações');
  } else {
    console.log('   ✅ Nenhuma query lenta detectada');
  }

  if (queries.length > 20) {
    console.log('   ⚠️  Muitas queries - considere consolidação');
  } else {
    console.log('   ✅ Número de queries adequado');
  }

  console.log();
}

async function testDatabaseConnection() {
  console.log('🔌 Testando conexão com banco de dados...\n');

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - startTime;

    console.log(`✅ Conexão estabelecida em ${duration}ms\n`);

    if (duration > 100) {
      console.log('⚠️  Latência alta - verifique conexão de rede\n');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    return false;
  }
}

async function testCacheEffectiveness() {
  console.log('🗃️  Testando efetividade do cache...\n');

  // Primeira execução (sem cache)
  const start1 = Date.now();
  await prisma.tour.findMany({ select: { id: true, nome: true } });
  const duration1 = Date.now() - start1;

  // Segunda execução (potencialmente com cache)
  const start2 = Date.now();
  await prisma.tour.findMany({ select: { id: true, nome: true } });
  const duration2 = Date.now() - start2;

  console.log(`   - Primeira execução: ${duration1}ms`);
  console.log(`   - Segunda execução: ${duration2}ms`);

  if (duration2 < duration1 * 0.5) {
    console.log('   ✅ Cache funcionando bem\n');
  } else {
    console.log('   ⚠️  Cache pode não estar ativo\n');
  }
}

async function generateReport() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 RELATÓRIO DE ANÁLISE DE PERFORMANCE');
  console.log('═══════════════════════════════════════════════════════\n');

  // Testes
  const dbConnected = await testDatabaseConnection();

  if (!dbConnected) {
    console.log('❌ Não foi possível conectar ao banco. Abortando testes.\n');
    return;
  }

  await testCacheEffectiveness();

  const dashboardMetrics = await testDashboardQueries();
  const financialMetrics = await testFinancialQueries();

  await analyzeQueryPerformance();

  // Resumo Final
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 RESUMO FINAL');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Dashboard:');
  console.log(`   - Tempo total: ${dashboardMetrics.duration}ms`);
  console.log(`   - Queries: ${dashboardMetrics.queryCount}`);
  console.log(
    `   - Status: ${dashboardMetrics.duration < 1000 ? '✅ Rápido' : '⚠️  Pode melhorar'}\n`
  );

  console.log('Financial:');
  console.log(`   - Tempo total: ${financialMetrics.duration}ms`);
  console.log(`   - Queries: ${financialMetrics.queryCount}`);
  console.log(
    `   - Status: ${financialMetrics.duration < 1000 ? '✅ Rápido' : '⚠️  Pode melhorar'}\n`
  );

  // Score geral
  const totalDuration = dashboardMetrics.duration + financialMetrics.duration;
  const totalQueries = dashboardMetrics.queryCount + financialMetrics.queryCount;

  let score = 100;
  if (totalDuration > 2000) score -= 20;
  if (totalDuration > 3000) score -= 30;
  if (totalQueries > 30) score -= 20;
  if (queries.filter((q) => q.duration > 100).length > 0) score -= 15;

  console.log(`🎯 Score de Performance: ${Math.max(0, score)}/100\n`);

  if (score >= 80) {
    console.log('✅ Performance excelente!\n');
  } else if (score >= 60) {
    console.log('⚠️  Performance aceitável, mas há espaço para melhorias.\n');
  } else {
    console.log('❌ Performance precisa de atenção urgente.\n');
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

// Executar relatório
generateReport()
  .catch((error) => {
    console.error('❌ Erro ao gerar relatório:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
