import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth, requireGuiaAccess, requirePermission } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const GuiaSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().optional(),
  idiomas: z.array(z.string()).min(1),
  status: z.enum(['ATIVO', 'INATIVO', 'FERIAS']),
});

export async function GET(request: Request) {
  // Verificar autenticação
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Verificar se pode acessar este guia específico
      const { error: accessError } = await requireGuiaAccess(id);
      if (accessError) return accessError;

      // Buscar guia específico
      const guia = await prisma.guia.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              email: true,
              nome: true,
              role: true,
            },
          },
          _count: {
            select: {
              sessoes: true,
              reviews: true,
              transacoes: true,
            },
          },
        },
      });

      if (!guia) {
        return NextResponse.json({ error: 'Guia não encontrado' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: guia });
    }

    // Verificar permissão para ver todos os guias
    const { error: permError } = await requirePermission(Permission.VIEW_ALL_GUIAS);
    if (permError) {
      // Se não tem permissão, retorna apenas seu próprio guia
      const userGuiaId = session!.user.guiaId;
      if (!userGuiaId) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
      }

      const guia = await prisma.guia.findUnique({
        where: { id: userGuiaId },
        include: {
          usuario: {
            select: {
              email: true,
              nome: true,
              role: true,
            },
          },
          _count: {
            select: {
              sessoes: true,
              reviews: true,
              transacoes: true,
            },
          },
        },
      });

      return NextResponse.json([guia]);
    }

    // Buscar todos os guias (admin)
    const guias = await prisma.guia.findMany({
      include: {
        usuario: {
          select: {
            email: true,
            nome: true,
            role: true,
          },
        },
        _count: {
          select: {
            sessoes: true,
            reviews: true,
            transacoes: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(guias);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar guias' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Rate limiting para criação
  const rateLimitResult = await rateLimit(RateLimitPresets.write)(request);
  if (rateLimitResult) return rateLimitResult;

  // Apenas admin pode criar guias
  const { session, error: authError } = await requirePermission(Permission.CREATE_GUIA);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validado = GuiaSchema.parse(body);

    // Criar usuário primeiro
    const usuario = await prisma.usuario.create({
      data: {
        email: validado.email,
        nome: validado.nome,
        role: 'GUIA',
        senha: 'change-me', // TODO: implementar hash de senha
      },
    });

    // Criar guia associado
    const guia = await prisma.guia.create({
      data: {
        usuarioId: usuario.id,
        nome: validado.nome,
        telefone: validado.telefone,
        idiomas: validado.idiomas,
        status: validado.status as any,
      },
      include: {
        usuario: {
          select: {
            email: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json(guia, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar guia' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Rate limiting para atualização
  const rateLimitResult = await rateLimit(RateLimitPresets.write)(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do guia é obrigatório' }, { status: 400 });
    }

    // Verificar se pode editar este guia
    const { error: accessError } = await requireGuiaAccess(id);
    if (accessError) return accessError;

    const body = await request.json();
    const validado = z.object({
      nome: z.string().min(3),
      telefone: z.string().optional(),
      idiomas: z.array(z.string()).min(1),
      status: z.enum(['ATIVO', 'INATIVO', 'FERIAS']),
    }).parse(body);

    const guia = await prisma.guia.update({
      where: { id },
      data: {
        nome: validado.nome,
        telefone: validado.telefone,
        idiomas: validado.idiomas.join(', '),
        status: validado.status as any,
      },
      include: {
        usuario: {
          select: {
            email: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: guia });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar guia' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Rate limiting para deleção (mais restritivo)
  const rateLimitResult = await rateLimit(RateLimitPresets.critical)(request);
  if (rateLimitResult) return rateLimitResult;

  // Apenas admin pode deletar guias
  const { error: authError } = await requirePermission(Permission.DELETE_GUIA);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do guia é obrigatório' }, { status: 400 });
    }

    // Verificar se guia tem sessões
    const sessoesCount = await prisma.sessao.count({
      where: { guiaId: id },
    });

    if (sessoesCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar guia com sessões cadastradas' },
        { status: 400 }
      );
    }

    // Buscar usuário associado antes de deletar
    const guia = await prisma.guia.findUnique({
      where: { id },
      select: { usuarioId: true },
    });

    // Deletar guia
    await prisma.guia.delete({
      where: { id },
    });

    // Deletar usuário associado se existir
    if (guia?.usuarioId) {
      await prisma.usuario.delete({
        where: { id: guia.usuarioId },
      });
    }

    return NextResponse.json({ success: true, message: 'Guia deletado com sucesso' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar guia' }, { status: 500 });
  }
}
