import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper determinístico para datas relativas
function daysFromNow(days: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log('🌱 Seed: TourPilot Dashboard (dados fictícios)');

  // Limpar dados existentes (ordem importa por FKs)
  await prisma.auditLog.deleteMany();
  await prisma.transacao.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.visitante.deleteMany();
  await prisma.sessaoTour.deleteMany();
  await prisma.pontoEncontro.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.guia.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.logETL.deleteMany();

  // ─── Usuários (demo) ───────────────────────────────
  const adminPwd = await bcrypt.hash('admin123', 10);
  const guiaPwd = await bcrypt.hash('guia123', 10);
  const equipePwd = await bcrypt.hash('equipe123', 10);

  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@example.com',
      nome: 'Admin Demo',
      role: 'ADMIN',
      senha: adminPwd,
    },
  });

  const uEquipe = await prisma.usuario.create({
    data: {
      email: 'equipe@example.com',
      nome: 'Equipe Demo',
      role: 'EQUIPE',
      senha: equipePwd,
    },
  });

  const uGuia1 = await prisma.usuario.create({
    data: { email: 'guia@example.com', nome: 'Guia Demo', role: 'GUIA', senha: guiaPwd },
  });
  const uGuia2 = await prisma.usuario.create({
    data: { email: 'guia2@example.com', nome: 'Alex Costa', role: 'GUIA', senha: guiaPwd },
  });
  const uGuia3 = await prisma.usuario.create({
    data: { email: 'guia3@example.com', nome: 'Sam Oliveira', role: 'GUIA', senha: guiaPwd },
  });

  console.log('✅ Usuários criados (admin/equipe/guia)');

  // ─── Guias ─────────────────────────────────────────
  const guia1 = await prisma.guia.create({
    data: {
      usuarioId: uGuia1.id,
      nome: 'Guia Demo',
      idiomas: 'PT,EN,ES',
      telefone: '+10000000001',
      status: 'ATIVO',
      notasMedia: 4.8,
      totalTours: 120,
    },
  });
  const guia2 = await prisma.guia.create({
    data: {
      usuarioId: uGuia2.id,
      nome: 'Alex Costa',
      idiomas: 'PT,EN,FR',
      telefone: '+10000000002',
      status: 'ATIVO',
      notasMedia: 4.9,
      totalTours: 180,
    },
  });
  const guia3 = await prisma.guia.create({
    data: {
      usuarioId: uGuia3.id,
      nome: 'Sam Oliveira',
      idiomas: 'PT,EN,IT',
      telefone: '+10000000003',
      status: 'FERIAS',
      notasMedia: 4.6,
      totalTours: 75,
    },
  });
  const guias = [guia1, guia2, guia3];
  console.log('✅ 3 guias');

  // ─── Tours ─────────────────────────────────────────
  const tours = await Promise.all([
    prisma.tour.create({
      data: {
        nome: 'City Highlights Walking Tour',
        descricao: 'Roteiro a pé pelos principais pontos turísticos.',
        duracaoMin: 180,
        precoBase: 0,
        capacidadeMax: 25,
        idiomas: 'pt,en,es,fr',
      },
    }),
    prisma.tour.create({
      data: {
        nome: 'Local Food Experience',
        descricao: 'Tour gastronômico com degustações locais.',
        duracaoMin: 150,
        precoBase: 45,
        capacidadeMax: 15,
        idiomas: 'pt,en',
      },
    }),
    prisma.tour.create({
      data: {
        nome: 'Sunset Viewpoints Tour',
        descricao: 'Mirantes e fotos ao pôr do sol.',
        duracaoMin: 120,
        precoBase: 30,
        capacidadeMax: 20,
        idiomas: 'pt,en,es',
      },
    }),
    prisma.tour.create({
      data: {
        nome: 'Evening Cultural Night',
        descricao: 'Apresentação cultural com jantar.',
        duracaoMin: 180,
        precoBase: 75,
        capacidadeMax: 30,
        idiomas: 'pt,en,fr,es',
      },
    }),
    prisma.tour.create({
      data: {
        nome: 'Countryside Day Trip',
        descricao: 'Bate-volta para vilarejos próximos.',
        duracaoMin: 480,
        precoBase: 120,
        capacidadeMax: 12,
        idiomas: 'pt,en',
      },
    }),
  ]);
  console.log('✅ 5 tours');

  // ─── Pontos de Encontro ────────────────────────────
  const pontos = await Promise.all([
    prisma.pontoEncontro.create({
      data: {
        nome: 'Praça Central',
        endereco: '123 Main Square, Downtown',
        latitude: 38.7077,
        longitude: -9.1365,
        instrucoes: 'Em frente ao monumento central.',
      },
    }),
    prisma.pontoEncontro.create({
      data: {
        nome: 'Estação Norte',
        endereco: '45 North Station Ave',
        latitude: 38.7139,
        longitude: -9.1394,
        instrucoes: 'Ao lado da fonte na entrada principal.',
      },
    }),
    prisma.pontoEncontro.create({
      data: {
        nome: 'Mirante Sul',
        endereco: 'South Viewpoint Rd',
        latitude: 38.6916,
        longitude: -9.2160,
        instrucoes: 'Ponto mais alto do mirante.',
      },
    }),
  ]);
  console.log('✅ 3 pontos de encontro');

  // ─── Sessões (10) ──────────────────────────────────
  const sessoes = [];
  for (let i = 0; i < 10; i++) {
    const tour = tours[i % tours.length];
    const guia = i === 4 ? null : guias[i % guias.length]; // 1 sem guia (alocação)
    const ponto = pontos[i % pontos.length];
    const dia = i - 2; // de -2 (passado) até +7 (futuro)
    const hora = 9 + (i % 6); // 9-14h
    const sessao = await prisma.sessaoTour.create({
      data: {
        tourId: tour.id,
        guiaId: guia?.id ?? null,
        pontoEncontroId: ponto.id,
        dataHora: daysFromNow(dia, hora),
        duracaoMin: tour.duracaoMin,
        capacidadeMax: tour.capacidadeMax,
        status: dia < 0 ? 'COMPLETADA' : 'AGENDADA',
        observacoes: guia ? null : 'Sem guia alocado (demo)',
      },
    });
    sessoes.push({ sessao, tour, guiaId: guia?.id });
  }
  console.log('✅ 10 sessões');

  // ─── Visitantes (10) ───────────────────────────────
  const visitantesData = [
    { nome: 'Visitante 1', email: 'v1@example.com', idioma: 'pt', pais: 'BR', cidade: 'São Paulo' },
    { nome: 'Visitante 2', email: 'v2@example.com', idioma: 'en', pais: 'US', cidade: 'Chicago' },
    { nome: 'Visitante 3', email: 'v3@example.com', idioma: 'es', pais: 'ES', cidade: 'Madri' },
    { nome: 'Visitante 4', email: 'v4@example.com', idioma: 'fr', pais: 'FR', cidade: 'Paris' },
    { nome: 'Visitante 5', email: 'v5@example.com', idioma: 'en', pais: 'GB', cidade: 'Londres' },
    { nome: 'Visitante 6', email: 'v6@example.com', idioma: 'it', pais: 'IT', cidade: 'Roma' },
    { nome: 'Visitante 7', email: 'v7@example.com', idioma: 'pt', pais: 'PT', cidade: 'Lisboa' },
    { nome: 'Visitante 8', email: 'v8@example.com', idioma: 'de', pais: 'DE', cidade: 'Berlim' },
    { nome: 'Visitante 9', email: 'v9@example.com', idioma: 'en', pais: 'CA', cidade: 'Toronto' },
    { nome: 'Visitante 10', email: 'v10@example.com', idioma: 'es', pais: 'AR', cidade: 'Buenos Aires' },
  ];
  const visitantes = await Promise.all(visitantesData.map((v) => prisma.visitante.create({ data: v })));
  console.log('✅ 10 visitantes');

  // ─── Reservas (30) ─────────────────────────────────
  const origens = ['website', 'getyourguide', 'viator', 'booking', 'walk-in'];
  const statusRot = ['CONFIRMADA', 'CONFIRMADA', 'CONFIRMADA', 'PENDENTE', 'CANCELADA'];
  for (let i = 0; i < 30; i++) {
    const s = sessoes[i % sessoes.length];
    const v = visitantes[i % visitantes.length];
    const numPessoas = (i % 4) + 1;
    await prisma.reserva.create({
      data: {
        sessaoTourId: s.sessao.id,
        visitanteId: v.id,
        status: statusRot[i % statusRot.length],
        numPessoas,
        valorTotal: s.tour.precoBase * numPessoas,
        origem: origens[i % origens.length],
        refExterna: `MOCK-${String(i + 1).padStart(4, '0')}`,
        dataReserva: daysFromNow(-(i % 10)),
      },
    });
  }
  console.log('✅ 30 reservas');

  // ─── Reviews (15) ──────────────────────────────────
  const reviewsData = [
    { fonte: 'google', nota: 5.0, comentario: 'Experiência incrível, recomendo!', sentimento: 'positivo' },
    { fonte: 'tripadvisor', nota: 4.5, comentario: 'Guia muito atencioso e bem informado.', sentimento: 'positivo' },
    { fonte: 'google', nota: 5.0, comentario: 'Vale cada minuto, voltarei.', sentimento: 'positivo' },
    { fonte: 'booking', nota: 4.0, comentario: 'Bom passeio, podia ser um pouco mais longo.', sentimento: 'neutro' },
    { fonte: 'google', nota: 5.0, comentario: 'Best tour we did on this trip!', sentimento: 'positivo' },
    { fonte: 'tripadvisor', nota: 3.5, comentario: 'Razoável, esperava mais paradas.', sentimento: 'neutro' },
    { fonte: 'google', nota: 5.0, comentario: 'Maravilhoso do início ao fim.', sentimento: 'positivo' },
    { fonte: 'booking', nota: 4.5, comentario: 'Muito divertido, ótima dinâmica.', sentimento: 'positivo' },
    { fonte: 'google', nota: 2.0, comentario: 'Atrasou bastante, ficamos esperando.', sentimento: 'negativo' },
    { fonte: 'tripadvisor', nota: 5.0, comentario: 'Guide was outstanding, super engaging.', sentimento: 'positivo' },
    { fonte: 'google', nota: 4.0, comentario: 'Boa experiência, comida ótima.', sentimento: 'positivo' },
    { fonte: 'booking', nota: 3.0, comentario: 'OK mas grupo muito grande.', sentimento: 'neutro' },
    { fonte: 'google', nota: 5.0, comentario: 'Highly recommended!', sentimento: 'positivo' },
    { fonte: 'tripadvisor', nota: 4.5, comentario: 'Ótimo custo-benefício.', sentimento: 'positivo' },
    { fonte: 'google', nota: 4.0, comentario: 'Curtimos bastante, paisagens lindas.', sentimento: 'positivo' },
  ];
  for (let i = 0; i < reviewsData.length; i++) {
    const r = reviewsData[i];
    const tour = tours[i % tours.length];
    const guia = guias[i % guias.length];
    await prisma.review.create({
      data: {
        fonte: r.fonte,
        refExterna: `${r.fonte.toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
        tourId: tour.id,
        guiaId: guia.id,
        nomeAutor: `Reviewer ${i + 1}`,
        nota: r.nota,
        comentario: r.comentario,
        sentimento: r.sentimento,
        dataPublicacao: daysFromNow(-(i + 1)),
      },
    });
  }
  console.log('✅ 15 reviews');

  // ─── Transações ────────────────────────────────────
  for (let i = 0; i < 6; i++) {
    const guia = guias[i % guias.length];
    await prisma.transacao.create({
      data: {
        tipo: i % 2 === 0 ? 'GORJETA' : 'BALANCO',
        guiaId: guia.id,
        valor: 30 + i * 25,
        moeda: 'EUR',
        descricao: i % 2 === 0 ? 'Gorjetas demo' : 'Balanço mensal demo',
        data: daysFromNow(-i),
      },
    });
  }
  console.log('✅ 6 transações');

  // ─── Log ETL ───────────────────────────────────────
  await prisma.logETL.create({
    data: {
      tipo: 'reservas',
      status: 'sucesso',
      totalRegistros: 30,
      novos: 30,
      atualizados: 0,
      erros: 0,
      mensagem: 'Seed inicial (template)',
      iniciado: new Date(),
      finalizado: new Date(),
    },
  });

  console.log('\n🎉 Seed concluído!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Credenciais demo:');
  console.log('   admin@example.com  / admin123');
  console.log('   guia@example.com   / guia123');
  console.log('   equipe@example.com / equipe123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 http://localhost:3000');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ignore = [admin, uEquipe];
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
