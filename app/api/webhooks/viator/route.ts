import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Webhook Viator - Recebe reservas em tempo real
 * POST /api/webhooks/viator
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Webhook Viator recebido');

    // Verificar webhook secret (segurança)
    const headersList = await headers();
    const signature = headersList.get('x-viator-signature');
    const webhookSecret = process.env.VIATOR_WEBHOOK_SECRET;

    if (webhookSecret && signature !== webhookSecret) {
      console.error('❌ Assinatura webhook inválida');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Payload:', JSON.stringify(body, null, 2));

    const { eventType, booking } = body;

    // Processar diferentes tipos de eventos
    switch (eventType) {
      case 'BOOKING_CREATED':
        await processarNovaReserva(booking);
        break;
      
      case 'BOOKING_UPDATED':
        await atualizarReserva(booking);
        break;
      
      case 'BOOKING_CANCELLED':
        await cancelarReserva(booking);
        break;
      
      default:
        console.log(`⚠️  Evento não tratado: ${eventType}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('❌ Erro no webhook Viator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processarNovaReserva(booking: any) {
  console.log('🆕 Processando nova reserva Viator...');

  try {
    // Similar ao GetYourGuide, adaptado para formato Viator
    const tourNome = booking.productTitle || 'Tour Viator';
    let tour = await prisma.tour.findFirst({
      where: { nome: { contains: tourNome } },
    });

    if (!tour) {
      tour = await prisma.tour.create({
        data: {
          nome: tourNome,
          duracaoMin: 120,
          precoBase: booking.totalPrice || 0,
          capacidadeMax: 20,
          idiomas: booking.languageGuide || 'en',
        },
      });
    }

    const dataHora = new Date(booking.travelDate);
    const sessao = await prisma.sessaoTour.upsert({
      where: {
        id: `viator_${booking.bookingRef}_${dataHora.toISOString()}`,
      },
      update: {},
      create: {
        id: `viator_${booking.bookingRef}_${dataHora.toISOString()}`,
        tourId: tour.id,
        dataHora,
        duracaoMin: 120,
        capacidadeMax: 20,
      },
    });

    const email = booking.bookerEmail || `viator_${booking.bookingRef}@placeholder.com`;
    let visitante = await prisma.visitante.findFirst({
      where: { email },
    });

    if (!visitante) {
      visitante = await prisma.visitante.create({
        data: {
          nome: `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'Visitante Viator',
          email,
          telefone: booking.phoneNumber,
          pais: booking.country,
          idioma: booking.languageGuide || 'en',
        },
      });
    }

    await prisma.reserva.create({
      data: {
        sessaoTourId: sessao.id,
        visitanteId: visitante.id,
        status: booking.bookingStatus === 'CONFIRMED' ? 'CONFIRMADA' : 'PENDENTE',
        numPessoas: booking.travelerCount || 1,
        valorTotal: booking.totalPrice || 0,
        origem: 'Viator',
        refExterna: booking.bookingRef,
        dataReserva: new Date(booking.bookingDate),
      },
    });

    console.log('✅ Reserva Viator criada com sucesso');

    // Enviar alerta no Telegram
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const { enviarAlerta } = await import('@/lib/telegram/alerts');
      await enviarAlerta(`
🎉 <b>Nova Reserva - Viator</b>

📅 Tour: ${tourNome}
🕐 Data/Hora: ${dataHora.toLocaleString('pt-BR')}
👤 Cliente: ${visitante.nome}
👥 Pessoas: ${booking.travelerCount || 1}
💰 Valor: $${booking.totalPrice || 0}

✅ Importada automaticamente via webhook
      `.trim());
    }
  } catch (error) {
    console.error('❌ Erro ao processar nova reserva Viator:', error);
    throw error;
  }
}

async function atualizarReserva(booking: any) {
  console.log('🔄 Atualizando reserva Viator...');
  
  const reserva = await prisma.reserva.findFirst({
    where: { refExterna: booking.bookingRef },
  });

  if (reserva) {
    await prisma.reserva.update({
      where: { id: reserva.id },
      data: {
        status: booking.bookingStatus === 'CONFIRMED' ? 'CONFIRMADA' : 'PENDENTE',
        numPessoas: booking.travelerCount || reserva.numPessoas,
        valorTotal: booking.totalPrice || reserva.valorTotal,
      },
    });
    console.log('✅ Reserva atualizada');
  }
}

async function cancelarReserva(booking: any) {
  console.log('🚨 Cancelando reserva Viator...');

  const reserva = await prisma.reserva.findFirst({
    where: { refExterna: booking.bookingRef },
    include: {
      sessaoTour: {
        include: { tour: true },
      },
      visitante: true,
    },
  });

  if (reserva) {
    await prisma.reserva.update({
      where: { id: reserva.id },
      data: {
        status: 'CANCELADA',
        dataCancelamento: new Date(),
      },
    });

    console.log('✅ Reserva cancelada');

    // Enviar alerta
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const { alertaCancelamento } = await import('@/lib/telegram/alerts');
      await alertaCancelamento(
        reserva.sessaoTour.tour.nome,
        reserva.sessaoTour.dataHora,
        reserva.visitante?.nome || undefined
      );
    }
  }
}
