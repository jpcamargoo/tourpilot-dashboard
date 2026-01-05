'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'tours' | 'financial' | 'guides' | 'reviews';

interface ReportsGeneratorProps {
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export default function ReportsGenerator({ 
  defaultStartDate = '', 
  defaultEndDate = '' 
}: ReportsGeneratorProps) {
  const [reportType, setReportType] = useState<ReportType>('tours');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'tours', label: '📍 Relatório de Tours', description: 'Performance e estatísticas dos tours' },
    { value: 'financial', label: '💰 Relatório Financeiro', description: 'Receitas, despesas e transações' },
    { value: 'guides', label: '👥 Relatório de Guias', description: 'Performance e avaliações dos guias' },
    { value: 'reviews', label: '⭐ Relatório de Avaliações', description: 'Reviews e sentimento dos clientes' },
  ];

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Por favor, selecione o período do relatório');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/reports/${reportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      // Baixar o PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório gerado e baixado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Falha ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedReport = reportTypes.find(r => r.value === reportType);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar Relatórios em PDF</CardTitle>
        <CardDescription>
          Exporte relatórios detalhados em formato PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Relatório */}
        <div className="space-y-2">
          <Label>Tipo de Relatório</Label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedReport && (
            <p className="text-sm text-gray-600 mt-2">{selectedReport.description}</p>
          )}
        </div>

        {/* Período */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Botão de Gerar */}
        <Button
          onClick={handleGenerateReport}
          disabled={loading || !startDate || !endDate}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando relatório...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Gerar e Baixar PDF
            </>
          )}
        </Button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> O relatório incluirá todos os dados do período selecionado,
            com tabelas detalhadas e resumos estatísticos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
