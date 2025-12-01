import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

export async function enviarAlerta(mensagem: string) {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!chatId) {
      console.error('⚠️  TELEGRAM_CHAT_ID não configurado');
      return;
    }

    await bot.telegram.sendMessage(chatId, mensagem, {
      parse_mode: 'HTML',
    });
    
    console.log('✅ Alerta enviado via Telegram');
  } catch (error) {
    console.error('❌ Erro ao enviar alerta Telegram:', error);
  }
}

export async function alertaCancelamento(
  tourNome: string,
  dataHora: Date,
  nomeVisitante?: string
) {
  const mensagem = `
🚨 <b>Cancelamento detectado</b>

📅 Tour: ${tourNome}
🕐 Data/Hora: ${dataHora.toLocaleString('pt-BR')}
👤 Visitante: ${nomeVisitante || 'N/A'}

⚠️ Verificar redistribuição de recursos.
  `.trim();

  await enviarAlerta(mensagem);
}

export async function alertaMudancaHorario(
  tourNome: string,
  dataAnterior: Date,
  dataNova: Date
) {
  const mensagem = `
⏰ <b>Mudança de horário</b>

📅 Tour: ${tourNome}
🕐 De: ${dataAnterior.toLocaleString('pt-BR')}
🕐 Para: ${dataNova.toLocaleString('pt-BR')}

⚠️ Verificar comunicação com visitantes.
  `.trim();

  await enviarAlerta(mensagem);
}

export async function alertaSemGuia(tourNome: string, dataHora: Date) {
  const mensagem = `
⚠️ <b>Sessão sem guia atribuído</b>

📅 Tour: ${tourNome}
🕐 Data/Hora: ${dataHora.toLocaleString('pt-BR')}

🔴 URGENTE: Atribuir guia antes da data.
  `.trim();

  await enviarAlerta(mensagem);
}

export async function alertaOverbooking(
  tourNome: string,
  dataHora: Date,
  capacidade: number,
  reservas: number
) {
  const mensagem = `
🔴 <b>Overbooking detectado</b>

📅 Tour: ${tourNome}
🕐 Data/Hora: ${dataHora.toLocaleString('pt-BR')}
👥 Capacidade: ${capacidade}
📊 Reservas: ${reservas}

⚠️ AÇÃO NECESSÁRIA: Excesso de ${reservas - capacidade} pessoa(s).
  `.trim();

  await enviarAlerta(mensagem);
}

// Monitoramento automático (executar via cron)
export async function verificarAlertasOperacionais() {
  console.log('🔍 Verificando alertas operacionais...');

  const { prisma } = await import('@/lib/prisma');
  const agora = new Date();
  const em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

  // Verificar sessões sem guia nas próximas 24h
  const sessoesSemGuia = await prisma.sessaoTour.findMany({
    where: {
      dataHora: {
        gte: agora,
        lte: em24h,
      },
      guiaId: null,
      status: 'AGENDADA',
    },
    include: {
      tour: true,
    },
  });

  for (const sessao of sessoesSemGuia) {
    await alertaSemGuia(sessao.tour.nome, sessao.dataHora);
  }

  // Verificar overbooking
  const sessoes = await prisma.sessaoTour.findMany({
    where: {
      dataHora: {
        gte: agora,
        lte: em24h,
      },
      status: 'AGENDADA',
    },
    include: {
      tour: true,
      _count: {
        select: {
          reservas: {
            where: {
              status: { in: ['CONFIRMADA', 'PENDENTE'] },
            },
          },
        },
      },
    },
  });

  for (const sessao of sessoes) {
    const totalReservas = sessao._count.reservas;
    if (totalReservas > sessao.capacidadeMax) {
      await alertaOverbooking(
        sessao.tour.nome,
        sessao.dataHora,
        sessao.capacidadeMax,
        totalReservas
      );
    }
  }

  console.log('✅ Verificação de alertas concluída');
}
