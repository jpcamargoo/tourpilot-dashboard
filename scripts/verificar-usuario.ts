import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verificarUsuario() {
  console.log('🔍 Verificando usuário admin...\n');

  const usuario = await prisma.usuario.findUnique({
    where: { email: 'admin@vibrantcitytours.com' },
    include: { guia: true },
  });

  if (!usuario) {
    console.log('❌ Usuário não encontrado!');
    console.log('📝 Criando usuário...\n');

    const senhaHash = await bcrypt.hash('admin123', 10);
    
    const novoUsuario = await prisma.usuario.create({
      data: {
        email: 'admin@vibrantcitytours.com',
        nome: 'Administrador',
        role: 'ADMIN',
        senha: senhaHash,
        ativo: true,
      },
    });

    console.log('✅ Usuário criado:');
    console.log('  Email:', novoUsuario.email);
    console.log('  Senha: admin123');
    console.log('  Hash:', senhaHash);
  } else {
    console.log('✅ Usuário encontrado:');
    console.log('  ID:', usuario.id);
    console.log('  Email:', usuario.email);
    console.log('  Nome:', usuario.nome);
    console.log('  Role:', usuario.role);
    console.log('  Ativo:', usuario.ativo);
    console.log('  Hash da senha:', usuario.senha);
    console.log('  Guia associado:', usuario.guia ? `Sim (${usuario.guia.nome})` : 'Não');

    // Testar senha
    const senhaCorreta = await bcrypt.compare('admin123', usuario.senha);
    console.log('\n🔑 Teste de senha:');
    console.log('  Senha "admin123":', senhaCorreta ? '✅ CORRETA' : '❌ INCORRETA');

    if (!senhaCorreta) {
      console.log('\n⚠️  Senha incorreta! Atualizando...');
      const novaSenhaHash = await bcrypt.hash('admin123', 10);
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: novaSenhaHash },
      });
      console.log('✅ Senha atualizada com sucesso!');
      console.log('  Novo hash:', novaSenhaHash);
    }
  }

  // Listar todos os usuários
  console.log('\n📋 Todos os usuários no banco:');
  const todos = await prisma.usuario.findMany({
    select: {
      id: true,
      email: true,
      nome: true,
      ativo: true,
    },
  });

  todos.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.email} (${u.nome}) - ${u.ativo ? 'Ativo' : 'Inativo'}`);
  });
}

verificarUsuario()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
