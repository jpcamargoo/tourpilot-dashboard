import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { Calendar, Plus, MapPin, User, Users, Clock, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/export-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { otimizarAlocacaoSemanal, gerarRelatorioDisponibilidadeGuias } from '@/lib/scheduling/smart-allocation';
import { OtimizacaoAlocacao } from '@/components/otimizacao-alocacao';
import { ProgressBar } from '@/components/progress-bar';
import { SessaoDeleteButton } from '@/components/sessao-delete-button';

export const dynamic = 'force-dynamic';

async function getSessoesHoje() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  return await prisma.sessaoTour.findMany({
    where: {
      dataHora: {
        gte: hoje,
        lt: amanha,
      },
    },
    include: {
      tour: true,
      guia: true,
      pontoEncontro: true,
      _count: {
        select: {
          reservas: {
            where: {
              status: { in: ['CONFIRMADA', 'PENDENTE'] },
            },
          },
        },
      },
    },
    orderBy: {
      dataHora: 'asc',
    },
  });
}

async function getSessoesProximosDias(dias: number = 7) {
  const hoje = new Date();
  const futuro = new Date(hoje);
  futuro.setDate(futuro.getDate() + dias);

  return await prisma.sessaoTour.findMany({
    where: {
      dataHora: {
        gte: hoje,
        lte: futuro,
      },
      status: 'AGENDADA',
    },
    include: {
      tour: true,
      guia: true,
      pontoEncontro: true,
      _count: {
        select: {
          reservas: {
            where: {
              status: { in: ['CONFIRMADA', 'PENDENTE'] },
            },
          },
        },
      },
    },
    orderBy: {
      dataHora: 'asc',
    },
  });
}

