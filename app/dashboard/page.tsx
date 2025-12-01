import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  MapPin,
  AlertCircle,
  Star,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getMetricas() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [
    totalVisitantesMes,
    totalReservasMes,
    taxaCancelamento,
    avaliacaoMedia,
    reservasPorIdioma,
    reservasPorPais,
    proximasSessoes,
  ] = await Promise.all([
    prisma.visitante.count({
      where: {
        criadoEm: { gte: inicioMes },
      },
    }),
    prisma.reserva.count({
      where: {
        dataReserva: { gte: inicioMes },
      },
    }),
    prisma.reserva
      .aggregate({
        where: {
          dataReserva: { gte: inicioMes },
        },
        _count: {
          _all: true,
        },
      })
      .then(async (total) => {
        const canceladas = await prisma.reserva.count({
          where: {
            dataReserva: { gte: inicioMes },
            status: 'CANCELADA',
          },
        });
        return total._count._all > 0 ? (canceladas / total._count._all) * 100 : 0;
      }),
    prisma.review.aggregate({
      _avg: { nota: true },
    }),
    prisma.visitante.groupBy({
      by: ['idioma'],
      _count: { idioma: true },
      where: {
        idioma: { not: null },
        criadoEm: { gte: inicioMes },
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
        pais: { not: null },
        criadoEm: { gte: inicioMes },
      },
      orderBy: {
        _count: { pais: 'desc' },
      },
      take: 5,
    }),
    prisma.sessaoTour.findMany({
      where: {
        dataHora: { gte: hoje },
        status: 'AGENDADA',
      },
      include: {
        tour: true,
        guia: true,
        _count: {
          select: { reservas: true },
        },
      },
      orderBy: { dataHora: 'asc' },
      take: 10,
    }),
  ]);

  return {
    totalVisitantesMes,
    totalReservasMes,
    taxaCancelamento: taxaCancelamento.toFixed(1),
    avaliacaoMedia: avaliacaoMedia._avg.nota?.toFixed(1) || 'N/A',
    reservasPorIdioma,
    reservasPorPais,
    proximasSessoes,
  };
}

export default async function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Visão geral operacional e de negócio</p>
      </div>

      <Suspense fallback={<div>Carregando métricas...</div>}>
        <MetricasCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div>Carregando...</div>}>
          <DistribuicaoIdiomas />
        </Suspense>
        <Suspense fallback={<div>Carregando...</div>}>
          <DistribuicaoPaises />
        </Suspense>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <ProximasSessoes />
      </Suspense>
    </div>
  );
}

async function MetricasCards() {
  const metricas = await getMetricas();

  const cards = [
    {
      titulo: 'Visitantes (mês)',
      valor: metricas.totalVisitantesMes,
      icon: Users,
      cor: 'blue',
    },
    {
      titulo: 'Reservas (mês)',
      valor: metricas.totalReservasMes,
      icon: Calendar,
      cor: 'green',
    },
    {
      titulo: 'Taxa Cancelamento',
      valor: `${metricas.taxaCancelamento}%`,
      icon: AlertCircle,
      cor: 'red',
    },
    {
      titulo: 'Avaliação Média',
      valor: metricas.avaliacaoMedia,
      icon: Star,
      cor: 'yellow',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.titulo} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.titulo}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.valor}</p>
            </div>
            <card.icon className={`w-10 h-10 text-${card.cor}-500`} />
          </div>
        </div>
      ))}
    </div>
  );
}

async function DistribuicaoIdiomas() {
  const metricas = await getMetricas();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitantes por Idioma</h3>
      <div className="space-y-3">
        {metricas.reservasPorIdioma.map((item) => (
          <div key={item.idioma} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 uppercase">{item.idioma}</span>
            <span className="text-sm font-semibold text-gray-900">{item._count.idioma}</span>
          </div>
        ))}
        {metricas.reservasPorIdioma.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  );
}

async function DistribuicaoPaises() {
  const metricas = await getMetricas();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitantes por País</h3>
      <div className="space-y-3">
        {metricas.reservasPorPais.map((item) => (
          <div key={item.pais} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 uppercase">{item.pais}</span>
            <span className="text-sm font-semibold text-gray-900">{item._count.pais}</span>
          </div>
        ))}
        {metricas.reservasPorPais.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  );
}

async function ProximasSessoes() {
  const metricas = await getMetricas();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Próximas Sessões de Tour</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reservas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metricas.proximasSessoes.map((sessao) => (
              <tr key={sessao.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(sessao.dataHora).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sessao.tour.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {sessao.guia?.nome || 'Não atribuído'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sessao._count.reservas} / {sessao.capacidadeMax}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {sessao.status}
                  </span>
                </td>
              </tr>
            ))}
            {metricas.proximasSessoes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhuma sessão agendada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
