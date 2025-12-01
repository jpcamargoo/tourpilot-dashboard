import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin com senha hasheada
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@vibrantcitytours.com' },
    update: {},
    create: {
      email: 'admin@vibrantcitytours.com',
      nome: 'Administrador',
      role: 'ADMIN',
      senha: hashedPassword,
    },
  });

  console.log('✅ Usuário admin criado (senha: admin123)');

  // Criar usuários e guias
  const hashedPasswordGuia = await bcrypt.hash('guia123', 10);
  
  const usuarioGuia1 = await prisma.usuario.upsert({
    where: { email: 'joao@vibrantcitytours.com' },
    update: {},
    create: {
      email: 'joao@vibrantcitytours.com',
      nome: 'João Silva',
      role: 'GUIA',
      senha: hashedPasswordGuia,
    },
  });

  const usuarioGuia2 = await prisma.usuario.upsert({
    where: { email: 'maria@vibrantcitytours.com' },
    update: {},
    create: {
      email: 'maria@vibrantcitytours.com',
      nome: 'Maria Santos',
      role: 'GUIA',
      senha: hashedPasswordGuia,
    },
  });

  const usuarioGuia3 = await prisma.usuario.upsert({
    where: { email: 'pedro@vibrantcitytours.com' },
    update: {},
    create: {
      email: 'pedro@vibrantcitytours.com',
      nome: 'Pedro Costa',
      role: 'GUIA',
      senha: hashedPasswordGuia,
    },
  });

  const guia1 = await prisma.guia.upsert({
    where: { usuarioId: usuarioGuia1.id },
    update: {},
    create: {
      usuarioId: usuarioGuia1.id,
      nome: 'João Silva',
      idiomas: 'PT,EN,ES',
      telefone: '+351912345678',
      status: 'ATIVO',
      notasMedia: 4.8,
      totalTours: 156,
    },
  });

  const guia2 = await prisma.guia.upsert({
    where: { usuarioId: usuarioGuia2.id },
    update: {},
    create: {
      usuarioId: usuarioGuia2.id,
      nome: 'Maria Santos',
      idiomas: 'PT,EN,FR',
      telefone: '+351923456789',
      status: 'ATIVO',
      notasMedia: 4.9,
      totalTours: 203,
    },
  });

  const guia3 = await prisma.guia.upsert({
    where: { usuarioId: usuarioGuia3.id },
    update: {},
    create: {
      usuarioId: usuarioGuia3.id,
      nome: 'Pedro Costa',
      idiomas: 'PT,EN,ES,IT',
      telefone: '+351934567890',
      status: 'FERIAS',
      notasMedia: 4.7,
      totalTours: 89,
    },
  });

  console.log('✅ 3 Guias criados (senhas: guia123)');

  // Criar tours
  const tour1 = await prisma.tour.create({
    data: {
      nome: 'Free Walking Tour Lisboa',
      descricao: 'Tour a pé pelos bairros históricos de Lisboa',
      duracaoMin: 180,
      precoBase: 0,
      capacidadeMax: 25,
      idiomas: 'pt,en,es,fr',
    },
  });

  const tour2 = await prisma.tour.create({
    data: {
      nome: 'Food Tour Alfama',
      descricao: 'Experiência gastronômica em Alfama',
      duracaoMin: 150,
      precoBase: 45,
      capacidadeMax: 15,
      idiomas: 'pt,en',
    },
  });

  const tour3 = await prisma.tour.create({
    data: {
      nome: 'Sunset Tour Belém',
      descricao: 'Tour ao entardecer pelos monumentos de Belém',
      duracaoMin: 120,
      precoBase: 30,
      capacidadeMax: 20,
      idiomas: 'pt,en,es',
    },
  });

  const tour4 = await prisma.tour.create({
    data: {
      nome: 'Fado Night Experience',
      descricao: 'Noite de Fado com jantar incluído',
      duracaoMin: 180,
      precoBase: 75,
      capacidadeMax: 30,
      idiomas: 'pt,en,fr,es',
    },
  });

  const tour5 = await prisma.tour.create({
    data: {
      nome: 'Sintra Day Trip',
      descricao: 'Tour de dia inteiro em Sintra e Cascais',
      duracaoMin: 480,
      precoBase: 120,
      capacidadeMax: 12,
      idiomas: 'pt,en',
    },
  });

  console.log('✅ 5 Tours criados');

  // Criar pontos de encontro
  const ponto1 = await prisma.pontoEncontro.upsert({
    where: { id: 'ponto-comercio' },
    update: {},
    create: {
      id: 'ponto-comercio',
      nome: 'Praça do Comércio',
      endereco: 'Praça do Comércio, 1100-148 Lisboa',
      latitude: 38.7077,
      longitude: -9.1365,
      instrucoes: 'Em frente à estátua de D. José I, lado sul da praça',
    },
  });

  const ponto2 = await prisma.pontoEncontro.upsert({
    where: { id: 'ponto-rossio' },
    update: {},
    create: {
      id: 'ponto-rossio',
      nome: 'Praça Rossio',
      endereco: 'Praça Dom Pedro IV, 1100-200 Lisboa',
      latitude: 38.7139,
      longitude: -9.1394,
      instrucoes: 'Ao lado da fonte central, próximo ao Teatro Nacional',
    },
  });

  const ponto3 = await prisma.pontoEncontro.upsert({
    where: { id: 'ponto-belem' },
    update: {},
    create: {
      id: 'ponto-belem',
      nome: 'Torre de Belém',
      endereco: 'Av. Brasília, 1400-038 Lisboa',
      latitude: 38.6916,
      longitude: -9.2160,
      instrucoes: 'Entrada principal da Torre, lado oeste',
    },
  });

  console.log('✅ 3 Pontos de encontro criados');

  // Criar sessões de tour (próximos 7 dias)
  const hoje = new Date();
  const sessoes = [];

  // Amanhã 10h - Free Walking Tour com João
  const amanha10h = new Date(hoje);
  amanha10h.setDate(amanha10h.getDate() + 1);
  amanha10h.setHours(10, 0, 0, 0);

  const sessao1 = await prisma.sessaoTour.create({
    data: {
      tourId: tour1.id,
      guiaId: guia1.id,
      pontoEncontroId: ponto1.id,
      dataHora: amanha10h,
      duracaoMin: 180,
      capacidadeMax: 25,
      status: 'AGENDADA',
      observacoes: 'Tour em português e inglês',
    },
  });
  sessoes.push(sessao1);

  // Amanhã 15h - Food Tour com Maria
  const amanha15h = new Date(hoje);
  amanha15h.setDate(amanha15h.getDate() + 1);
  amanha15h.setHours(15, 0, 0, 0);

  const sessao2 = await prisma.sessaoTour.create({
    data: {
      tourId: tour2.id,
      guiaId: guia2.id,
      pontoEncontroId: ponto2.id,
      dataHora: amanha15h,
      duracaoMin: 150,
      capacidadeMax: 15,
      status: 'AGENDADA',
    },
  });
  sessoes.push(sessao2);

  // Depois de amanhã 11h - Sunset Tour SEM GUIA (para testar alocação)
  const depoisAmanha = new Date(hoje);
  depoisAmanha.setDate(depoisAmanha.getDate() + 2);
  depoisAmanha.setHours(11, 0, 0, 0);

  const sessao3 = await prisma.sessaoTour.create({
    data: {
      tourId: tour3.id,
      guiaId: null, // SEM GUIA - sistema vai sugerir
      pontoEncontroId: ponto3.id,
      dataHora: depoisAmanha,
      duracaoMin: 120,
      capacidadeMax: 20,
      status: 'AGENDADA',
      observacoes: 'ALERTA: Sessão sem guia alocado',
    },
  });
  sessoes.push(sessao3);

  // Daqui 3 dias - Free Walking Tour
  const daqui3dias = new Date(hoje);
  daqui3dias.setDate(daqui3dias.getDate() + 3);
  daqui3dias.setHours(10, 0, 0, 0);

  const sessao4 = await prisma.sessaoTour.create({
    data: {
      tourId: tour1.id,
      guiaId: guia2.id,
      pontoEncontroId: ponto1.id,
      dataHora: daqui3dias,
      duracaoMin: 180,
      capacidadeMax: 25,
      status: 'AGENDADA',
    },
  });
  sessoes.push(sessao4);

  console.log('✅ 4 Sessões criadas (próximos 3 dias)');

  // Criar visitantes de exemplo
  const visitante1 = await prisma.visitante.create({
    data: {
      nome: 'Maria Santos',
      email: 'maria@example.com',
      telefone: '+5511999999999',
      idioma: 'pt',
      pais: 'BR',
      cidade: 'São Paulo',
    },
  });

  const visitante2 = await prisma.visitante.create({
    data: {
      nome: 'John Smith',
      email: 'john@example.com',
      telefone: '+14155551234',
      idioma: 'en',
      pais: 'US',
      cidade: 'San Francisco',
    },
  });

  console.log('✅ Visitantes criados');

  // Criar reservas (várias para testar ocupação)
  await prisma.reserva.create({
    data: {
      sessaoTourId: sessao1.id,
      visitanteId: visitante1.id,
      status: 'CONFIRMADA',
      numPessoas: 2,
      valorTotal: 0,
      origem: 'website',
      refExterna: 'WEB-001',
      dataReserva: new Date(),
    },
  });

  await prisma.reserva.create({
    data: {
      sessaoTourId: sessao1.id,
      visitanteId: visitante2.id,
      status: 'CONFIRMADA',
      numPessoas: 1,
      valorTotal: 0,
      origem: 'getyourguide',
      refExterna: 'GYG-123456',
      dataReserva: new Date(),
    },
  });

  // Mais reservas para sessao1 (simular boa ocupação)
  const visitante3 = await prisma.visitante.create({
    data: {
      nome: 'Pierre Dubois',
      email: 'pierre@example.com',
      idioma: 'fr',
      pais: 'FR',
      cidade: 'Paris',
    },
  });

  await prisma.reserva.create({
    data: {
      sessaoTourId: sessao1.id,
      visitanteId: visitante3.id,
      status: 'CONFIRMADA',
      numPessoas: 4,
      valorTotal: 0,
      origem: 'getyourguide',
      refExterna: 'GYG-123457',
      dataReserva: new Date(),
    },
  });

  // Reserva para Food Tour
  await prisma.reserva.create({
    data: {
      sessaoTourId: sessao2.id,
      visitanteId: visitante1.id,
      status: 'CONFIRMADA',
      numPessoas: 2,
      valorTotal: 90,
      origem: 'viator',
      refExterna: 'VIA-789',
      dataReserva: new Date(),
    },
  });

  // Reserva BAIXA ocupação para sessão sem guia (para testar alerta)
  await prisma.reserva.create({
    data: {
      sessaoTourId: sessao3.id,
      visitanteId: visitante2.id,
      status: 'CONFIRMADA',
      numPessoas: 2,
      valorTotal: 60,
      origem: 'website',
      refExterna: 'WEB-002',
      dataReserva: new Date(),
    },
  });

  console.log('✅ 5 Reservas criadas (ocupação variada)');

  // Criar reviews
  const dataReview1 = new Date();
  dataReview1.setDate(dataReview1.getDate() - 5);

  await prisma.review.create({
    data: {
      fonte: 'google',
      refExterna: 'GOOGLE-001',
      tourId: tour1.id,
      guiaId: guia1.id,
      nomeAutor: 'Ana Costa',
      nota: 5.0,
      comentario: 'Tour incrível! O guia João foi excelente e muito informativo. Aprendemos muito sobre a história de Lisboa.',
      sentimento: 'positivo',
      dataPublicacao: dataReview1,
    },
  });

  const dataReview2 = new Date();
  dataReview2.setDate(dataReview2.getDate() - 3);

  await prisma.review.create({
    data: {
      fonte: 'tripadvisor',
      refExterna: 'TA-002',
      tourId: tour1.id,
      guiaId: guia2.id,
      nomeAutor: 'Robert Johnson',
      nota: 4.5,
      comentario: 'Great experience! Maria was very knowledgeable and friendly. Highly recommend!',
      sentimento: 'positivo',
      dataPublicacao: dataReview2,
    },
  });

  const dataReview3 = new Date();
  dataReview3.setDate(dataReview3.getDate() - 1);

  await prisma.review.create({
    data: {
      fonte: 'google',
      refExterna: 'GOOGLE-003',
      tourId: tour2.id,
      guiaId: guia2.id,
      nomeAutor: 'Carlos Mendes',
      nota: 5.0,
      comentario: 'Experiência gastronômica fantástica! Provamos pratos deliciosos e Maria explicou tudo muito bem.',
      sentimento: 'positivo',
      dataPublicacao: dataReview3,
    },
  });

  await prisma.review.create({
    data: {
      fonte: 'tripadvisor',
      refExterna: 'TA-004',
      tourId: tour3.id,
      guiaId: guia1.id,
      nomeAutor: 'Emma Wilson',
      nota: 4.0,
      comentario: 'Beautiful sunset views. The guide was good but could be more engaging.',
      sentimento: 'neutro',
      dataPublicacao: new Date(),
    },
  });

  console.log('✅ 4 Reviews criados');

  // Criar transações financeiras
  await prisma.transacao.create({
    data: {
      tipo: 'GORJETA',
      guiaId: guia1.id,
      sessaoTourId: sessao1.id,
      valor: 45.50,
      moeda: 'EUR',
      descricao: 'Gorjetas do Free Walking Tour',
      data: new Date(),
    },
  });

  await prisma.transacao.create({
    data: {
      tipo: 'BALANCO',
      guiaId: guia2.id,
      valor: 320.00,
      moeda: 'EUR',
      descricao: 'Balanço mensal - Novembro 2025',
      data: new Date(),
    },
  });

  const dataGorjeta = new Date();
  dataGorjeta.setDate(dataGorjeta.getDate() - 2);

  await prisma.transacao.create({
    data: {
      tipo: 'GORJETA',
      guiaId: guia2.id,
      sessaoTourId: sessao2.id,
      valor: 68.00,
      moeda: 'EUR',
      descricao: 'Gorjetas do Food Tour',
      data: dataGorjeta,
    },
  });

  console.log('✅ 3 Transações criadas');

  // Criar log de ETL (simulando importação passada)
  await prisma.logETL.create({
    data: {
      tipo: 'reservas',
      status: 'sucesso',
      totalRegistros: 25,
      novos: 5,
      atualizados: 0,
      erros: 0,
      mensagem: 'Importação concluída com sucesso',
      iniciado: new Date(),
      finalizado: new Date(),
    },
  });

  console.log('✅ Log ETL criado');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   🔐 USUÁRIOS E ACESSOS:');
  console.log('      → 1 Admin (admin@vibrantcitytours.com / admin123)');
  console.log('      → 3 Guias com login (joao@... / maria@... / pedro@... | senha: guia123)');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   🎯 OPERACIONAL:');
  console.log('      → 5 Tours diferentes');
  console.log('      → 3 Pontos de encontro');
  console.log('      → 4 Sessões agendadas (próximos 3 dias)');
  console.log('      → 1 Sessão SEM GUIA (para testar alocação)');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   👥 CLIENTES:');
  console.log('      → 3 Visitantes de países diferentes');
  console.log('      → 5 Reservas com ocupação variada');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   ⭐ FEEDBACK:');
  console.log('      → 4 Reviews (Google + TripAdvisor)');
  console.log('      → Notas: 4.0 a 5.0');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   💰 FINANCEIRO:');
  console.log('      → 3 Transações (gorjetas + balanço)');
  console.log('      → Total: €433.50');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✨ Acesse: http://localhost:3000');
  console.log('📊 Prisma Studio: http://localhost:5555\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
