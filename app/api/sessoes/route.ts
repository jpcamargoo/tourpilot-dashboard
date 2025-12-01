import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth, requirePermission } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const SessaoSchema = z.object({
  tourId: z.string(),
  guiaId: z.string().nullable().optional(),
  pontoEncontroId: z.string().nullable().optional(),
  dataHora: z.string().datetime(),
  duracaoMin: z.number().int().positive(),
  capacidadeMax: z.number().int().positive(),
  observacoes: z.string().optional(),
});

export async function GET(request: Request) {
  // Verificar autenticação
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const where: any = {};

    if (dataInicio && dataFim) {
      where.dataHora = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      };
    }

    // Se é guia, filtrar apenas suas sessões
    const userGuiaId = session!.user.guiaId;
    if (userGuiaId && !session!.user.role.includes('ADMIN')) {
      where.guiaId = userGuiaId;
    }

    const sessoes = await prisma.sessaoTour.findMany({
      where,
      include: {
        tour: true,
        guia: true,
        pontoEncontro: true,
        _count: {
          select: {
            reservas: {
              where: {
                status: { in: ['CONFIRMADA', 'PENDENTE'] },
              },
            },
          },
        },
      },
      orderBy: {
        dataHora: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({ success: true, data: sessoes });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar sessões' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Rate limiting para criação
  const rateLimitResult = await rateLimit(RateLimitPresets.write)(request);
  if (rateLimitResult) return rateLimitResult;

  // Apenas admin pode criar sessões
  const { error: authError } = await requirePermission(Permission.CREATE_SESSION);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validado = SessaoSchema.parse(body);

    const sessao = await prisma.sessaoTour.create({
      data: {
        tourId: validado.tourId,
        guiaId: validado.guiaId || null,
        pontoEncontroId: validado.pontoEncontroId || null,
        dataHora: new Date(validado.dataHora),
        duracaoMin: validado.duracaoMin,
        capacidadeMax: validado.capacidadeMax,
        observacoes: validado.observacoes,
        status: 'AGENDADA',
      },
      include: {
        tour: true,
        guia: true,
        pontoEncontro: true,
      },
    });

    return NextResponse.json(sessao, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Rate limiting para deleção (mais restritivo)
  const rateLimitResult = await rateLimit(RateLimitPresets.critical)(request);
  if (rateLimitResult) return rateLimitResult;

  // Apenas admin pode deletar sessões
  const { error: authError } = await requirePermission(Permission.DELETE_SESSION);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { status: 400 });
    }

    // Verificar se sessão tem reservas confirmadas
    const reservasCount = await prisma.reserva.count({
      where: {
        sessaoTourId: id,
        status: { in: ['CONFIRMADA', 'PENDENTE'] },
      },
    });

    if (reservasCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar sessão com reservas ativas' },
        { status: 400 }
      );
    }

    await prisma.sessaoTour.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Sessão deletada com sucesso' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar sessão' }, { status: 500 });
  }
}
