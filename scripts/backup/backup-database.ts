#!/usr/bin/env tsx
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function backupDatabase() {
  console.log('🔄 Iniciando backup do banco de dados...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL não configurada');
  }

  // Parse DATABASE_URL
  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port || '5432';
  const database = url.pathname.slice(1).split('?')[0];
  const username = url.username;
  const password = url.password;

  // Diretório de backup
  const backupDir = process.env.BACKUP_PATH || './backups';
  await fs.mkdir(backupDir, { recursive: true });

  // Nome do arquivo com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `vibrant_tours_${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);

  try {
    // Executar pg_dump
    const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F p -f "${filepath}"`;

    // Definir senha via variável de ambiente
    const env = { ...process.env, PGPASSWORD: password };

    await execAsync(command, { env });

    // Verificar se arquivo foi criado
    const stats = await fs.stat(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup criado com sucesso!`);
    console.log(`   Arquivo: ${filename}`);
    console.log(`   Tamanho: ${sizeMB} MB`);
    console.log(`   Caminho: ${filepath}`);

    // Limpar backups antigos (manter últimos 7 dias)
    await limparBackupsAntigos(backupDir, 7);

    return filepath;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    throw error;
  }
}

async function limparBackupsAntigos(backupDir: string, diasManter: number) {
  try {
    const files = await fs.readdir(backupDir);
    const agora = Date.now();
    const limiteMs = diasManter * 24 * 60 * 60 * 1000;

    let removidos = 0;

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      const filepath = path.join(backupDir, file);
      const stats = await fs.stat(filepath);
      const idade = agora - stats.mtime.getTime();

      if (idade > limiteMs) {
        await fs.unlink(filepath);
        removidos++;
        console.log(`🗑️  Backup antigo removido: ${file}`);
      }
    }

    if (removidos > 0) {
      console.log(`✅ ${removidos} backup(s) antigo(s) removido(s)`);
    }
  } catch (error) {
    console.error('⚠️  Erro ao limpar backups antigos:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  backupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { backupDatabase };
