'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
}

export function ExportButton({ data, filename, title = 'Exportar Dados' }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      // Pegar headers (chaves do primeiro objeto)
      const headers = Object.keys(data[0]);
      
      // Criar CSV
      const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escapar valores que contenham vírgulas ou aspas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        )
      ].join('\n');

      // Criar Blob com BOM para suporte a UTF-8 no Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar CSV');
    }
  };

  const exportToJSON = () => {
    if (!data || data.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast.success('JSON exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      toast.error('Erro ao exportar JSON');
    }
  };

  const copyToClipboard = () => {
    if (!data || data.length === 0) {
      toast.error('Não há dados para copiar');
      return;
    }

    try {
      const text = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(text);
      toast.success('Dados copiados para área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar dados');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" />
          Exportar como CSV
          <span className="ml-auto text-xs text-gray-500">Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Exportar como JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Copiar para Área de Transferência
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
