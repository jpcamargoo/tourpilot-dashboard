import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';

// Schema de validação para atualizar reserva
const AtualizarReservaSchema = z.object({
  status: z.enum(['CONFIRMADA', 'PENDENTE', 'CANCELADA', 'NO_SHOW', 'COMPLETADA']).optional(),
  numPessoas: z.number().int().positive().optional(),
  valorTotal: z.number().nonnegative().optional(),
  observacoes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reservas/[id] - Buscar detalhes de uma reserva
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        visitante: true,
        sessaoTour: {
          include: {
            tour: true,
            guia: true,
            pontoEncontro: true,
          },
        },
      },
    });

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    return NextResponse.json(reserva);

  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    return NextResponse.json({ error: 'Erro ao buscar reserva' }, { status: 500 });
  }
}

// PATCH /api/reservas/[id] - Atualizar reserva
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validacao = AtualizarReservaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', detalhes: validacao.error.errors },
        { status: 400 }
      );
    }

    // Verificar se a reserva existe
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id },
      include: {
        sessaoTour: {
          include: {
            reservas: true,
          },
        },
      },
    });

    if (!reservaExistente) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Se estiver atualizando o número de pessoas, verificar capacidade
    if (validacao.data.numPessoas && validacao.data.numPessoas !== reservaExistente.numPessoas) {
      const reservasAtivas = reservaExistente.sessaoTour.reservas.filter(
        r => (r.status === 'CONFIRMADA' || r.status === 'PENDENTE') && r.id !== id
      );
      const totalPessoas = reservasAtivas.reduce((acc, r) => acc + r.numPessoas, 0);
      const novaCapacidade = totalPessoas + validacao.data.numPessoas;

      if (novaCapacidade > reservaExistente.sessaoTour.capacidadeMax) {
        return NextResponse.json(
          { error: 'Capacidade excedida' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const dataToUpdate: any = { ...validacao.data };

    // Se estiver cancelando, adicionar data de cancelamento
    if (validacao.data.status === 'CANCELADA' && !reservaExistente.dataCancelamento) {
      dataToUpdate.dataCancelamento = new Date();
    }

    // Atualizar reserva
    const reserva = await prisma.reserva.update({
      where: { id },
      data: dataToUpdate,
      include: {
        visitante: true,
        sessaoTour: {
          include: {
            tour: true,
          },
        },
      },
    });

    // Log de auditoria
    await AuditLogger.log({
      userId: session.user.id,
      action: AuditAction.UPDATE_RESERVA,
      resource: 'reserva',
      resourceId: reserva.id,
      details: validacao.data,
    });

    return NextResponse.json(reserva);

  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar reserva', detalhes: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservas/[id] - Deletar reserva
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se a reserva existe
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id },
      include: {
        visitante: true,
      },
    });

    if (!reservaExistente) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Deletar reserva
    await prisma.reserva.delete({
      where: { id },
    });

    // Log de auditoria
    await AuditLogger.log({
      userId: session.user.id,
      action: AuditAction.CANCEL_RESERVA,
      resource: 'reserva',
      resourceId: id,
      details: {
        visitante: reservaExistente.visitante?.nome,
        numPessoas: reservaExistente.numPessoas,
      },
    });

    return NextResponse.json({ message: 'Reserva deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar reserva:', error);
    return NextResponse.json({ error: 'Erro ao deletar reserva' }, { status: 500 });
  }
}
