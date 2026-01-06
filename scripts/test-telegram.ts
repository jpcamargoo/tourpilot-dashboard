#!/usr/bin/env tsx
/**
 * Script de teste do Telegram Bot
 * Uso: tsx scripts/test-telegram.ts
 */

import { Telegraf } from 'telegraf';

async function testTelegramBot() {
  console.log('🤖 Testando configuração do Telegram Bot...\n');

  // Verificar variáveis de ambiente
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN não configurado no .env');
    console.log('\n📋 Para configurar:');
    console.log('1. Abra o Telegram e busque @BotFather');
    console.log('2. Envie: /newbot');
    console.log('3. Siga as instruções');
    console.log('4. Copie o token fornecido');
    console.log('5. Adicione ao .env: TELEGRAM_BOT_TOKEN="seu_token"\n');
    process.exit(1);
  }

  if (!chatId) {
    console.error('❌ TELEGRAM_CHAT_ID não configurado no .env');
    console.log('\n📋 Para obter o Chat ID:');
    console.log('1. Inicie conversa com seu bot');
    console.log('2. Envie qualquer mensagem');
    console.log('3. Acesse: https://api.telegram.org/bot' + token + '/getUpdates');
    console.log('4. Procure por "chat":{"id":NUMERO');
    console.log('5. Adicione ao .env: TELEGRAM_CHAT_ID="numero"\n');
    process.exit(1);
  }

  console.log('✅ Token configurado');
  console.log('✅ Chat ID configurado\n');

  try {
    const bot = new Telegraf(token);

    console.log('📤 Enviando mensagem de teste...\n');

    const mensagem = `
🎉 <b>Teste de Configuração</b>

✅ Bot do Telegram configurado com sucesso!

📊 <b>Dashboard Vibrant Tours</b>
🕐 ${new Date().toLocaleString('pt-BR')}

Este bot enviará alertas sobre:
• 🔴 Sessões sem guia
• 🔴 Overbooking detectado
• 🚨 Cancelamentos
• ⏰ Mudanças de horário

Sistema de monitoramento ativo! 🚀
    `.trim();

    await bot.telegram.sendMessage(chatId, mensagem, {
      parse_mode: 'HTML',
    });

    console.log('✅ Mensagem enviada com sucesso!');
    console.log('📱 Verifique seu Telegram\n');

    console.log('🎯 Próximos passos:');
    console.log('1. Ativar monitoramento: tsx lib/monitoring/scheduler.ts');
    console.log('2. Ou usar PM2: pm2 start lib/monitoring/scheduler.ts --name alertas --interpreter tsx');
    console.log('3. O bot verificará alertas a cada hora automaticamente\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
    
    if (error.message.includes('bot was blocked')) {
      console.log('\n⚠️  O bot foi bloqueado. Inicie uma conversa com ele primeiro!');
    } else if (error.message.includes('chat not found')) {
      console.log('\n⚠️  Chat ID inválido. Verifique o número.');
    } else if (error.message.includes('Unauthorized')) {
      console.log('\n⚠️  Token inválido. Verifique o TELEGRAM_BOT_TOKEN.');
    }
    
    process.exit(1);
  }
}

testTelegramBot();
