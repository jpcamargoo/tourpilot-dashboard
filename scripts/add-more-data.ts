import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const guia = await prisma.guia.findFirst();
  const tours = await prisma.tour.findMany();
  const ponto = await prisma.pontoEncontro.findFirst();
  
  if (!guia || !tours.length || !ponto) {
    console.log('❌ Dados base não encontrados');
    return;
  }

  console.log('📝 Adicionando mais dados...');

  // Adicionar mais sessões
  const hoje = new Date();
  for (let i = 1; i <= 5; i++) {
    const data = new Date(hoje);
    data.setDate(data.getDate() + i);
    data.setHours(10 + i, 0, 0, 0);
    
    await prisma.sessaoTour.create({
      data: {
        tourId: tours[i % tours.length].id,
        guiaId: guia.id,
        pontoEncontroId: ponto.id,
        dataHora: data,
        duracaoMin: 180,
        capacidadeMax: 25,
        status: 'AGENDADA',
      },
    });
  }

  console.log('✅ 5 sessões adicionadas');

  // Adicionar mais visitantes
  const idiomas = ['en', 'es', 'fr', 'de', 'it'];
  const paises = ['US', 'ES', 'FR', 'DE', 'IT'];
  const nomes = ['John Smith', 'María García', 'Pierre Dubois', 'Hans Mueller', 'Marco Rossi', 'Anna Johnson', 'Carlos Lopez', 'Sophie Martin', 'Klaus Schmidt', 'Lucia Ferrari'];
  
  for (let i = 0; i < 10; i++) {
    await prisma.visitante.create({
      data: {
        nome: nomes[i],
        email: `visitor${i + 3}@example.com`,
        idioma: idiomas[i % idiomas.length],
        pais: paises[i % paises.length],
      },
    });
  }

  console.log('✅ 10 visitantes adicionados');

  // Adicionar mais reviews
  await prisma.review.create({
    data: {
      fonte: 'tripadvisor',
      refExterna: 'trip_001',
      tourId: tours[0].id,
      guiaId: guia.id,
      nomeAutor: 'Travel Enthusiast',
      nota: 4.8,
      comentario: 'Amazing experience! João was an excellent guide.',
      sentimento: 'positivo',
      dataPublicacao: new Date(),
    },
  });

  console.log('✅ 1 review adicionada');

  console.log('\n🎉 Dados adicionais criados com sucesso!');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
