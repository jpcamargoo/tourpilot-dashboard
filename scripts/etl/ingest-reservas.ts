#!/usr/bin/env tsx
import { ingerirReservas } from '@/lib/etl/ingest-reservas';

async function main() {
  console.log('🚀 Executando ingestão de reservas...\n');
  
  try {
    const resultado = await ingerirReservas();
    
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
