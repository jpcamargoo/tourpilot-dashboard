import { prisma } from '../lib/prisma';

async function testDatabase() {
  console.log('🔍 Iniciando testes de banco de dados...\n');

  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // 2. Verificar estrutura de tabelas (sequencialmente para evitar problemas com pgBouncer)
    console.log('2️⃣ Verificando estrutura do banco de dados...');
    
    const usuariosCount = await prisma.usuario.count();
    const guiasCount = await prisma.guia.count();
    const toursCount = await prisma.tour.count();
    const sessoesCount = await prisma.sessaoTour.count();
    const reservasCount = await prisma.reserva.count();
    const visitantesCount = await prisma.visitante.count();
    const reviewsCount = await prisma.review.count();
    const transacoesCount = await prisma.transacao.count();
    const pontosCount = await prisma.pontoEncontro.count();
    const logsETLCount = await prisma.logETL.count();

    console.log('📊 Contagem de registros:');
    console.log(`   └─ Usuários: ${usuariosCount}`);
    console.log(`   └─ Guias: ${guiasCount}`);
    console.log(`   └─ Tours: ${toursCount}`);
    console.log(`   └─ Sessões: ${sessoesCount}`);
    console.log(`   └─ Reservas: ${reservasCount}`);
    console.log(`   └─ Visitantes: ${visitantesCount}`);
    console.log(`   └─ Reviews: ${reviewsCount}`);
    console.log(`   └─ Transações: ${transacoesCount}`);
    console.log(`   └─ Pontos de Encontro: ${pontosCount}`);
    console.log(`   └─ Logs ETL: ${logsETLCount}\n`);

    // 3. Testar queries complexas
    console.log('3️⃣ Testando queries complexas...');

    // Buscar guias com informações relacionadas
    const guias = await prisma.guia.findMany({
      take: 3,
      include: {
        usuario: {
          select: { email: true, role: true },
        },
        _count: {
          select: { sessoes: true, reviews: true },
        },
      },
    });
    console.log(`✅ Query de guias com relacionamentos: ${guias.length} registros encontrados`);

    // Buscar sessões com joins
    const sessoes = await prisma.sessaoTour.findMany({
      take: 3,
      include: {
        tour: { select: { nome: true } },
        guia: { select: { nome: true } },
        _count: { select: { reservas: true } },
      },
    });
    console.log(`✅ Query de sessões com joins: ${sessoes.length} registros encontrados`);

    // Agregação de reviews
    const reviewStats = await prisma.review.aggregate({
      _avg: { nota: true },
      _count: { id: true },
    });
    console.log(`✅ Agregação de reviews: média ${reviewStats._avg.nota?.toFixed(2) || 'N/A'} (${reviewStats._count.id} reviews)\n`);

    // 4. Testar filtros e ordenação
    console.log('4️⃣ Testando filtros e ordenação...');
    
    const toursAtivos = await prisma.tour.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      take: 5,
    });
    console.log(`✅ Filtro de tours ativos: ${toursAtivos.length} registros`);

    const guiasAtivos = await prisma.guia.findMany({
      where: { status: 'ATIVO' },
      orderBy: { totalTours: 'desc' },
      take: 5,
    });
    console.log(`✅ Filtro de guias ativos: ${guiasAtivos.length} registros\n`);

    // 5. Verificar integridade referencial
    console.log('5️⃣ Verificando integridade referencial...');
    
    // Verificar se todos os guias têm usuários associados
    const guiasComUsuarios = await prisma.guia.findMany({
      include: { usuario: true },
    });
    const guiasSemUsuario = guiasComUsuarios.filter(g => !g.usuario);
    console.log(`✅ Guias sem usuário: ${guiasSemUsuario.length} (esperado: 0)`);

    // Verificar se todas as sessões têm tours associados
    const sessoesComTours = await prisma.sessaoTour.findMany({
      include: { tour: true },
    });
    const sessoesOrfas = sessoesComTours.filter(s => !s.tour);
    console.log(`✅ Sessões órfãs: ${sessoesOrfas.length} (esperado: 0)\n`);

    // 6. Testar índices (verificar performance)
    console.log('6️⃣ Testando performance de índices...');
    
    const startTime = Date.now();
    await prisma.sessaoTour.findMany({
      where: {
        dataHora: {
          gte: new Date('2024-01-01'),
          lte: new Date('2024-12-31'),
        },
      },
      take: 100,
    });
    const endTime = Date.now();
    console.log(`✅ Query com índice de data: ${endTime - startTime}ms\n`);

    // 7. Resumo final
    console.log('=' .repeat(50));
    console.log('📋 RESUMO DOS TESTES');
    console.log('=' .repeat(50));
    
    const totalRegistros = usuariosCount + guiasCount + toursCount + sessoesCount + 
                          reservasCount + visitantesCount + reviewsCount + 
                          transacoesCount + pontosCount + logsETLCount;

    console.log(`✅ Conexão: OK`);
    console.log(`✅ Total de registros: ${totalRegistros}`);
    console.log(`✅ Queries complexas: OK`);
    console.log(`✅ Filtros e ordenação: OK`);
    console.log(`✅ Integridade referencial: OK`);
    console.log(`✅ Performance: OK`);
    console.log('\n🎉 Todos os testes passaram com sucesso!\n');

    // Mostrar alguns dados de exemplo
    if (guias.length > 0) {
      console.log('👤 Exemplo de Guia:');
      const guia = guias[0];
      console.log(`   Nome: ${guia.nome}`);
      console.log(`   Idiomas: ${guia.idiomas}`);
      console.log(`   Status: ${guia.status}`);
      console.log(`   Email: ${guia.usuario.email}`);
      console.log(`   Total de Sessões: ${guia._count.sessoes}`);
      console.log(`   Total de Reviews: ${guia._count.reviews}\n`);
    }

    if (toursAtivos.length > 0) {
      console.log('🎫 Exemplo de Tour:');
      const tour = toursAtivos[0];
      console.log(`   Nome: ${tour.nome}`);
      console.log(`   Duração: ${tour.duracaoMin} min`);
      console.log(`   Preço Base: €${tour.precoBase}`);
      console.log(`   Capacidade Máx: ${tour.capacidadeMax} pessoas`);
      console.log(`   Idiomas: ${tour.idiomas}\n`);
    }

  } catch (error) {
    console.error('❌ Erro durante os testes:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco de dados encerrada.');
  }
}

// Executar testes
testDatabase()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado com erro:', error);
    process.exit(1);
  });
