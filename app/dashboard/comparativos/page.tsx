import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { Users, Star, Calendar, TrendingUp, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getComparativosTours() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const tours = await prisma.tour.findMany({
    where: { ativo: true },
    include: {
      sessoes: {
        where: {
          dataHora: { gte: inicioMes },
          status: { in: ['COMPLETADA', 'EM_ANDAMENTO'] },
        },
        include: {
          reservas: true,
          guia: true,
        },
      },
      reviews: {
        where: {
          dataPublicacao: { gte: inicioMes },
        },
      },
    },
  });

  const estatisticas = tours.map((tour) => {
    const totalSessoes = tour.sessoes.length;
    const totalReservas = tour.sessoes.reduce(
      (acc, s) => acc + s.reservas.length,
      0
    );
    const mediaReservasPorSessao =
      totalSessoes > 0 ? totalReservas / totalSessoes : 0;

    const taxaOcupacao =
      totalSessoes > 0
        ? (totalReservas / (totalSessoes * tour.capacidadeMax)) * 100
        : 0;

    const notasReviews = tour.reviews.map((r) => r.nota);
    const mediaNotas =
      notasReviews.length > 0
        ? notasReviews.reduce((a, b) => a + b, 0) / notasReviews.length
        : 0;

    const receita = totalReservas * tour.precoBase;

    // Guias únicos que realizaram o tour
    const guiasUnicos = new Set(
      tour.sessoes.filter((s) => s.guia).map((s) => s.guia!.id)
    ).size;

    return {
      id: tour.id,
      nome: tour.nome,
      duracaoMin: tour.duracaoMin,
      precoBase: tour.precoBase.toFixed(2),
      capacidadeMax: tour.capacidadeMax,
      totalSessoes,
      totalReservas,
      mediaReservasPorSessao: mediaReservasPorSessao.toFixed(1),
      taxaOcupacao: taxaOcupacao.toFixed(1),
      totalReviews: tour.reviews.length,
      mediaNotas: mediaNotas.toFixed(1),
      receita: receita.toFixed(2),
      guiasUnicos,
    };
  });

  // Ordenar por diferentes critérios
  const porReceita = [...estatisticas].sort(
    (a, b) => parseFloat(b.receita) - parseFloat(a.receita)
  );
  const porOcupacao = [...estatisticas].sort(
    (a, b) => parseFloat(b.taxaOcupacao) - parseFloat(a.taxaOcupacao)
  );
  const porNotas = [...estatisticas].sort(
    (a, b) => parseFloat(b.mediaNotas) - parseFloat(a.mediaNotas)
  );
  const porSessoes = [...estatisticas].sort(
    (a, b) => b.totalSessoes - a.totalSessoes
  );

  return {
    estatisticas,
    porReceita,
    porOcupacao,
    porNotas,
    porSessoes,
  };
}

