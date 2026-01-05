/**
 * Script para criar usuário admin
 * Execução: npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Criando usuário admin...\n');

  try {
    // Verificar se admin já existe
    const existingAdmin = await prisma.usuario.findUnique({
      where: { email: 'admin@vibrantcitytours.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin já existe!');
      console.log('Email:', existingAdmin.email);
      console.log('Nome:', existingAdmin.nome);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Criar admin
    const admin = await prisma.usuario.create({
      data: {
        email: 'admin@vibrantcitytours.com',
        nome: 'Administrador',
        senha: hashedPassword,
        role: 'ADMIN',
        ativo: true
      }
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log('Email:', admin.email);
    console.log('Senha: admin123');
    console.log('Role:', admin.role);
    console.log('\n🔗 Acesse: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
