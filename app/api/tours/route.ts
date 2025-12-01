import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth, requirePermission } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const TourSchema = z.object({
  nome: z.string().min(3),
  descricao: z.string().optional(),
  duracaoMin: z.number().int().positive(),
  precoBase: z.number().nonnegative(),
  capacidadeMax: z.number().int().positive(),
  idiomas: z.array(z.string()).min(1),
  ativo: z.boolean().default(true),
});

export async function GET(request: Request) {
  // Todos autenticados podem ver tours
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Buscar tour específico
      const tour = await prisma.tour.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              sessoes: true,
              reviews: true,
            },
          },
          reviews: {
            select: {
              nota: true,
            },
          },
        },
      });

      if (!tour) {
        return NextResponse.json({ error: 'Tour não encontrado' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: tour });
    }

    // Buscar todos os tours
    const tours = await prisma.tour.findMany({
      include: {
        _count: {
          select: {
            sessoes: true,
            reviews: true,
          },
        },
        reviews: {
          select: {
            nota: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(tours);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar tours' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Rate limiting para criação
  const rateLimitResult = await rateLimit(RateLimitPresets.write)(request);
  if (rateLimitResult) return rateLimitResult;

  // Apenas admin pode criar tours
  const { error: authError } = await requirePermission(Permission.CREATE_TOUR);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validado = TourSchema.parse(body);

    const tour = await prisma.tour.create({
      data: {
        nome: validado.nome,
        descricao: validado.descricao,
        duracaoMin: validado.duracaoMin,
        precoBase: validado.precoBase,
        capacidadeMax: validado.capacidadeMax,
        idiomas: validado.idiomas.join(','),
        ativo: validado.ativo,
      },
    });

    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar tour' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Rate limiting para atualização
  const rateLimitResult = await rateLimit(RateLimitPresets.write)(request);
  if (rateLimitResult) return rateLimitResult;

  // Apenas admin pode editar tours
  const { error: authError } = await requirePermission(Permission.EDIT_TOUR);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do tour é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const validado = TourSchema.parse(body);

    const tour = await prisma.tour.update({
      where: { id },
      data: {
        nome: validado.nome,
        descricao: validado.descricao,
        duracaoMin: validado.duracaoMin,
        precoBase: validado.precoBase,
        capacidadeMax: validado.capacidadeMax,
        idiomas: validado.idiomas.join(', '),
        ativo: validado.ativo,
      },
    });

    return NextResponse.json({ success: true, data: tour });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar tour' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Rate limiting para deleção (mais restritivo)
  const rateLimitResult = await rateLimit(RateLimitPresets.critical)(request);
  if (rateLimitResult) return rateLimitResult;

  // Apenas admin pode deletar tours
  const { error: authError } = await requirePermission(Permission.DELETE_TOUR);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do tour é obrigatório' }, { status: 400 });
    }

    // Verificar se tour tem sessões
    const sessoesCount = await prisma.sessaoTour.count({
      where: { tourId: id },
    });

    if (sessoesCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar tour com sessões cadastradas' },
        { status: 400 }
      );
    }

    await prisma.tour.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Tour deletado com sucesso' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar tour' }, { status: 500 });
  }
}
