import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReportData {
  title: string;
  subtitle?: string;
  period?: { start: Date; end: Date };
  data: any[];
  columns: { header: string; dataKey: string }[];
  summary?: { label: string; value: string | number }[];
}

export class PDFReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  // Adicionar logo e cabeçalho
  private addHeader(title: string, subtitle?: string, period?: { start: Date; end: Date }) {
    // Logo (placeholder - adicionar logo real depois)
    this.doc.setFontSize(24);
    this.doc.setTextColor(139, 69, 19); // Cor marrom (vibrant tours)
    this.doc.text('Vibrant Tours', 105, 20, { align: 'center' });

    // Título
    this.doc.setFontSize(18);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, 105, 35, { align: 'center' });

    // Subtítulo
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, 105, 45, { align: 'center' });
    }

    // Período
    if (period) {
      const periodText = `Período: ${format(period.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(period.end, 'dd/MM/yyyy', { locale: ptBR })}`;
      this.doc.setFontSize(10);
      this.doc.text(periodText, 105, subtitle ? 52 : 45, { align: 'center' });
    }

    // Data de geração
    const generateDate = `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(generateDate, 105, subtitle ? 58 : (period ? 52 : 45), { align: 'center' });

    return subtitle ? 65 : (period ? 58 : 50);
  }

  // Adicionar rodapé
  private addFooter(pageNumber: number) {
    const pageHeight = this.doc.internal.pageSize.height;
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(
      `Página ${pageNumber}`,
      105,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Gerar relatório de tours
  async generateToursReport(data: ReportData): Promise<Buffer> {
    this.doc = new jsPDF();

    const startY = this.addHeader(
      data.title,
      data.subtitle,
      data.period
    );

    // Tabela de tours
    autoTable(this.doc, {
      startY,
      head: [data.columns.map(col => col.header)],
      body: data.data.map(row =>
        data.columns.map(col => row[col.dataKey] || '-')
      ),
      theme: 'striped',
      headStyles: {
        fillColor: [139, 69, 19], // Marrom
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { top: 10, left: 14, right: 14 },
    });

    // Resumo (se houver)
    if (data.summary && data.summary.length > 0) {
      const finalY = (this.doc as any).lastAutoTable.finalY || startY + 50;
      
      this.doc.setFontSize(12);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text('Resumo', 14, finalY + 15);

      autoTable(this.doc, {
        startY: finalY + 20,
        body: data.summary.map(item => [item.label, item.value]),
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { halign: 'right', cellWidth: 60 },
        },
        margin: { left: 14, right: 14 },
      });
    }

    this.addFooter(1);

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  // Gerar relatório financeiro
  async generateFinancialReport(data: ReportData): Promise<Buffer> {
    this.doc = new jsPDF();

    const startY = this.addHeader(
      data.title,
      data.subtitle,
      data.period
    );

    // Resumo financeiro no topo
    if (data.summary) {
      autoTable(this.doc, {
        startY,
        body: data.summary.map(item => [item.label, item.value]),
        theme: 'grid',
        headStyles: {
          fillColor: [34, 139, 34], // Verde
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 11,
          cellPadding: 4,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { halign: 'right', cellWidth: 80 },
        },
        margin: { left: 14, right: 14 },
      });
    }

    const summaryEndY = data.summary ? (this.doc as any).lastAutoTable.finalY + 10 : startY;

    // Tabela de transações
    autoTable(this.doc, {
      startY: summaryEndY,
      head: [data.columns.map(col => col.header)],
      body: data.data.map(row =>
        data.columns.map(col => row[col.dataKey] || '-')
      ),
      theme: 'striped',
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    this.addFooter(1);

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  // Gerar relatório de guias
  async generateGuidesReport(data: ReportData): Promise<Buffer> {
    this.doc = new jsPDF();

    const startY = this.addHeader(
      data.title,
      data.subtitle,
      data.period
    );

    autoTable(this.doc, {
      startY,
      head: [data.columns.map(col => col.header)],
      body: data.data.map(row =>
        data.columns.map(col => row[col.dataKey] || '-')
      ),
      theme: 'grid',
      headStyles: {
        fillColor: [25, 118, 210], // Azul
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    if (data.summary) {
      const finalY = (this.doc as any).lastAutoTable.finalY || startY + 50;
      
      this.doc.setFontSize(12);
      this.doc.text('Performance dos Guias', 14, finalY + 15);

      autoTable(this.doc, {
        startY: finalY + 20,
        body: data.summary.map(item => [item.label, item.value]),
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 120 },
          1: { halign: 'right', cellWidth: 60 },
        },
        margin: { left: 14, right: 14 },
      });
    }

    this.addFooter(1);

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  // Gerar relatório de reviews
  async generateReviewsReport(data: ReportData): Promise<Buffer> {
    this.doc = new jsPDF();

    const startY = this.addHeader(
      data.title,
      data.subtitle,
      data.period
    );

    // Estatísticas no topo
    if (data.summary) {
      autoTable(this.doc, {
        startY,
        body: data.summary.map(item => [item.label, item.value]),
        theme: 'plain',
        styles: {
          fontSize: 11,
          cellPadding: 3,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { halign: 'right', cellWidth: 80 },
        },
        margin: { left: 14, right: 14 },
      });
    }

    const summaryEndY = data.summary ? (this.doc as any).lastAutoTable.finalY + 10 : startY;

    // Tabela de reviews
    autoTable(this.doc, {
      startY: summaryEndY,
      head: [data.columns.map(col => col.header)],
      body: data.data.map(row =>
        data.columns.map(col => row[col.dataKey] || '-')
      ),
      theme: 'striped',
      headStyles: {
        fillColor: [255, 152, 0], // Laranja
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    this.addFooter(1);

    return Buffer.from(this.doc.output('arraybuffer'));
  }

  // Gerar relatório customizado genérico
  async generateCustomReport(data: ReportData): Promise<Buffer> {
    this.doc = new jsPDF();

    const startY = this.addHeader(
      data.title,
      data.subtitle,
      data.period
    );

    autoTable(this.doc, {
      startY,
      head: [data.columns.map(col => col.header)],
      body: data.data.map(row =>
        data.columns.map(col => row[col.dataKey] || '-')
      ),
      theme: 'grid',
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    if (data.summary) {
      const finalY = (this.doc as any).lastAutoTable.finalY || startY + 50;
      
      autoTable(this.doc, {
        startY: finalY + 10,
        body: data.summary.map(item => [item.label, item.value]),
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2,
        },
        margin: { left: 14, right: 14 },
      });
    }

    this.addFooter(1);

    return Buffer.from(this.doc.output('arraybuffer'));
  }
}

// Singleton
export const pdfReportGenerator = new PDFReportGenerator();
