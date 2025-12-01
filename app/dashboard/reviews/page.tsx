import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { Star, ThumbsUp, ThumbsDown, Minus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analisarTendenciaSentimento } from '@/lib/sentiment/analyzer';
import { ScrapingButton } from '@/components/scraping-button';
import { SentimentBar } from '@/components/sentiment-bar';

export const dynamic = 'force-dynamic';

async function getReviewsData() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const mesSemanaPassado = new Date(hoje);
  mesSemanaPassado.setDate(mesSemanaPassado.getDate() - 30);

  const [
    totalReviews,
    reviewsMes,
    mediaGeral,
    porFonte,
    porSentimento,
    recentes,
    porTour,
    porGuia,
  ] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({
      where: { dataPublicacao: { gte: inicioMes } },
    }),
    prisma.review.aggregate({
      _avg: { nota: true },
    }),
    prisma.review.groupBy({
      by: ['fonte'],
      _count: { fonte: true },
      _avg: { nota: true },
    }),
    prisma.review.groupBy({
      by: ['sentimento'],
      _count: { sentimento: true },
      where: {
        sentimento: { not: null },
      },
    }),
    prisma.review.findMany({
      take: 10,
      orderBy: { dataPublicacao: 'desc' },
      include: {
        tour: { select: { nome: true } },
        guia: { select: { nome: true } },
      },
    }),
    prisma.review.groupBy({
      by: ['tourId'],
      where: {
        tourId: { not: null },
        dataPublicacao: { gte: mesSemanaPassado },
      },
      _count: { tourId: true },
      _avg: { nota: true },
    }),
    prisma.review.groupBy({
      by: ['guiaId'],
      where: {
        guiaId: { not: null },
        dataPublicacao: { gte: mesSemanaPassado },
      },
      _count: { guiaId: true },
      _avg: { nota: true },
    }),
  ]);

  // Enriquecer dados de tours
  const toursComReviews = await Promise.all(
    porTour.map(async (item) => {
      const tour = await prisma.tour.findUnique({
        where: { id: item.tourId! },
        select: { nome: true },
      });
      return {
        nome: tour?.nome || 'Tour Removido',
        count: item._count.tourId,
        media: item._avg.nota || 0,
      };
    })
  );

  // Enriquecer dados de guias
  const guiasComReviews = await Promise.all(
    porGuia.map(async (item) => {
      const guia = await prisma.guia.findUnique({
        where: { id: item.guiaId! },
        select: { nome: true },
      });
      return {
        nome: guia?.nome || 'Guia Removido',
        count: item._count.guiaId,
        media: item._avg.nota || 0,
      };
    })
  );

  // Análise de tendência (últimos 30 dias)
  const reviewsParaTendencia = await prisma.review.findMany({
    where: {
      dataPublicacao: { gte: mesSemanaPassado },
    },
    select: {
      nota: true,
      dataPublicacao: true,
      sentimento: true,
    },
    orderBy: { dataPublicacao: 'asc' },
  });

  const tendencia = analisarTendenciaSentimento(
    reviewsParaTendencia.map(r => ({
      nota: r.nota,
      dataPublicacao: new Date(r.dataPublicacao),
      sentimento: r.sentimento || 'neutro',
    }))
  );

  return {
    totalReviews,
    reviewsMes,
    mediaGeral: mediaGeral._avg.nota?.toFixed(1) || 'N/A',
    porFonte,
    porSentimento,
    recentes,
    toursComReviews: toursComReviews.sort((a, b) => b.count - a.count),
    guiasComReviews: guiasComReviews.sort((a, b) => b.count - a.count),
    tendencia,
  };
}

export default async function ReviewsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reviews e Avaliações</h2>
          <p className="text-gray-600 mt-1">
            Análise de feedback dos visitantes
          </p>
        </div>
        <ScrapingButton />
      </div>

      <Suspense fallback={<div>Carregando dados...</div>}>
        <ReviewsContent />
      </Suspense>
    </div>
  );
}

async function ReviewsContent() {
  const dados = await getReviewsData();

  const sentimentoPositivo =
    dados.porSentimento.find((s) => s.sentimento === 'positivo')?._count
      .sentimento || 0;
  const sentimentoNeutro =
    dados.porSentimento.find((s) => s.sentimento === 'neutro')?._count
      .sentimento || 0;
  const sentimentoNegativo =
    dados.porSentimento.find((s) => s.sentimento === 'negativo')?._count
      .sentimento || 0;

  return (
    <>
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dados.totalReviews}
              </p>
            </div>
            <Star className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviews (mês)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dados.reviewsMes}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média Geral</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {dados.mediaGeral}
                </p>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tendência (30 dias)</p>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl font-bold ${
                  dados.tendencia.tendencia === 'melhorando' 
                    ? 'text-green-600' 
                    : dados.tendencia.tendencia === 'piorando'
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}>
                  {dados.tendencia.tendencia === 'melhorando' ? '↑' : 
                   dados.tendencia.tendencia === 'piorando' ? '↓' : '→'}
                  {Math.abs(dados.tendencia.variacao).toFixed(1)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {dados.tendencia.tendencia}
              </p>
            </div>
            {dados.tendencia.tendencia === 'melhorando' ? (
              <TrendingUp className="w-10 h-10 text-green-500" />
            ) : dados.tendencia.tendencia === 'piorando' ? (
              <TrendingDown className="w-10 h-10 text-red-500" />
            ) : (
              <Activity className="w-10 h-10 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Análise de Sentimento */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribuição de Sentimento
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Positivo
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {sentimentoPositivo} reviews
              </span>
            </div>
            <SentimentBar count={sentimentoPositivo} total={dados.totalReviews} type="positive" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Minus className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Neutro
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {sentimentoNeutro} reviews
              </span>
            </div>
            <SentimentBar count={sentimentoNeutro} total={dados.totalReviews} type="neutral" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-700">
                  Negativo
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {sentimentoNegativo} reviews
              </span>
            </div>
            <SentimentBar count={sentimentoNegativo} total={dados.totalReviews} type="negative" />
          </div>
        </div>
      </div>

      {/* Fontes de Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reviews por Fonte
          </h3>
          <div className="space-y-3">
            {dados.porFonte.map((fonte) => (
              <div
                key={fonte.fonte}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {fonte.fonte}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {fonte._count.fonte} reviews
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold">
                      {fonte._avg.nota?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Tours (últimos 30 dias)
          </h3>
          <div className="space-y-3">
            {dados.toursComReviews.slice(0, 5).map((tour) => (
              <div
                key={tour.nome}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-900">
                  {tour.nome}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {tour.count} reviews
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold">
                      {tour.media.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Reviews Recentes
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {dados.recentes.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {review.nomeAutor || 'Anônimo'}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {review.fonte} •{' '}
                    {new Date(review.dataPublicacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">
                    {review.nota}
                  </span>
                </div>
              </div>
              {review.comentario && (
                <p className="text-sm text-gray-700 mb-2">
                  {review.comentario}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {review.tour && <span>Tour: {review.tour.nome}</span>}
                {review.guia && <span>Guia: {review.guia.nome}</span>}
                {review.sentimento && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.sentimento === 'positivo'
                        ? 'bg-green-100 text-green-800'
                        : review.sentimento === 'negativo'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {review.sentimento}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
