import cron from 'node-cron';
import { ingerirReservas } from '@/lib/etl/ingest-reservas';
import { scraperReviews } from '@/lib/etl/scrape-reviews';

console.log('⏰ Agendador de jobs ETL iniciado');

// Ingestão de reservas: todos os dias às 6h
cron.schedule('0 6 * * *', async () => {
  console.log('🔄 Executando job de ingestão de reservas...');
  try {
    await ingerirReservas();
    console.log('✅ Job de reservas concluído');
  } catch (error) {
    console.error('❌ Erro no job de reservas:', error);
  }
});

// Scraping de reviews: todos os dias às 3h
cron.schedule('0 3 * * *', async () => {
  console.log('🔄 Executando job de scraping de reviews...');
  try {
    await scraperReviews();
    console.log('✅ Job de reviews concluído');
  } catch (error) {
    console.error('❌ Erro no job de reviews:', error);
  }
});

// Manter processo ativo
process.on('SIGINT', () => {
  console.log('\n⏹️  Encerrando agendador...');
  process.exit(0);
});
