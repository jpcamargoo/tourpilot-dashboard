import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Corrigindo senha do admin...');
  
  // Gerar novo hash
  const senha = 'admin123';
  const hash = await bcrypt.hash(senha, 10);
  
  console.log('Hash gerado:', hash);
  
  // Atualizar usuário
  const usuario = await prisma.usuario.update({
    where: { email: 'admin@vibrantcitytours.com' },
    data: { senha: hash },
  });
  
  console.log('✅ Senha atualizada com sucesso!');
  console.log('Email:', usuario.email);
  console.log('Nova senha:', senha);
  
  // Testar a senha
  const teste = await bcrypt.compare(senha, hash);
  console.log('Teste de comparação:', teste ? '✅ OK' : '❌ FALHOU');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
