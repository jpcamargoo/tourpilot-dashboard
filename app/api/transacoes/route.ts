import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission, requireFinancialAccess } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';

export async function GET(request: Request) {
  // Verificar autenticação
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const guiaId = searchParams.get('guiaId');
    const inicio = searchParams.get('inicio');
    const fim = searchParams.get('fim');

    // Verificar acesso financeiro
    const { error: accessError } = await requireFinancialAccess(guiaId || undefined);
    if (accessError) return accessError;

    const where: any = {};

    if (tipo) where.tipo = tipo;
    
    // Se não tem permissão para ver tudo, filtra por seu guiaId
    if (guiaId) {
      where.guiaId = guiaId;
    } else if (session!.user.guiaId && session!.user.role !== 'ADMIN') {
      where.guiaId = session!.user.guiaId;
    }

    if (inicio || fim) {
      where.data = {};
      if (inicio) where.data.gte = new Date(inicio);
      if (fim) where.data.lte = new Date(fim);
    }

    const transacoes = await prisma.transacao.findMany({
      where,
      include: {
        guia: {
          select: { nome: true },
        },
        sessaoTour: {
          select: {
            dataHora: true,
            tour: {
              select: { nome: true },
            },
          },
        },
      },
      orderBy: { data: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: transacoes,
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Apenas admin pode adicionar transações
  const { error: authError } = await requirePermission(Permission.ADD_TRANSACTION);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { tipo, guiaId, sessaoTourId, valor, moeda, descricao, data } = body;

    // Validações
    if (!tipo || !valor) {
      return NextResponse.json(
        { error: 'Tipo e valor são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['BALANCO', 'GORJETA', 'AJUSTE'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      );
    }

    const transacao = await prisma.transacao.create({
      data: {
        tipo,
        guiaId: guiaId || null,
        sessaoTourId: sessaoTourId || null,
        valor: parseFloat(valor),
        moeda: moeda || 'EUR',
        descricao,
        data: data ? new Date(data) : new Date(),
      },
      include: {
        guia: {
          select: { nome: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: transacao,
      message: 'Transação criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar transação' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // Apenas admin pode deletar transações
  const { error: authError } = await requirePermission(Permission.DELETE_TRANSACTION);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da transação não fornecido' },
        { status: 400 }
      );
    }

    await prisma.transacao.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Transação excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir transação' },
      { status: 500 }
    );
  }
}
