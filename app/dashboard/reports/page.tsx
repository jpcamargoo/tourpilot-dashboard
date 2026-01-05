'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReportsGenerator from '@/components/reports-generator';
import { FileText, TrendingUp, Users, Star, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  // Definir período padrão (último mês)
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const defaultStartDate = lastMonth.toISOString().split('T')[0];
  const defaultEndDate = today.toISOString().split('T')[0];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-gray-600 mt-2">
          Gere relatórios detalhados em PDF para análise e documentação
        </p>
      </div>

      {/* Cards de Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-200 rounded-lg">
                <FileText className="h-5 w-5 text-green-700" />
              </div>
              <CardTitle className="text-lg">Tours</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Performance, sessões e taxa de ocupação
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-200 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-700" />
              </div>
              <CardTitle className="text-lg">Financeiro</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Receitas, despesas e lucro líquido
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
              <CardTitle className="text-lg">Guias</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Performance e avaliações dos guias
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-200 rounded-lg">
                <Star className="h-5 w-5 text-orange-700" />
              </div>
              <CardTitle className="text-lg">Avaliações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Reviews e análise de sentimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gerador de Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportsGenerator
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
          />
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recursos dos Relatórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">✅</div>
                <div>
                  <p className="font-medium text-sm">Tabelas Detalhadas</p>
                  <p className="text-xs text-gray-600">Dados completos e organizados</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">✅</div>
                <div>
                  <p className="font-medium text-sm">Resumos Estatísticos</p>
                  <p className="text-xs text-gray-600">KPIs e métricas principais</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">✅</div>
                <div>
                  <p className="font-medium text-sm">Formato Profissional</p>
                  <p className="text-xs text-gray-600">Logo e identidade visual</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5">✅</div>
                <div>
                  <p className="font-medium text-sm">Pronto para Impressão</p>
                  <p className="text-xs text-gray-600">Alta qualidade em PDF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Dica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Para análises mensais, selecione o primeiro e último dia do mês.
                Para comparativos anuais, use o período de 01/01 a 31/12.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg">💡 Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Todas as exportações de relatórios são registradas nos logs de auditoria
                para conformidade e rastreabilidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
