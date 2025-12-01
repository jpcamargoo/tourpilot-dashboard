import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...');
  await prisma.review.deleteMany();
  await prisma.transacao.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.visitante.deleteMany();
  await prisma.sessaoTour.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.guia.deleteMany();
  await prisma.pontoEncontro.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar usuários
  console.log('👤 Criando usuários...');
  const usuario1 = await prisma.usuario.create({
    data: {
      email: 'admin@vibrantcitytours.com',
      nome: 'Administrador',
      role: 'ADMIN',
      senha: '$2a$10$KIXx0hGq7hYfPxN4TbVw8.YwJzB7qbN6Q8YGqDxvJKxWJGkJxXpTm', // senha: admin123
      ativo: true,
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      email: 'joao@vibrantcitytours.com',
      nome: 'João Silva',
      role: 'GUIA',
      senha: '$2a$10$KIXx0hGq7hYfPxN4TbVw8.YwJzB7qbN6Q8YGqDxvJKxWJGkJxXpTm',
      ativo: true,
    },
  });

  const usuario3 = await prisma.usuario.create({
    data: {
      email: 'maria@vibrantcitytours.com',
      nome: 'Maria Santos',
      role: 'GUIA',
      senha: '$2a$10$KIXx0hGq7hYfPxN4TbVw8.YwJzB7qbN6Q8YGqDxvJKxWJGkJxXpTm',
      ativo: true,
    },
  });

  const usuario4 = await prisma.usuario.create({
    data: {
      email: 'pedro@vibrantcitytours.com',
      nome: 'Pedro Costa',
      role: 'GUIA',
      senha: '$2a$10$KIXx0hGq7hYfPxN4TbVw8.YwJzB7qbN6Q8YGqDxvJKxWJGkJxXpTm',
      ativo: true,
    },
  });

  // Criar guias
  console.log('🎓 Criando guias...');
  const guia1 = await prisma.guia.create({
    data: {
      usuarioId: usuario2.id,
      nome: 'João Silva',
      idiomas: 'PT,EN,ES',
      telefone: '+351 912 345 678',
      status: 'ATIVO',
      totalTours: 45,
      notasMedia: 4.8,
    },
  });

  const guia2 = await prisma.guia.create({
    data: {
      usuarioId: usuario3.id,
      nome: 'Maria Santos',
      idiomas: 'PT,EN,FR',
      telefone: '+351 913 456 789',
      status: 'ATIVO',
      totalTours: 32,
      notasMedia: 4.7,
    },
  });

  const guia3 = await prisma.guia.create({
    data: {
      usuarioId: usuario4.id,
      nome: 'Pedro Costa',
      idiomas: 'PT,EN,ES,IT',
      telefone: '+351 914 567 890',
      status: 'ATIVO',
      totalTours: 28,
      notasMedia: 4.9,
    },
  });

  // Criar pontos de encontro
  console.log('📍 Criando pontos de encontro...');
  const ponto1 = await prisma.pontoEncontro.create({
    data: {
      nome: 'Praça do Comércio',
      endereco: 'Praça do Comércio, 1100-148 Lisboa',
      latitude: 38.7077,
      longitude: -9.1365,
      instrucoes: 'Em frente ao Arco da Rua Augusta',
      ativo: true,
    },
  });

  const ponto2 = await prisma.pontoEncontro.create({
    data: {
      nome: 'Rossio',
      endereco: 'Praça Dom Pedro IV, 1100-026 Lisboa',
      latitude: 38.7139,
      longitude: -9.1394,
      instrucoes: 'Junto à estátua central',
      ativo: true,
    },
  });

  // Criar tours
  console.log('🗺️ Criando tours...');
  const tour1 = await prisma.tour.create({
    data: {
      nome: 'Lisboa Histórica',
      descricao: 'Tour pelos principais monumentos históricos de Lisboa',
      duracaoMin: 180,
      precoBase: 25.0,
      capacidadeMax: 15,
      idiomas: 'PT,EN,ES',
      ativo: true,
    },
  });

  const tour2 = await prisma.tour.create({
    data: {
      nome: 'Alfama ao Pôr do Sol',
      descricao: 'Passeio pelo bairro mais antigo de Lisboa',
      duracaoMin: 120,
      precoBase: 20.0,
      capacidadeMax: 12,
      idiomas: 'PT,EN,FR',
      ativo: true,
    },
  });

  const tour3 = await prisma.tour.create({
    data: {
      nome: 'Belém Monumental',
      descricao: 'Visite Torre de Belém, Mosteiro dos Jerónimos e mais',
      duracaoMin: 240,
      precoBase: 30.0,
      capacidadeMax: 20,
      idiomas: 'PT,EN,ES,FR',
      ativo: true,
    },
  });

  // Criar sessões (passadas e futuras)
  console.log('📅 Criando sessões...');
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const anteontem = new Date(hoje);
  anteontem.setDate(anteontem.getDate() - 2);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const doisDias = new Date(hoje);
  doisDias.setDate(doisDias.getDate() + 2);

  const sessao1 = await prisma.sessaoTour.create({
    data: {
      tourId: tour1.id,
      guiaId: guia1.id,
      pontoEncontroId: ponto1.id,
      dataHora: anteontem,
      duracaoMin: 180,
      capacidadeMax: 15,
      status: 'COMPLETADA',
    },
  });

  const sessao2 = await prisma.sessaoTour.create({
    data: {
      tourId: tour2.id,
      guiaId: guia2.id,
      pontoEncontroId: ponto2.id,
      dataHora: ontem,
      duracaoMin: 120,
      capacidadeMax: 12,
      status: 'COMPLETADA',
    },
  });

  const sessao3 = await prisma.sessaoTour.create({
    data: {
      tourId: tour1.id,
      guiaId: guia3.id,
      pontoEncontroId: ponto1.id,
      dataHora: hoje,
      duracaoMin: 180,
      capacidadeMax: 15,
      status: 'AGENDADA',
    },
  });

  const sessao4 = await prisma.sessaoTour.create({
    data: {
      tourId: tour3.id,
      guiaId: null,
      pontoEncontroId: ponto2.id,
      dataHora: amanha,
      duracaoMin: 240,
      capacidadeMax: 20,
      status: 'AGENDADA',
    },
  });

  // Criar visitantes e reservas
  console.log('👥 Criando visitantes e reservas...');
  
  for (let i = 0; i < 10; i++) {
    const visitante = await prisma.visitante.create({
      data: {
        nome: `Visitante ${i + 1}`,
        email: `visitante${i + 1}@email.com`,
        telefone: `+351 91${i}${i}${i}${i}${i}${i}${i}`,
        idioma: ['PT', 'EN', 'ES', 'FR'][i % 4],
        pais: ['Brasil', 'Portugal', 'Espanha', 'França'][i % 4],
      },
    });

    // Criar reserva para sessão completada
    if (i < 8) {
      await prisma.reserva.create({
        data: {
          visitanteId: visitante.id,
          sessaoTourId: i < 4 ? sessao1.id : sessao2.id,
          dataReserva: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000),
          status: 'CONFIRMADA',
          numPessoas: 1,
          valorTotal: i < 4 ? 25.0 : 20.0,
        },
      });
    }

    // Criar reserva para sessão futura
    if (i < 5) {
      await prisma.reserva.create({
        data: {
          visitanteId: visitante.id,
          sessaoTourId: sessao3.id,
          dataReserva: new Date(),
          status: 'CONFIRMADA',
          numPessoas: 1,
          valorTotal: 25.0,
        },
      });
    }
  }

  // Criar reviews
  console.log('⭐ Criando reviews...');
  const comentarios = [
    'Excelente tour! Guia muito conhecedor e atencioso.',
    'Adorei conhecer a história de Lisboa. Recomendo!',
    'Tour maravilhoso, vistas incríveis!',
    'Muito bom, mas poderia ser um pouco mais curto.',
    'Fantástico! Melhor tour que já fiz.',
    'Guia simpático e explicações claras.',
    'Experiência incrível, vale cada euro!',
    'Muito informativo e divertido ao mesmo tempo.',
  ];

  for (let i = 0; i < 20; i++) {
    await prisma.review.create({
      data: {
        fonte: ['google', 'tripadvisor'][i % 2],
        refExterna: `review_${i + 1}_${Date.now()}`,
        nomeAutor: `Turista ${i + 1}`,
        nota: 3 + Math.random() * 2, // 3.0 a 5.0
        comentario: comentarios[i % comentarios.length],
        sentimento: i % 5 === 0 ? 'negativo' : i % 3 === 0 ? 'neutro' : 'positivo',
        dataPublicacao: new Date(hoje.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        tourId: [tour1.id, tour2.id, tour3.id][i % 3],
        guiaId: [guia1.id, guia2.id, guia3.id][i % 3],
      },
    });
  }

  // Criar transações
  console.log('💰 Criando transações...');
  
  // Gorjetas
  for (let i = 0; i < 15; i++) {
    await prisma.transacao.create({
      data: {
        tipo: 'GORJETA',
        guiaId: [guia1.id, guia2.id, guia3.id][i % 3],
        sessaoTourId: [sessao1.id, sessao2.id][i % 2],
        valor: 5 + Math.random() * 15, // 5 a 20 euros
        moeda: 'EUR',
        descricao: 'Gorjeta do tour',
        data: new Date(hoje.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Balanços
  await prisma.transacao.create({
    data: {
      tipo: 'BALANCO',
      valor: 500.0,
      moeda: 'EUR',
      descricao: 'Receita quinzenal',
      data: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Ajustes
  await prisma.transacao.create({
    data: {
      tipo: 'AJUSTE',
      valor: -50.0,
      moeda: 'EUR',
      descricao: 'Reembolso de cancelamento',
      data: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📊 Dados criados:');
  console.log('- 4 usuários (1 admin + 3 guias)');
  console.log('- 3 guias');
  console.log('- 2 pontos de encontro');
  console.log('- 3 tours');
  console.log('- 4 sessões (2 completadas, 2 futuras)');
  console.log('- 10 visitantes');
  console.log('- ~13 reservas');
  console.log('- 20 reviews');
  console.log('- ~17 transações');
  console.log('');
  console.log('🔑 Credenciais de acesso:');
  console.log('- Admin: admin@vibrantcitytours.com / admin123');
  console.log('- Guias: joao@vibrantcitytours.com / admin123');
  console.log('         maria@vibrantcitytours.com / admin123');
  console.log('         pedro@vibrantcitytours.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
