/**
 * Script para popular o banco com dados de exemplo
 * Execução: npx tsx scripts/seed-demo.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco com dados de exemplo...\n');

  try {
    // 1. Criar Guias
    console.log('👥 Criando guias...');
    
    const guia1User = await prisma.usuario.create({
      data: {
        email: 'maria@vibrantcitytours.com',
        nome: 'Maria Silva',
        senha: await bcrypt.hash('guia123', 10),
        role: 'GUIA',
        ativo: true
      }
    });

    const guia1 = await prisma.guia.create({
      data: {
        usuarioId: guia1User.id,
        nome: 'Maria Silva',
        idiomas: 'PT,EN,ES',
        telefone: '+351 912 345 678',
        status: 'ATIVO',
        notasMedia: 4.8,
        totalTours: 45
      }
    });

    const guia2User = await prisma.usuario.create({
      data: {
        email: 'joao@vibrantcitytours.com',
        nome: 'João Costa',
        senha: await bcrypt.hash('guia123', 10),
        role: 'GUIA',
        ativo: true
      }
    });

    const guia2 = await prisma.guia.create({
      data: {
        usuarioId: guia2User.id,
        nome: 'João Costa',
        idiomas: 'PT,EN,FR',
        telefone: '+351 913 456 789',
        status: 'ATIVO',
        notasMedia: 4.6,
        totalTours: 32
      }
    });

    console.log('✅ 2 guias criados');

    // 2. Criar Pontos de Encontro
    console.log('\n📍 Criando pontos de encontro...');
    
    const ponto1 = await prisma.pontoEncontro.create({
      data: {
        nome: 'Praça do Comércio',
        endereco: 'Praça do Comércio, 1100-148 Lisboa',
        latitude: 38.7077,
        longitude: -9.1365,
        instrucoes: 'Ao lado da estátua de D. José I',
        ativo: true
      }
    });

    const ponto2 = await prisma.pontoEncontro.create({
      data: {
        nome: 'Torre de Belém',
        endereco: 'Av. Brasília, 1400-038 Lisboa',
        latitude: 38.6916,
        longitude: -9.2158,
        instrucoes: 'Na entrada principal',
        ativo: true
      }
    });

    console.log('✅ 2 pontos criados');

    // 3. Criar Tours
    console.log('\n🎭 Criando tours...');
    
    const tour1 = await prisma.tour.create({
      data: {
        nome: 'Lisboa História e Cultura',
        descricao: 'Descubra os monumentos históricos mais importantes de Lisboa',
        duracaoMin: 180,
        precoBase: 45.00,
        capacidadeMax: 15,
        idiomas: 'PT,EN,ES,FR',
        ativo: true
      }
    });

    const tour2 = await prisma.tour.create({
      data: {
        nome: 'Belém e Mosteiro dos Jerónimos',
        descricao: 'Explore a zona histórica de Belém e seus monumentos',
        duracaoMin: 150,
        precoBase: 40.00,
        capacidadeMax: 12,
        idiomas: 'PT,EN,ES',
        ativo: true
      }
    });

    const tour3 = await prisma.tour.create({
      data: {
        nome: 'Noite em Alfama',
        descricao: 'Tour noturno pelo bairro mais antigo de Lisboa com fado',
        duracaoMin: 120,
        precoBase: 55.00,
        capacidadeMax: 10,
        idiomas: 'PT,EN',
        ativo: true
      }
    });

    console.log('✅ 3 tours criados');

    // 4. Criar Sessões (próximos 7 dias)
    console.log('\n📅 Criando sessões...');
    
    const hoje = new Date();
    const sessoes = [];

    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() + i);
      data.setHours(10, 0, 0, 0);

      sessoes.push(
        await prisma.sessaoTour.create({
          data: {
            tourId: i % 2 === 0 ? tour1.id : tour2.id,
            guiaId: i % 2 === 0 ? guia1.id : guia2.id,
            pontoEncontroId: i % 2 === 0 ? ponto1.id : ponto2.id,
            dataHora: data,
            duracaoMin: 180,
            capacidadeMax: 15,
            status: 'AGENDADA',
            observacoes: `Sessão ${i + 1}`
          }
        })
      );
    }

    console.log(`✅ ${sessoes.length} sessões criadas`);

    // 5. Criar Visitantes
    console.log('\n🌍 Criando visitantes...');
    
    const visitante1 = await prisma.visitante.create({
      data: {
        nome: 'John Smith',
        email: 'john@example.com',
        telefone: '+44 7700 900000',
        idioma: 'en',
        pais: 'GB',
        cidade: 'London'
      }
    });

    const visitante2 = await prisma.visitante.create({
      data: {
        nome: 'Marie Dupont',
        email: 'marie@example.com',
        telefone: '+33 6 12 34 56 78',
        idioma: 'fr',
        pais: 'FR',
        cidade: 'Paris'
      }
    });

    console.log('✅ 2 visitantes criados');

    // 6. Criar Reservas
    console.log('\n🎫 Criando reservas...');
    
    await prisma.reserva.create({
      data: {
        sessaoTourId: sessoes[0].id,
        visitanteId: visitante1.id,
        status: 'CONFIRMADA',
        numPessoas: 2,
        valorTotal: 90.00,
        origem: 'Website',
        dataReserva: new Date()
      }
    });

    await prisma.reserva.create({
      data: {
        sessaoTourId: sessoes[1].id,
        visitanteId: visitante2.id,
        status: 'CONFIRMADA',
        numPessoas: 1,
        valorTotal: 40.00,
        origem: 'GetYourGuide',
        dataReserva: new Date()
      }
    });

    console.log('✅ 2 reservas criadas');

    // 7. Criar Reviews
    console.log('\n⭐ Criando reviews...');
    
    await prisma.review.create({
      data: {
        fonte: 'google',
        refExterna: 'rev_001',
        tourId: tour1.id,
        guiaId: guia1.id,
        nomeAutor: 'John Smith',
        nota: 5.0,
        comentario: 'Excelente tour! Maria é uma guia incrível, muito conhecedora da história de Lisboa.',
        sentimento: 'positivo',
        dataPublicacao: new Date()
      }
    });

    await prisma.review.create({
      data: {
        fonte: 'tripadvisor',
        refExterna: 'rev_002',
        tourId: tour2.id,
        guiaId: guia2.id,
        nomeAutor: 'Marie Dupont',
        nota: 4.5,
        comentario: 'Muito bom! João explicou tudo de forma clara e interessante.',
        sentimento: 'positivo',
        dataPublicacao: new Date()
      }
    });

    console.log('✅ 2 reviews criadas');

    // 8. Criar Transações
    console.log('\n💰 Criando transações...');
    
    await prisma.transacao.create({
      data: {
        tipo: 'BALANCO',
        guiaId: guia1.id,
        sessaoTourId: sessoes[0].id,
        valor: 90.00,
        moeda: 'EUR',
        descricao: 'Pagamento tour Lisboa História',
        data: new Date()
      }
    });

    await prisma.transacao.create({
      data: {
        tipo: 'GORJETA',
        guiaId: guia1.id,
        valor: 10.00,
        moeda: 'EUR',
        descricao: 'Gorjeta John Smith',
        data: new Date()
      }
    });

    console.log('✅ 2 transações criadas');

    // 9. Criar Log ETL
    console.log('\n📊 Criando log ETL...');
    
    await prisma.logETL.create({
      data: {
        tipo: 'reviews',
        status: 'sucesso',
        totalRegistros: 10,
        novos: 2,
        atualizados: 0,
        erros: 0,
        mensagem: 'Scraping de reviews concluído com sucesso',
        iniciado: new Date(),
        finalizado: new Date()
      }
    });

    console.log('✅ Log ETL criado');

    console.log('\n' + '='.repeat(60));
    console.log('✅ BANCO POPULADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📊 Resumo:');
    console.log('  👥 3 usuários (1 admin + 2 guias)');
    console.log('  🎭 3 tours');
    console.log('  📍 2 pontos de encontro');
    console.log('  📅 7 sessões agendadas');
    console.log('  🌍 2 visitantes');
    console.log('  🎫 2 reservas');
    console.log('  ⭐ 2 reviews');
    console.log('  💰 2 transações');
    console.log('\n🔐 Credenciais:');
    console.log('  Admin: admin@vibrantcitytours.com / admin123');
    console.log('  Guia 1: maria@vibrantcitytours.com / guia123');
    console.log('  Guia 2: joao@vibrantcitytours.com / guia123');
    console.log('\n🌐 Acesse: http://localhost:3000/dashboard');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
