import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analisarSentimento } from '@/lib/sentiment/analyzer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('🔄 Iniciando reanálise de sentimento...');

    // Buscar todos os reviews
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        nota: true,
        comentario: true,
      },
    });

    let atualizados = 0;
    let erros = 0;

    for (const review of reviews) {
      try {
        const analise = analisarSentimento(review.nota, review.comentario);

        await prisma.review.update({
          where: { id: review.id },
          data: {
            sentimento: analise.sentimento,
          },
        });

        atualizados++;
      } catch (error) {
        console.error(`❌ Erro ao reanalisar review ${review.id}:`, error);
        erros++;
      }
    }

    console.log(`✅ Reanálise concluída: ${atualizados} atualizados, ${erros} erros`);

    return NextResponse.json({
      success: true,
      data: {
        total: reviews.length,
        atualizados,
        erros,
      },
      message: `Reanálise concluída: ${atualizados} reviews atualizados`,
    });
  } catch (error) {
    console.error('Erro na reanálise de sentimento:', error);
    return NextResponse.json(
      {
        error: 'Erro ao reanalisar reviews',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'ID do review não fornecido' },
        { status: 400 }
      );
    }

    // Analisar um review específico
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        nota: true,
        comentario: true,
        sentimento: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review não encontrado' },
        { status: 404 }
      );
    }

    const analise = analisarSentimento(review.nota, review.comentario);

    return NextResponse.json({
      success: true,
      data: {
        review,
        analise: {
          sentimento: analise.sentimento,
          confianca: analise.confianca,
          palavrasChave: analise.palavrasChave,
          sentimentoAtual: review.sentimento,
          mudou: analise.sentimento !== review.sentimento,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao analisar review:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar review' },
      { status: 500 }
    );
  }
}
