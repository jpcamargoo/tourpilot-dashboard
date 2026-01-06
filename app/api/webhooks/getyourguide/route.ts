import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Webhook GetYourGuide - Recebe reservas em tempo real
 * POST /api/webhooks/getyourguide
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Webhook GetYourGuide recebido');

    // Verificar webhook secret (segurança)
    const headersList = await headers();
    const signature = headersList.get('x-getyourguide-signature');
    const webhookSecret = process.env.GETYOURGUIDE_WEBHOOK_SECRET;

    if (webhookSecret && signature !== webhookSecret) {
      console.error('❌ Assinatura webhook inválida');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Payload:', JSON.stringify(body, null, 2));

    const { event_type, booking } = body;

    // Processar diferentes tipos de eventos
    switch (event_type) {
      case 'booking.created':
        await processarNovaReserva(booking);
        break;
      
      case 'booking.updated':
        await atualizarReserva(booking);
        break;
      
      case 'booking.cancelled':
        await cancelarReserva(booking);
        break;
      
      default:
        console.log(`⚠️  Evento não tratado: ${event_type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('❌ Erro no webhook GetYourGuide:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processarNovaReserva(booking: any) {
  console.log('🆕 Processando nova reserva GetYourGuide...');

  try {
    // Buscar ou criar tour
    const tourNome = booking.product_name || 'Tour GetYourGuide';
    let tour = await prisma.tour.findFirst({
      where: { nome: { contains: tourNome, mode: 'insensitive' } },
    });

    if (!tour) {
      tour = await prisma.tour.create({
        data: {
          nome: tourNome,
          duracaoMin: 120,
          precoBase: booking.price?.amount || 0,
          capacidadeMax: 20,
          idiomas: booking.language || 'en',
        },
      });
    }

    // Buscar ou criar sessão
    const dataHora = new Date(booking.datetime);
    const sessao = await prisma.sessaoTour.upsert({
      where: {
        id: `getyourguide_${booking.booking_reference}_${dataHora.toISOString()}`,
      },
      update: {},
      create: {
        id: `getyourguide_${booking.booking_reference}_${dataHora.toISOString()}`,
        tourId: tour.id,
        dataHora,
        duracaoMin: 120,
        capacidadeMax: 20,
      },
    });

    // Buscar ou criar visitante
    const email = booking.customer?.email || `getyourguide_${booking.booking_reference}@placeholder.com`;
    let visitante = await prisma.visitante.findFirst({
      where: { email },
    });

    if (!visitante) {
      visitante = await prisma.visitante.create({
        data: {
          nome: booking.customer?.name || 'Visitante GetYourGuide',
          email,
          telefone: booking.customer?.phone,
          pais: booking.customer?.country,
          idioma: booking.language || 'en',
        },
      });
    }

    // Criar reserva
    await prisma.reserva.create({
      data: {
        sessaoTourId: sessao.id,
        visitanteId: visitante.id,
        status: 'CONFIRMADA',
        numPessoas: booking.participants_count || 1,
        valorTotal: booking.price?.amount || 0,
        origem: 'GetYourGuide',
        refExterna: booking.booking_reference,
        dataReserva: new Date(booking.created_at),
      },
    });

    console.log('✅ Reserva GetYourGuide criada com sucesso');

    // Enviar alerta no Telegram (opcional)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const { enviarAlerta } = await import('@/lib/telegram/alerts');
      await enviarAlerta(`
🎉 <b>Nova Reserva - GetYourGuide</b>

📅 Tour: ${tourNome}
🕐 Data/Hora: ${dataHora.toLocaleString('pt-BR')}
👤 Cliente: ${booking.customer?.name || 'N/A'}
👥 Pessoas: ${booking.participants_count || 1}
💰 Valor: €${booking.price?.amount || 0}

✅ Importada automaticamente via webhook
      `.trim());
    }
  } catch (error) {
    console.error('❌ Erro ao processar nova reserva:', error);
    throw error;
  }
}

async function atualizarReserva(booking: any) {
  console.log('🔄 Atualizando reserva GetYourGuide...');

  const reserva = await prisma.reserva.findFirst({
    where: { refExterna: booking.booking_reference },
  });

  if (reserva) {
    await prisma.reserva.update({
      where: { id: reserva.id },
      data: {
        status: booking.status === 'confirmed' ? 'CONFIRMADA' : 'PENDENTE',
        numPessoas: booking.participants_count || reserva.numPessoas,
        valorTotal: booking.price?.amount || reserva.valorTotal,
      },
    });
    console.log('✅ Reserva atualizada');
  }
}

async function cancelarReserva(booking: any) {
  console.log('🚨 Cancelando reserva GetYourGuide...');

  const reserva = await prisma.reserva.findFirst({
    where: { refExterna: booking.booking_reference },
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

    // Enviar alerta no Telegram
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const { alertaCancelamento } = await import('@/lib/telegram/alerts');
      await alertaCancelamento(
        reserva.sessaoTour.tour.nome,
        reserva.sessaoTour.dataHora,
        reserva.visitante.nome || undefined
      );
    }
  }
}