export default async function AgendaPage() {
  // Obter dados de otimização
  const hoje = new Date();
  const otimizacao = await otimizarAlocacaoSemanal(hoje);
  
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(inicioSemana.getDate() - hoje.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 7);
  
  const relatorioDisponibilidade = await gerarRelatorioDisponibilidadeGuias(
    inicioSemana,
    fimSemana
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Agenda de Tours</h2>
          <p className="text-gray-600 mt-1">Visualize e gerencie as sessões agendadas</p>
        </div>
        <Link href="/dashboard/agenda/nova-sessao">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Sessão
          </Button>
        </Link>
      </div>

      {/* Alertas de Otimização */}
      {otimizacao.sessoesSemGuia > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">
                  {otimizacao.sessoesSemGuia} sessõ{otimizacao.sessoesSemGuia > 1 ? 'es' : 'ão'} sem guia alocado
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Sistema identificou {otimizacao.sugestoesOtimizacao.length} sugestõ{otimizacao.sugestoesOtimizacao.length > 1 ? 'es' : 'ão'} de alocação automática
                </p>
              </div>
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="hoje" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="semana">Próximos 7 dias</TabsTrigger>
          <TabsTrigger value="mes">Próximos 30 dias</TabsTrigger>
          <TabsTrigger value="otimizacao">Otimização</TabsTrigger>
          <TabsTrigger value="disponibilidade">Disponibilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje">
          <Suspense fallback={<div>Carregando sessões de hoje...</div>}>
            <SessoesHoje />
          </Suspense>
        </TabsContent>

        <TabsContent value="semana">
          <Suspense fallback={<div>Carregando sessões...</div>}>
            <SessoesProximosDias dias={7} />
          </Suspense>
        </TabsContent>

        <TabsContent value="mes">
          <Suspense fallback={<div>Carregando sessões...</div>}>
            <SessoesProximosDias dias={30} />
          </Suspense>
        </TabsContent>

        <TabsContent value="otimizacao">
          <OtimizacaoContent otimizacao={otimizacao} />
        </TabsContent>

        <TabsContent value="disponibilidade">
          <DisponibilidadeContent relatorio={relatorioDisponibilidade} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function SessoesHoje() {
  const sessoes = await getSessoesHoje();

  const dadosExportacao = sessoes.map((sessao) => ({
    data: new Date(sessao.dataHora).toLocaleDateString('pt-BR'),
    hora: new Date(sessao.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    tour: sessao.tour.nome,
    guia: sessao.guia?.nome || 'Sem guia',
    pontoEncontro: sessao.pontoEncontro?.nome || 'N/A',
    capacidade: sessao.capacidadeMax,
    ocupacao: sessao._count.reservas,
    percentualOcupacao: `${((sessao._count.reservas / sessao.capacidadeMax) * 100).toFixed(0)}%`,
    status: sessao.status,
  }));

  if (sessoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma sessão agendada para hoje</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sessões de Hoje</CardTitle>
            <CardDescription>{sessoes.length} sessões programadas</CardDescription>
          </div>
          <ExportButton
            data={dadosExportacao}
            filename="sessoes-hoje"
            label="Exportar Hoje"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessoes.map((sessao) => (
            <SessaoCard key={sessao.id} sessao={sessao} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function SessoesProximosDias({ dias }: { dias: number }) {
  const sessoes = await getSessoesProximosDias(dias);

  const dadosExportacao = sessoes.map((sessao) => ({
    data: new Date(sessao.dataHora).toLocaleDateString('pt-BR'),
    hora: new Date(sessao.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    tour: sessao.tour.nome,
    guia: sessao.guia?.nome || 'Sem guia',
    pontoEncontro: sessao.pontoEncontro?.nome || 'N/A',
    capacidade: sessao.capacidadeMax,
    ocupacao: sessao._count.reservas,
    percentualOcupacao: `${((sessao._count.reservas / sessao.capacidadeMax) * 100).toFixed(0)}%`,
    status: sessao.status,
  }));

  if (sessoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Nenhuma sessão agendada para os próximos {dias} dias
          </p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por data
  const sessoesPorData = sessoes.reduce(
    (acc, sessao) => {
      const data = new Date(sessao.dataHora).toLocaleDateString('pt-BR');
      if (!acc[data]) {
        acc[data] = [];
      }
      acc[data].push(sessao);
      return acc;
    },
    {} as Record<string, typeof sessoes>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <ExportButton
          data={dadosExportacao}
          filename={`sessoes-proximos-${dias}-dias`}
          label={`Exportar ${dias} dias`}
        />
      </div>
      {Object.entries(sessoesPorData).map(([data, sessoesData]) => (
        <div key={data}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{data}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessoesData.map((sessao) => (
              <SessaoCard key={sessao.id} sessao={sessao} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SessaoCard({ sessao }: { sessao: any }) {
  const ocupacao = sessao._count.reservas;
  const capacidade = sessao.capacidadeMax;
  const percentualOcupacao = (ocupacao / capacidade) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{sessao.tour.nome}</CardTitle>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDateTime(sessao.dataHora)}
            </div>
          </div>
          <StatusBadge status={sessao.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>Guia: {sessao.guia?.nome || 'Não atribuído'}</span>
          </div>

          {sessao.pontoEncontro && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{sessao.pontoEncontro.nome}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {ocupacao} / {capacidade} pessoas
            </span>
          </div>
        </div>

        {/* Barra de ocupação */}
        <div className="space-y-1">
          <ProgressBar value={ocupacao} max={capacidade} />
          <p className="text-xs text-gray-500 text-right">
            {percentualOcupacao.toFixed(0)}% ocupado
          </p>
        </div>

        <Link href={`/dashboard/agenda/${sessao.id}`}>
          <Button variant="outline" size="sm" className="w-full mt-2">
            Ver detalhes
          </Button>
        </Link>
        
        <div className="mt-2">
          <SessaoDeleteButton sessaoId={sessao.id} tourName={sessao.tour.nome} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    AGENDADA: 'bg-blue-100 text-blue-800',
    EM_ANDAMENTO: 'bg-green-100 text-green-800',
    COMPLETADA: 'bg-gray-100 text-gray-800',
    CANCELADA: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
        styles[status as keyof typeof styles] || styles.AGENDADA
      }`}
    >
      {status}
    </span>
  );
}

function OtimizacaoContent({ otimizacao }: { otimizacao: any }) {
  return (
    <OtimizacaoAlocacao
      sessoesSemGuia={otimizacao.sessoesSemGuia}
      sugestoes={otimizacao.sugestoesOtimizacao}
    />
  );
}

function DisponibilidadeContent({ relatorio }: { relatorio: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Disponibilidade de Guias</CardTitle>
        <CardDescription>
          Visão geral da carga de trabalho e taxa de ocupação (semana atual)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Guia
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Sessões
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Horas Trabalho
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Dias Ativos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Taxa Ocupação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {relatorio.map((item) => (
                <tr key={item.guia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.guia.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {item.totalSessoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {item.horasTrabalho}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {item.diasAtivos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24">
                        <ProgressBar value={item.taxaOcupacao} max={100} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.taxaOcupacao}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {relatorio.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum dado disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
