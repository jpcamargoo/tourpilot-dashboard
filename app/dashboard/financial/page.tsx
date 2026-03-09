import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { Euro, TrendingUp, TrendingDown, DollarSign, PiggyBank, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdicionarTransacaoButton } from '@/components/adicionar-transacao-button';
import { ExportButton } from '@/components/export-button';

export const dynamic = 'force-dynamic';

async function getFinancialData() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);

  const [
    sessoesCompletadas,
    transacoesMes,
    transacoesAno,
    transacoesMesAnterior,
    gorjetasPorGuia,
    receitaPorTour,
  ] = await Promise.all([
    // Calcular receita das sessões completadas - otimizado
    prisma.sessaoTour.findMany({
      where: {
        status: 'COMPLETADA',
        dataHora: { gte: inicioMes },
      },
      select: {
        tour: {
          select: { precoBase: true, nome: true },
        },
        _count: {
          select: { reservas: true },
        },
        guia: {
          select: { nome: true, id: true },
        },
      },
    }),
    // Transações do mês - limitado a 100 mais recentes
    prisma.transacao.findMany({
      where: {
        data: { gte: inicioMes },
      },
      select: {
        id: true,
        data: true,
        tipo: true,
        valor: true,
        descricao: true,
        guia: { select: { nome: true } },
        sessaoTour: {
          select: {
            tour: { select: { nome: true } },
          },
        },
      },
      orderBy: { data: 'desc' },
      take: 100, // Limitar resultados
    }),
    // Transações do ano
    prisma.transacao.groupBy({
      by: ['tipo'],
      where: {
        data: { gte: inicioAno },
      },
      _sum: { valor: true },
    }),
    // Transações mês anterior
    prisma.transacao.groupBy({
      by: ['tipo'],
      where: {
        data: {
          gte: mesAnterior,
          lt: inicioMes,
        },
      },
      _sum: { valor: true },
    }),
    // Gorjetas por guia (mês)
    prisma.transacao.groupBy({
      by: ['guiaId'],
      where: {
        tipo: 'GORJETA',
        data: { gte: inicioMes },
        guiaId: { not: null },
      },
      _sum: { valor: true },
      _count: { id: true },
    }),
    // Receita por tour (mês) - otimizado
    prisma.sessaoTour.findMany({
      where: {
        status: 'COMPLETADA',
        dataHora: { gte: inicioMes },
      },
      select: {
        tour: {
          select: { nome: true, precoBase: true },
        },
        _count: {
          select: { reservas: true },
        },
      },
    }),
  ]);

  // Calcular receita das sessões - ajustado para _count
  const receitaSessoes = sessoesCompletadas.reduce((acc, sessao) => {
    const receita = sessao.tour.precoBase * sessao._count.reservas;
    return acc + receita;
  }, 0);

  // Calcular totais do mês
  const totalGorjetasMes = transacoesMes
    .filter((t) => t.tipo === 'GORJETA')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalBalancoMes = transacoesMes
    .filter((t) => t.tipo === 'BALANCO')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalAjustesMes = transacoesMes
    .filter((t) => t.tipo === 'AJUSTE')
    .reduce((acc, t) => acc + t.valor, 0);

  // Calcular totais do mês anterior
  const totalGorjetasMesAnterior = transacoesMesAnterior
    .find((t) => t.tipo === 'GORJETA')?._sum.valor || 0;

  const totalBalancoMesAnterior = transacoesMesAnterior
    .find((t) => t.tipo === 'BALANCO')?._sum.valor || 0;

  // Variação mensal
  const variacaoGorjetas = totalGorjetasMesAnterior > 0
    ? ((totalGorjetasMes - totalGorjetasMesAnterior) / totalGorjetasMesAnterior) * 100
    : 0;

  const variacaoBalanco = totalBalancoMesAnterior > 0
    ? ((totalBalancoMes - totalBalancoMesAnterior) / totalBalancoMesAnterior) * 100
    : 0;

  // Enriquecer gorjetas por guia - otimizado com join único
  const gorjetasComGuias = await prisma.transacao.findMany({
    where: {
      tipo: 'GORJETA',
      data: { gte: inicioMes },
      guiaId: { not: null },
    },
    select: {
      guiaId: true,
      valor: true,
      guia: {
        select: { nome: true },
      },
    },
  });

  const gorjetasGuiaMap = gorjetasComGuias.reduce((acc, item) => {
    const nome = item.guia?.nome || 'Guia Removido';
    if (!acc[nome]) {
      acc[nome] = { nome, total: 0, quantidade: 0 };
    }
    acc[nome].total += item.valor;
    acc[nome].quantidade += 1;
    return acc;
  }, {} as Record<string, { nome: string; total: number; quantidade: number }>);

  const gorjetasGuiaEnriquecido = Object.values(gorjetasGuiaMap);

  // Calcular receita por tour - ajustado para _count
  const receitaPorTourAgrupado = receitaPorTour.reduce((acc, sessao) => {
    const tourNome = sessao.tour.nome;
    const receita = sessao.tour.precoBase * sessao._count.reservas;
    
    if (!acc[tourNome]) {
      acc[tourNome] = { nome: tourNome, total: 0, sessoes: 0 };
    }
    
    acc[tourNome].total += receita;
    acc[tourNome].sessoes += 1;
    
    return acc;
  }, {} as Record<string, { nome: string; total: number; sessoes: number }>);

  const receitaTourArray = Object.values(receitaPorTourAgrupado).sort(
    (a, b) => b.total - a.total
  );

  return {
    receitaSessoes,
    totalGorjetasMes,
    totalBalancoMes,
    totalAjustesMes,
    variacaoGorjetas,
    variacaoBalanco,
    transacoesMes,
    transacoesAno,
    gorjetasGuia: gorjetasGuiaEnriquecido.sort((a, b) => b.total - a.total),
    receitaPorTour: receitaTourArray,
  };
}