async function getComparativosGuias() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);

  const guias = await prisma.guia.findMany({
    where: { status: 'ATIVO' },
    include: {
      sessoes: {
        where: {
          dataHora: { gte: inicioMes },
          status: { in: ['COMPLETADA', 'EM_ANDAMENTO'] },
        },
        include: {
          reservas: true,
          tour: true,
        },
      },
      reviews: {
        where: {
          dataPublicacao: { gte: inicioMes },
        },
      },
      transacoes: {
        where: {
          data: { gte: inicioMes },
        },
      },
    },
  });

  const estatisticas = guias.map((guia) => {
    const totalSessoes = guia.sessoes.length;
    const totalReservas = guia.sessoes.reduce(
      (acc, s) => acc + s.reservas.length,
      0
    );
    const mediaReservasPorSessao =
      totalSessoes > 0 ? totalReservas / totalSessoes : 0;

    const notasReviews = guia.reviews.map((r) => r.nota);
    const mediaNotas =
      notasReviews.length > 0
        ? notasReviews.reduce((a, b) => a + b, 0) / notasReviews.length
        : 0;

    const gorjetas = guia.transacoes
      .filter((t) => t.tipo === 'GORJETA')
      .reduce((acc, t) => acc + t.valor, 0);

    const totalReceita = guia.sessoes.reduce((acc, sessao) => {
      const precoPorPessoa = sessao.tour.precoBase;
      const numReservas = sessao.reservas.length;
      return acc + precoPorPessoa * numReservas;
    }, 0);

    return {
      id: guia.id,
      nome: guia.nome,
      idiomas: guia.idiomas,
      totalSessoes,
      totalReservas,
      mediaReservasPorSessao: mediaReservasPorSessao.toFixed(1),
      totalReviews: guia.reviews.length,
      mediaNotas: mediaNotas.toFixed(1),
      gorjetas: gorjetas.toFixed(2),
      receita: totalReceita.toFixed(2),
    };
  });

  // Ordenar por diferentes critérios
  const porSessoes = [...estatisticas].sort(
    (a, b) => b.totalSessoes - a.totalSessoes
  );
  const porNotas = [...estatisticas].sort(
    (a, b) => parseFloat(b.mediaNotas) - parseFloat(a.mediaNotas)
  );
  const porReceita = [...estatisticas].sort(
    (a, b) => parseFloat(b.receita) - parseFloat(a.receita)
  );
  const porGorjetas = [...estatisticas].sort(
    (a, b) => parseFloat(b.gorjetas) - parseFloat(a.gorjetas)
  );

  return {
    estatisticas,
    porSessoes,
    porNotas,
    porReceita,
    porGorjetas,
  };
}

