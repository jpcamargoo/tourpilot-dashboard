import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
