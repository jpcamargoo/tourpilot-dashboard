/**
 * ANÁLISE DE DADOS DO BANCO - Vibrant City Tours
 * 
 * Este script gera um relatório detalhado sobre os dados no banco
 * e mostra exemplos de cada entidade
 */

import { prisma } from '../lib/prisma';

async function analisarDados() {
  console.log('📊 ANÁLISE DE DADOS DO BANCO DE DADOS\n');
  console.log('='.repeat(70));

  try {
    await prisma.$connect();

    // 1. USUÁRIOS
    console.log('\n👥 USUÁRIOS');
    console.log('-'.repeat(70));
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        ativo: true,
        criadoEm: true,
      },
    });
    console.log(`Total: ${usuarios.length} usuários`);
    usuarios.forEach(u => {
      console.log(`  • ${u.nome} (${u.email})`);
      console.log(`    Role: ${u.role} | Ativo: ${u.ativo ? 'Sim' : 'Não'}`);
    });

    // 2. GUIAS
    console.log('\n🎯 GUIAS');
    console.log('-'.repeat(70));
    const guias = await prisma.guia.findMany({
      include: {
        usuario: { select: { email: true } },
        _count: {
          select: { sessoes: true, reviews: true, transacoes: true },
        },
      },
    });
    console.log(`Total: ${guias.length} guias`);
    guias.forEach(g => {
      console.log(`  • ${g.nome}`);
      console.log(`    Email: ${g.usuario.email}`);
      console.log(`    Idiomas: ${g.idiomas} | Status: ${g.status}`);
      console.log(`    Sessões: ${g._count.sessoes} | Reviews: ${g._count.reviews} | Transações: ${g._count.transacoes}`);
      if (g.notasMedia) console.log(`    Nota Média: ${g.notasMedia.toFixed(2)}★`);
    });

    // 3. TOURS
    console.log('\n🎫 TOURS');
    console.log('-'.repeat(70));
    const tours = await prisma.tour.findMany({
      include: {
        _count: { select: { sessoes: true, reviews: true } },
      },
    });
    console.log(`Total: ${tours.length} tours`);
    tours.forEach(t => {
      console.log(`  • ${t.nome}`);
      console.log(`    Duração: ${t.duracaoMin}min | Preço: €${t.precoBase} | Cap: ${t.capacidadeMax} pessoas`);
      console.log(`    Idiomas: ${t.idiomas} | Ativo: ${t.ativo ? 'Sim' : 'Não'}`);
      console.log(`    Sessões: ${t._count.sessoes} | Reviews: ${t._count.reviews}`);
    });

    // 4. SESSÕES
    console.log('\n📅 SESSÕES DE TOUR');
    console.log('-'.repeat(70));
    const sessoes = await prisma.sessaoTour.findMany({
      include: {
        tour: { select: { nome: true } },
        guia: { select: { nome: true } },
        pontoEncontro: { select: { nome: true } },
        _count: { select: { reservas: true } },
      },
      orderBy: { dataHora: 'desc' },
      take: 10,
    });
    console.log(`Total: ${sessoes.length} sessões (últimas 10)`);
    sessoes.forEach(s => {
      console.log(`  • ${s.tour.nome}`);
      console.log(`    Data: ${s.dataHora.toLocaleString('pt-BR')} | Status: ${s.status}`);
      console.log(`    Guia: ${s.guia?.nome || 'Não alocado'}`);
      console.log(`    Ponto: ${s.pontoEncontro?.nome || 'Não definido'}`);
      console.log(`    Reservas: ${s._count.reservas}`);
    });

    // 5. RESERVAS
    console.log('\n📋 RESERVAS');
    console.log('-'.repeat(70));
    const reservas = await prisma.reserva.findMany({
      include: {
        visitante: { select: { nome: true, email: true, pais: true } },
        sessaoTour: {
          select: {
            tour: { select: { nome: true } },
            dataHora: true,
          },
        },
      },
      take: 10,
    });
    console.log(`Total: ${reservas.length} reservas (últimas 10)`);
    
    const porStatus = await prisma.reserva.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    console.log('\nPor Status:');
    porStatus.forEach(s => {
      console.log(`  • ${s.status}: ${s._count.status}`);
    });

    reservas.forEach(r => {
      console.log(`\n  • Reserva #${r.id.substring(0, 8)}`);
      console.log(`    Visitante: ${r.visitante?.nome || 'N/A'} (${r.visitante?.pais || 'N/A'})`);
      console.log(`    Tour: ${r.sessaoTour.tour.nome}`);
      console.log(`    Data: ${r.sessaoTour.dataHora.toLocaleString('pt-BR')}`);
      console.log(`    Status: ${r.status} | Pessoas: ${r.numPessoas} | Valor: €${r.valorTotal}`);
    });

    // 6. VISITANTES
    console.log('\n🌍 VISITANTES');
    console.log('-'.repeat(70));
    const visitantes = await prisma.visitante.findMany({
      include: {
        _count: { select: { reservas: true } },
      },
    });
    console.log(`Total: ${visitantes.length} visitantes`);
    
    const porPais = await prisma.visitante.groupBy({
      by: ['pais'],
      _count: { pais: true },
      where: { pais: { not: null } },
    });
    console.log('\nPor País:');
    porPais.forEach(p => {
      console.log(`  • ${p.pais}: ${p._count.pais}`);
    });

    const porIdioma = await prisma.visitante.groupBy({
      by: ['idioma'],
      _count: { idioma: true },
      where: { idioma: { not: null } },
    });
    console.log('\nPor Idioma:');
    porIdioma.forEach(i => {
      console.log(`  • ${i.idioma}: ${i._count.idioma}`);
    });

    // 7. REVIEWS
    console.log('\n⭐ REVIEWS');
    console.log('-'.repeat(70));
    const reviews = await prisma.review.findMany({
      include: {
        tour: { select: { nome: true } },
        guia: { select: { nome: true } },
      },
      orderBy: { dataPublicacao: 'desc' },
      take: 10,
    });
    console.log(`Total: ${reviews.length} reviews (últimas 10)`);
    
    const stats = await prisma.review.aggregate({
      _avg: { nota: true },
      _min: { nota: true },
      _max: { nota: true },
    });
    console.log(`Média Geral: ${stats._avg.nota?.toFixed(2)}★`);
    console.log(`Mínima: ${stats._min.nota}★ | Máxima: ${stats._max.nota}★`);

    const porFonte = await prisma.review.groupBy({
      by: ['fonte'],
      _count: { fonte: true },
    });
    console.log('\nPor Fonte:');
    porFonte.forEach(f => {
      console.log(`  • ${f.fonte}: ${f._count.fonte}`);
    });

    const porSentimento = await prisma.review.groupBy({
      by: ['sentimento'],
      _count: { sentimento: true },
      where: { sentimento: { not: null } },
    });
    console.log('\nPor Sentimento:');
    porSentimento.forEach(s => {
      console.log(`  • ${s.sentimento}: ${s._count.sentimento}`);
    });

    // 8. TRANSAÇÕES
    console.log('\n💰 TRANSAÇÕES FINANCEIRAS');
    console.log('-'.repeat(70));
    const transacoes = await prisma.transacao.findMany({
      include: {
        guia: { select: { nome: true } },
      },
      orderBy: { data: 'desc' },
      take: 10,
    });
    console.log(`Total: ${transacoes.length} transações (últimas 10)`);
    
    const porTipo = await prisma.transacao.groupBy({
      by: ['tipo'],
      _sum: { valor: true },
      _count: { tipo: true },
    });
    console.log('\nPor Tipo:');
    porTipo.forEach(t => {
      console.log(`  • ${t.tipo}: ${t._count.tipo} transações | Total: €${t._sum.valor?.toFixed(2)}`);
    });

    transacoes.forEach(t => {
      console.log(`\n  • ${t.tipo} - €${t.valor.toFixed(2)}`);
      console.log(`    Guia: ${t.guia?.nome || 'N/A'}`);
      console.log(`    Data: ${t.data.toLocaleString('pt-BR')}`);
      if (t.descricao) console.log(`    Descrição: ${t.descricao}`);
    });

    // 9. PONTOS DE ENCONTRO
    console.log('\n📍 PONTOS DE ENCONTRO');
    console.log('-'.repeat(70));
    const pontos = await prisma.pontoEncontro.findMany({
      include: {
        _count: { select: { sessoes: true } },
      },
    });
    console.log(`Total: ${pontos.length} pontos`);
    pontos.forEach(p => {
      console.log(`  • ${p.nome}`);
      console.log(`    Endereço: ${p.endereco}`);
      if (p.latitude && p.longitude) {
        console.log(`    Coordenadas: ${p.latitude}, ${p.longitude}`);
      }
      console.log(`    Sessões agendadas: ${p._count.sessoes}`);
    });

    // 10. LOGS ETL
    console.log('\n📝 LOGS DE ETL');
    console.log('-'.repeat(70));
    const logs = await prisma.logETL.findMany({
      orderBy: { iniciado: 'desc' },
      take: 5,
    });
    console.log(`Total: ${logs.length} logs (últimos 5)`);
    logs.forEach(l => {
      console.log(`\n  • ${l.tipo.toUpperCase()} - ${l.status}`);
      console.log(`    Iniciado: ${l.iniciado.toLocaleString('pt-BR')}`);
      if (l.finalizado) console.log(`    Finalizado: ${l.finalizado.toLocaleString('pt-BR')}`);
      console.log(`    Total: ${l.totalRegistros} | Novos: ${l.novos} | Atualizados: ${l.atualizados} | Erros: ${l.erros}`);
      if (l.mensagem) console.log(`    Mensagem: ${l.mensagem}`);
    });

    // RESUMO FINAL
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO GERAL');
    console.log('='.repeat(70));
    
    const totais = {
      usuarios: await prisma.usuario.count(),
      guias: await prisma.guia.count(),
      tours: await prisma.tour.count(),
      sessoes: await prisma.sessaoTour.count(),
      reservas: await prisma.reserva.count(),
      visitantes: await prisma.visitante.count(),
      reviews: await prisma.review.count(),
      transacoes: await prisma.transacao.count(),
      pontos: await prisma.pontoEncontro.count(),
      logs: await prisma.logETL.count(),
    };

    const total = Object.values(totais).reduce((a, b) => a + b, 0);

    console.log(`\n✅ Total de registros no banco: ${total}`);
    console.log(`\n📋 Detalhamento:`);
    Object.entries(totais).forEach(([key, value]) => {
      console.log(`   • ${key}: ${value}`);
    });

    console.log('\n🎯 Status do Sistema: OPERACIONAL');
    console.log('💾 Banco de dados: Supabase PostgreSQL');
    console.log('🔗 Conexão: Ativa\n');

  } catch (error) {
    console.error('❌ Erro ao analisar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analisarDados()
  .then(() => {
    console.log('✅ Análise concluída!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
