import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema de validação para filtros
const FiltroSchema = z.object({
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  tourId: z.string().optional(),
  guiaId: z.string().optional(),
  status: z.string().optional(),
  idioma: z.string().optional(),
  pais: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validação com Zod
    const filtros = FiltroSchema.parse(body);
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Construir filtros dinâmicos
    const criadoEmFilter: Prisma.DateTimeFilter = { gte: inicioMes };

    if (filtros.dataInicio) {
      criadoEmFilter.gte = new Date(filtros.dataInicio);
    }

    if (filtros.dataFim) {
      criadoEmFilter.lte = new Date(filtros.dataFim);
    }

    const where: Prisma.VisitanteWhereInput = {
      criadoEm: criadoEmFilter,
    };

    if (filtros.idioma) {
      where.idioma = filtros.idioma;
    }

    if (filtros.pais) {
      where.pais = { contains: filtros.pais, mode: 'insensitive' };
    }

    // Buscar dados filtrados
    const [
      totalVisitantes,
      totalReservas,
      reservasPorIdioma,
      reservasPorPais,
    ] = await Promise.all([
      prisma.visitante.count({ where }),
      prisma.reserva.count({
        where: {
          visitante: where,
          ...(filtros.status && { status: filtros.status }),
        },
      }),
      prisma.visitante.groupBy({
        by: ['idioma'],
        _count: { idioma: true },
        where: {
          ...where,
          idioma: { not: null },
        },
        orderBy: {
          _count: { idioma: 'desc' },
        },
        take: 5,
      }),
      prisma.visitante.groupBy({
        by: ['pais'],
        _count: { pais: true },
        where: {
          ...where,
          pais: { not: null },
        },
        orderBy: {
          _count: { pais: 'desc' },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalVisitantes,
        totalReservas,
        reservasPorIdioma,
        reservasPorPais,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Erro ao aplicar filtros:', error);
    return NextResponse.json(
      { error: 'Erro ao aplicar filtros' },
      { status: 500 }
    );
  }
}
