import cron from 'node-cron';
import { verificarAlertasOperacionais } from '@/lib/telegram/alerts';
import { backupDatabase } from '@/scripts/backup/backup-database';

console.log('⏰ Sistema de monitoramento iniciado');

// Alertas operacionais: a cada hora
cron.schedule('0 * * * *', async () => {
  console.log('🔍 Verificando alertas operacionais...');
  try {
    await verificarAlertasOperacionais();
  } catch (error) {
    console.error('❌ Erro na verificação de alertas:', error);
  }
});

// Backup diário: todos os dias às 2h
cron.schedule('0 2 * * *', async () => {
  console.log('💾 Executando backup diário...');
  try {
    await backupDatabase();
  } catch (error) {
    console.error('❌ Erro no backup:', error);
  }
});

console.log('✅ Jobs agendados:');
console.log('   - Alertas operacionais: a cada hora');
console.log('   - Backup de banco: diariamente às 2h');

// Manter processo ativo
process.on('SIGINT', () => {
  console.log('\n⏹️  Encerrando monitoramento...');
  process.exit(0);
});
