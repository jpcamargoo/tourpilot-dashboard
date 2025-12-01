import { NextResponse } from 'next/server';
import { scraperReviews } from '@/lib/etl/scrape-reviews';
import { requirePermission } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';

export async function POST() {
  // Apenas admin pode executar scraping
  const { error: authError } = await requirePermission(Permission.SCRAPE_REVIEWS);
  if (authError) return authError;

  try {
    const resultado = await scraperReviews();

    return NextResponse.json({
      success: true,
      data: resultado,
      message: `Scraping concluído: ${resultado.novos} novos reviews`,
    });
  } catch (error) {
    console.error('Erro no scraping de reviews:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao executar scraping',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Qualquer usuário autenticado pode ver estatísticas
  const { error: authError } = await requirePermission(Permission.VIEW_ALL_REVIEWS);
  if (authError) return authError;

  try {
    // Retornar estatísticas do último scraping
    const { prisma } = await import('@/lib/prisma');
    
    const ultimoLog = await prisma.logETL.findFirst({
      where: { tipo: 'reviews' },
      orderBy: { iniciado: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: ultimoLog,
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    );
  }
}
