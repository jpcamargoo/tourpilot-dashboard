import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const pontos = await prisma.pontoEncontro.findMany({
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(pontos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pontos de encontro' }, { status: 500 });
  }
}