export default async function ComparativosPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Comparativos de Performance
          </h2>
          <p className="text-gray-600 mt-1">
            Análise detalhada de guias e tours
          </p>
        </div>
      </div>

      <Tabs defaultValue="guias" className="w-full">
        <TabsList>
          <TabsTrigger value="guias">Guias</TabsTrigger>
          <TabsTrigger value="tours">Tours</TabsTrigger>
        </TabsList>

        <TabsContent value="guias" className="space-y-6">
          <Suspense fallback={<div>Carregando comparativos...</div>}>
            <ComparativosGuiasContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="tours" className="space-y-6">
          <Suspense fallback={<div>Carregando comparativos...</div>}>
            <ComparativosToursContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function ComparativosGuiasContent() {
  const dados = await getComparativosGuias();

  return (
    <>
      {/* Cards de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DestaqueCard
          titulo="Mais Sessões"
          guia={dados.porSessoes[0]}
          valor={dados.porSessoes[0]?.totalSessoes || 0}
          icon={Calendar}
          cor="blue"
        />
        <DestaqueCard
          titulo="Melhor Avaliado"
          guia={dados.porNotas[0]}
          valor={dados.porNotas[0]?.mediaNotas || '0'}
          icon={Star}
          cor="yellow"
        />
        <DestaqueCard
          titulo="Maior Receita"
          guia={dados.porReceita[0]}
          valor={`€${dados.porReceita[0]?.receita || 0}`}
          icon={TrendingUp}
          cor="green"
        />
        <DestaqueCard
          titulo="Mais Gorjetas"
          guia={dados.porGorjetas[0]}
          valor={`€${dados.porGorjetas[0]?.gorjetas || 0}`}
          icon={Award}
          cor="purple"
        />
      </div>

      {/* Tabela Comparativa Completa */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Análise Completa de Guias
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Métricas do mês atual
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Guia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Idiomas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Sessões
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Visitantes
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Média/Sessão
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Reviews
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Avaliação
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Receita
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Gorjetas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dados.estatisticas.map((guia) => (
                <tr key={guia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {guia.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {guia.idiomas.split(',').join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {guia.totalSessoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {guia.totalReservas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {guia.mediaReservasPorSessao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {guia.totalReviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {guia.mediaNotas}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-green-600">
                    €{guia.receita}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-purple-600">
                    €{guia.gorjetas}
                  </td>
                </tr>
              ))}
              {dados.estatisticas.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Nenhum guia com atividade no período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard
          titulo="Top 5 - Mais Sessões"
          guias={dados.porSessoes.slice(0, 5)}
          metrica="totalSessoes"
          unidade=""
        />
        <RankingCard
          titulo="Top 5 - Melhor Avaliação"
          guias={dados.porNotas.slice(0, 5)}
          metrica="mediaNotas"
          unidade="★"
        />
      </div>
    </>
  );
}

function DestaqueCard({
  titulo,
  guia,
  valor,
  icon: Icon,
  cor,
}: {
  titulo: string;
  guia: any;
  valor: string | number;
  icon: any;
  cor: string;
}) {
  if (!guia) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-500">Sem dados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{valor}</p>
          <p className="text-sm text-gray-500 mt-1">{guia.nome}</p>
        </div>
        <Icon className={`w-10 h-10 text-${cor}-500`} />
      </div>
    </div>
  );
}

function RankingCard({
  titulo,
  guias,
  metrica,
  unidade,
}: {
  titulo: string;
  guias: any[];
  metrica: string;
  unidade: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h3>
      <div className="space-y-3">
        {guias.map((guia, index) => (
          <div
            key={guia.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index === 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : index === 1
                    ? 'bg-gray-200 text-gray-700'
                    : index === 2
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-600'
                } font-bold text-sm`}
              >
                {index + 1}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {guia.nome}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {guia[metrica]}
              {unidade}
            </span>
          </div>
        ))}
        {guias.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum dado disponível
          </p>
        )}
      </div>
    </div>
  );
}

async function ComparativosToursContent() {
  const dados = await getComparativosTours();

  return (
    <>
      {/* Cards de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DestaqueCard
          titulo="Maior Receita"
          guia={dados.porReceita[0]}
          valor={`€${dados.porReceita[0]?.receita || 0}`}
          icon={TrendingUp}
          cor="green"
        />
        <DestaqueCard
          titulo="Melhor Ocupação"
          guia={dados.porOcupacao[0]}
          valor={`${dados.porOcupacao[0]?.taxaOcupacao || 0}%`}
          icon={Users}
          cor="blue"
        />
        <DestaqueCard
          titulo="Mais Procurado"
          guia={dados.porSessoes[0]}
          valor={dados.porSessoes[0]?.totalSessoes || 0}
          icon={Calendar}
          cor="purple"
        />
        <DestaqueCard
          titulo="Melhor Avaliado"
          guia={dados.porNotas[0]}
          valor={dados.porNotas[0]?.mediaNotas || '0'}
          icon={Star}
          cor="yellow"
        />
      </div>

      {/* Tabela Comparativa Completa */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Análise Completa de Tours
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Métricas do mês atual
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tour
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Duração
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Preço
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Sessões
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Visitantes
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Taxa Ocupação
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Reviews
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Avaliação
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Receita
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Guias
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dados.estatisticas.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tour.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {tour.duracaoMin}min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    €{tour.precoBase}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {tour.totalSessoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {tour.totalReservas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(parseFloat(tour.taxaOcupacao), 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {tour.taxaOcupacao}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {tour.totalReviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {tour.mediaNotas}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-green-600">
                    €{tour.receita}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {tour.guiasUnicos}
                  </td>
                </tr>
              ))}
              {dados.estatisticas.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Nenhum tour com atividade no período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard
          titulo="Top 5 - Maior Receita"
          guias={dados.porReceita.slice(0, 5)}
          metrica="receita"
          unidade="€"
        />
        <RankingCard
          titulo="Top 5 - Melhor Ocupação"
          guias={dados.porOcupacao.slice(0, 5)}
          metrica="taxaOcupacao"
          unidade="%"
        />
      </div>
    </>
  );
}
