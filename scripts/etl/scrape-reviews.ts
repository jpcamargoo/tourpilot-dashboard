#!/usr/bin/env tsx
import { scraperReviews } from '@/lib/etl/scrape-reviews';

async function main() {
  console.log('🚀 Executando scraping de reviews...\n');
  
  try {
    const resultado = await scraperReviews();
    
    console.log('\n📊 Resultado:');
    console.log(`   Novos: ${resultado.novos}`);
    console.log(`   Atualizados: ${resultado.atualizados}`);
    console.log(`   Erros: ${resultado.erros}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro na execução:', error);
    process.exit(1);
  }
}

main();
