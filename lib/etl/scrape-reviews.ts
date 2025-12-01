import { prisma } from '@/lib/prisma';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { analisarSentimento } from '@/lib/sentiment/analyzer';

interface ReviewRaw {
  fonte: string;
  refExterna: string;
  nomeAutor?: string;
  nota: number;
  comentario?: string;
  dataPublicacao: Date;
  tourNome?: string;
}

export async function scraperReviews() {
  const logId = await iniciarLogETL('reviews');

  try {
    console.log('🔄 Iniciando scraping de reviews...');

    const reviews: ReviewRaw[] = [];

    // Google Reviews (via Google Places API)
    if (process.env.GOOGLE_PLACES_API_KEY) {
      const googleReviews = await buscarGoogleReviews();
      reviews.push(...googleReviews);
    }

    // TripAdvisor (scraping ou API se disponível)
    const tripAdvisorReviews = await buscarTripAdvisorReviews();
    reviews.push(...tripAdvisorReviews);

    // GetYourGuide Reviews
    const getYourGuideReviews = await buscarGetYourGuideReviews();
    reviews.push(...getYourGuideReviews);

    console.log(`📥 Encontrados ${reviews.length} reviews para processar`);

    let novos = 0;
    let atualizados = 0;
    let erros = 0;

    for (const review of reviews) {
      try {
        // Verificar duplicatas
        const existe = await prisma.review.findUnique({
          where: {
            fonte_refExterna: {
              fonte: review.fonte,
              refExterna: review.refExterna,
            },
          },
        });

        if (existe) {
          atualizados++;
          continue;
        }

        // Buscar tour se fornecido
        let tourId: string | undefined;
        if (review.tourNome) {
          const tour = await prisma.tour.findFirst({
            where: {
              nome: {
                contains: review.tourNome,
                mode: 'insensitive',
              },
            },
          });
          tourId = tour?.id;
        }

        // Calcular sentimento com análise avançada
        const analise = analisarSentimento(review.nota, review.comentario);

        await prisma.review.create({
          data: {
            fonte: review.fonte,
            refExterna: review.refExterna,
            nomeAutor: review.nomeAutor,
            nota: review.nota,
            comentario: review.comentario,
            sentimento: analise.sentimento,
            dataPublicacao: review.dataPublicacao,
            tourId,
          },
        });

        novos++;
      } catch (error) {
        console.error(`❌ Erro ao processar review ${review.refExterna}:`, error);
        erros++;
      }
    }

    await finalizarLogETL(logId, 'sucesso', reviews.length, novos, atualizados, erros);

    console.log(`✅ Scraping concluído: ${novos} novos, ${erros} erros`);

    return { novos, atualizados, erros };
  } catch (error) {
    await finalizarLogETL(logId, 'erro', 0, 0, 0, 0, (error as Error).message);
    throw error;
  }
}

async function buscarGoogleReviews(): Promise<ReviewRaw[]> {
  const reviews: ReviewRaw[] = [];

  try {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.log('⚠️  Google Places API key não configurada');
      return reviews;
    }

    // Buscar todos os tours para obter reviews específicos
    const tours = await prisma.tour.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
    });

    const placeIds = process.env.GOOGLE_PLACE_IDS?.split(',') || [];

    for (let i = 0; i < placeIds.length; i++) {
      const placeId = placeIds[i].trim();
      if (!placeId) continue;

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json`,
          {
            params: {
              place_id: placeId,
              fields: 'name,reviews',
              key: process.env.GOOGLE_PLACES_API_KEY,
              language: 'pt',
            },
          }
        );

        if (response.data.status !== 'OK') {
          console.log(`⚠️  Google Places API retornou: ${response.data.status}`);
          continue;
        }

        const googleReviews = response.data.result?.reviews || [];
        console.log(`📍 ${response.data.result?.name}: ${googleReviews.length} reviews`);

        for (const review of googleReviews) {
          reviews.push({
            fonte: 'google',
            refExterna: `google_${placeId}_${review.time}`,
            nomeAutor: review.author_name,
            nota: review.rating,
            comentario: review.text,
            dataPublicacao: new Date(review.time * 1000),
            tourNome: tours[i]?.nome,
          });
        }

        // Rate limiting: aguardar entre requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Erro ao buscar reviews do place ${placeId}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar reviews do Google:', error);
  }

  return reviews;
}

async function buscarTripAdvisorReviews(): Promise<ReviewRaw[]> {
  const reviews: ReviewRaw[] = [];

  try {
    if (!process.env.TRIPADVISOR_API_KEY) {
      console.log('⚠️  TripAdvisor API key não configurada');
      return reviews;
    }

    const locationIds = process.env.TRIPADVISOR_LOCATION_IDS?.split(',') || [];

    for (const locationId of locationIds) {
      if (!locationId.trim()) continue;

      try {
        // TripAdvisor Content API v2
        const response = await axios.get(
          `https://api.content.tripadvisor.com/api/v1/location/${locationId.trim()}/reviews`,
          {
            headers: {
              accept: 'application/json',
            },
            params: {
              key: process.env.TRIPADVISOR_API_KEY,
              language: 'pt',
            },
          }
        );

        const tripReviews = response.data.data || [];
        console.log(`📍 TripAdvisor location ${locationId}: ${tripReviews.length} reviews`);

        for (const review of tripReviews) {
          reviews.push({
            fonte: 'tripadvisor',
            refExterna: `tripadvisor_${review.id}`,
            nomeAutor: review.user?.username || 'Anônimo',
            nota: review.rating,
            comentario: review.text,
            dataPublicacao: new Date(review.published_date),
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Erro ao buscar reviews do TripAdvisor ${locationId}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar reviews do TripAdvisor:', error);
  }

  return reviews;
}

async function buscarGetYourGuideReviews(): Promise<ReviewRaw[]> {
  const reviews: ReviewRaw[] = [];

  try {
    // GetYourGuide não tem API pública oficial
    // Esta é uma implementação simulada/exemplo
    // Em produção, considerar web scraping ético ou integração oficial

    if (!process.env.GETYOURGUIDE_TOUR_IDS) {
      console.log('⚠️  GetYourGuide tour IDs não configurados');
      return reviews;
    }

    console.log('⚠️  GetYourGuide scraping requer implementação customizada');
    // TODO: Implementar scraping respeitando robots.txt e rate limits
    
  } catch (error) {
    console.error('❌ Erro ao buscar reviews do GetYourGuide:', error);
  }

  return reviews;
}

// Função antiga mantida para compatibilidade, mas não é mais usada
function calcularSentimento(nota: number, comentario?: string): string {
  const analise = analisarSentimento(nota, comentario);
  return analise.sentimento;
}

async function iniciarLogETL(tipo: string): Promise<string> {
  const log = await prisma.logETL.create({
    data: {
      tipo,
      status: 'em_progresso',
    },
  });
  return log.id;
}

async function finalizarLogETL(
  id: string,
  status: string,
  total: number,
  novos: number,
  atualizados: number,
  erros: number,
  mensagem?: string
) {
  await prisma.logETL.update({
    where: { id },
    data: {
      status,
      totalRegistros: total,
      novos,
      atualizados,
      erros,
      mensagem,
      finalizado: new Date(),
    },
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  scraperReviews()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
