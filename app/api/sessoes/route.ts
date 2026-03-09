import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requirePermission } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { alertaCancelamento, alertaMudancaHorario } from '@/lib/telegram/alerts';

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

    const where: Prisma.SessaoTourWhereInput = {};

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

    // Paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [sessoes, total] = await Promise.all([
      prisma.sessaoTour.findMany({
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
        skip,
        take: limit,
      }),
      prisma.sessaoTour.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: sessoes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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

    // Buscar dados da sessão antes de deletar (para alerta)
    const sessaoInfo = await prisma.sessaoTour.findUnique({
      where: { id },
      include: { tour: { select: { nome: true } } },
    });

    await prisma.sessaoTour.delete({
      where: { id },
    });

    // Enviar alerta Telegram sobre cancelamento
    if (sessaoInfo) {
      alertaCancelamento(sessaoInfo.tour.nome, sessaoInfo.dataHora).catch(console.error);
    }

    return NextResponse.json({ success: true, message: 'Sessão deletada com sucesso' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar sessão' }, { status: 500 });
  }
}

// Atualizar sessão existente
export async function PUT(request: Request) {
  const rateLimitResult = await rateLimit(RateLimitPresets.write)(request);
  if (rateLimitResult) return rateLimitResult;

  const { error: authError } = await requirePermission(Permission.EDIT_SESSION);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const validado = SessaoSchema.partial().parse(body);

    // Buscar sessão atual para comparar mudanças
    const sessaoAtual = await prisma.sessaoTour.findUnique({
      where: { id },
      include: { tour: { select: { nome: true } } },
    });

    if (!sessaoAtual) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    const sessao = await prisma.sessaoTour.update({
      where: { id },
      data: {
        ...(validado.tourId && { tourId: validado.tourId }),
        ...(validado.guiaId !== undefined && { guiaId: validado.guiaId || null }),
        ...(validado.pontoEncontroId !== undefined && { pontoEncontroId: validado.pontoEncontroId || null }),
        ...(validado.dataHora && { dataHora: new Date(validado.dataHora) }),
        ...(validado.duracaoMin && { duracaoMin: validado.duracaoMin }),
        ...(validado.capacidadeMax && { capacidadeMax: validado.capacidadeMax }),
        ...(validado.observacoes !== undefined && { observacoes: validado.observacoes }),
      },
      include: { tour: true, guia: true, pontoEncontro: true },
    });

    // Alerta Telegram se horário mudou
    if (validado.dataHora && new Date(validado.dataHora).getTime() !== sessaoAtual.dataHora.getTime()) {
      alertaMudancaHorario(
        sessaoAtual.tour.nome,
        sessaoAtual.dataHora,
        new Date(validado.dataHora)
      ).catch(console.error);
    }

    return NextResponse.json({ success: true, data: sessao });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar sessão' }, { status: 500 });
  }
}
