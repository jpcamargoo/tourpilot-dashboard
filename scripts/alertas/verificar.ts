#!/usr/bin/env tsx
import { verificarAlertasOperacionais } from '@/lib/telegram/alerts';

async function main() {
  console.log('🚀 Executando verificação de alertas operacionais...\n');
  
  try {
    await verificarAlertasOperacionais();
    console.log('\n✅ Verificação concluída com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro na execução:', error);
    process.exit(1);
  }
}

main();