export default async function FinancialPage() {
  const dados = await getFinancialData();

  // Preparar dados para exportação
  const transacoesExport = dados.transacoesMes.map(t => ({
    Data: new Date(t.data).toLocaleDateString('pt-BR'),
    Tipo: t.tipo,
    Guia: t.guia?.nome || '-',
    Tour: t.sessaoTour?.tour.nome || '-',
    Descrição: t.descricao || '-',
    Valor: t.valor,
  }));

  const gorjetasExport = dados.gorjetasGuia.map(g => ({
    Guia: g.nome,
    Total: g.total,
    Quantidade: g.quantidade,
    Média: (g.total / g.quantidade).toFixed(2),
  }));

  const receitaPorTourExport = dados.receitaPorTour.map(r => ({
    Tour: r.nome,
    Total: r.total,
    Sessões: r.sessoes,
    Média: (r.total / r.sessoes).toFixed(2),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestão Financeira</h2>
          <p className="text-gray-600 mt-1">
            Balanço, receitas e gorjetas
          </p>
        </div>
        <div className="flex gap-2">
          <AdicionarTransacaoButton />
        </div>
      </div>

      <Tabs defaultValue="balanco" className="w-full">
        <TabsList>
          <TabsTrigger value="balanco">Balanço</TabsTrigger>
          <TabsTrigger value="gorjetas">Gorjetas</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="balanco" className="space-y-6">
          <Suspense fallback={<div>Carregando dados...</div>}>
            <BalancoContentWrapper dados={dados} receitaPorTourExport={receitaPorTourExport} />
          </Suspense>
        </TabsContent>

        <TabsContent value="gorjetas" className="space-y-6">
          <Suspense fallback={<div>Carregando dados...</div>}>
            <GorjetasContentWrapper dados={dados} gorjetasExport={gorjetasExport} />
          </Suspense>
        </TabsContent>

        <TabsContent value="transacoes" className="space-y-6">
          <Suspense fallback={<div>Carregando dados...</div>}>
            <TransacoesContentWrapper dados={dados} transacoesExport={transacoesExport} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BalancoContent({ dados }: any) {
  const receitaTotal = dados.receitaSessoes + dados.totalBalancoMes;
  const despesasTotal = Math.abs(dados.totalAjustesMes);
  const lucroLiquido = receitaTotal - despesasTotal;

  return (
    <>
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total (mês)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                €{receitaTotal.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
          {dados.variacaoBalanco !== 0 && (
            <p className={`text-xs mt-2 ${
              dados.variacaoBalanco > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {dados.variacaoBalanco > 0 ? '+' : ''}
              {dados.variacaoBalanco.toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita de Tours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                €{dados.receitaSessoes.toFixed(2)}
              </p>
            </div>
            <Euro className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gorjetas Totais</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                €{dados.totalGorjetasMes.toFixed(2)}
              </p>
            </div>
            <PiggyBank className="w-10 h-10 text-purple-500" />
          </div>
          {dados.variacaoGorjetas !== 0 && (
            <p className={`text-xs mt-2 ${
              dados.variacaoGorjetas > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {dados.variacaoGorjetas > 0 ? '+' : ''}
              {dados.variacaoGorjetas.toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lucro Líquido</p>
              <p className={`text-2xl font-bold mt-1 ${
                lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                €{lucroLiquido.toFixed(2)}
              </p>
            </div>
            <Wallet className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Receita por Tour */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Receita por Tour (mês atual)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tour
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Sessões
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Receita Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Média/Sessão
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dados.receitaPorTour.map((tour: any) => (
                <tr key={tour.nome} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tour.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {tour.sessoes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                    €{tour.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    €{(tour.total / tour.sessoes).toFixed(2)}
                  </td>
                </tr>
              ))}
              {dados.receitaPorTour.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma receita registrada no período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function GorjetasContent({ dados }: any) {
  return (
    <>
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Gorjetas</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                €{dados.totalGorjetasMes.toFixed(2)}
              </p>
            </div>
            <PiggyBank className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média por Guia</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                €{dados.gorjetasGuia.length > 0
                  ? (dados.totalGorjetasMes / dados.gorjetasGuia.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Variação Mensal</p>
              <p className={`text-2xl font-bold mt-1 ${
                dados.variacaoGorjetas >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {dados.variacaoGorjetas > 0 ? '+' : ''}
                {dados.variacaoGorjetas.toFixed(1)}%
              </p>
            </div>
            {dados.variacaoGorjetas >= 0 ? (
              <TrendingUp className="w-10 h-10 text-green-500" />
            ) : (
              <TrendingDown className="w-10 h-10 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Ranking de Gorjetas por Guia */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Gorjetas por Guia (mês atual)
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dados.gorjetasGuia.map((guia: any, index: number) => (
              <div
                key={guia.nome}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : index === 1
                        ? 'bg-gray-200 text-gray-700'
                        : index === 2
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-600'
                    } font-bold`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{guia.nome}</p>
                    <p className="text-sm text-gray-600">
                      {guia.quantidade} gorjeta{guia.quantidade !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    €{guia.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    €{(guia.total / guia.quantidade).toFixed(2)} média
                  </p>
                </div>
              </div>
            ))}
            {dados.gorjetasGuia.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhuma gorjeta registrada no período
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TransacoesContent({ dados }: any) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Todas as Transações (mês atual)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Descrição
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dados.transacoesMes.map((transacao: any) => (
              <tr key={transacao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transacao.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      transacao.tipo === 'GORJETA'
                        ? 'bg-purple-100 text-purple-800'
                        : transacao.tipo === 'BALANCO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {transacao.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transacao.guia?.nome || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transacao.sessaoTour?.tour.nome || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transacao.descricao || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                  <span
                    className={
                      transacao.valor >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {transacao.valor >= 0 ? '+' : ''}€{transacao.valor.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
            {dados.transacoesMes.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Nenhuma transação registrada no período
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Wrappers client-side para incluir botões de exportação
function BalancoContentWrapper({ dados, receitaPorTourExport }: any) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <ExportButton 
          data={receitaPorTourExport} 
          filename="receita_por_tour" 
          title="Exportar Receitas"
        />
      </div>
      <BalancoContent dados={dados} />
    </>
  );
}

function GorjetasContentWrapper({ dados, gorjetasExport }: any) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <ExportButton 
          data={gorjetasExport} 
          filename="gorjetas_por_guia" 
          title="Exportar Gorjetas"
        />
      </div>
      <GorjetasContent dados={dados} />
    </>
  );
}

function TransacoesContentWrapper({ dados, transacoesExport }: any) {
  return (
    <>
      <div className="flex justify-end mb-4">
        <ExportButton 
          data={transacoesExport} 
          filename="transacoes" 
          title="Exportar Transações"
        />
      </div>
      <TransacoesContent dados={dados} />
    </>
  );
}
