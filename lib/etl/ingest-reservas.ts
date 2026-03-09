import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import axios from 'axios';

// Schema de validação para reservas
const ReservaSchema = z.object({
  refExterna: z.string(),
  sessaoTourId: z.string().optional(),
  nomeVisitante: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  idioma: z.string().optional(),
  pais: z.string().optional(),
  cidade: z.string().optional(),
  status: z.enum(['CONFIRMADA', 'PENDENTE', 'CANCELADA', 'NO_SHOW', 'COMPLETADA']),
  numPessoas: z.number().int().positive(),
  valorTotal: z.number().positive(),
  origem: z.string().optional(),
  dataReserva: z.string().datetime().or(z.date()),
  tourNome: z.string(),
  dataHoraTour: z.string().datetime().or(z.date()),
});

type ReservaInput = z.infer<typeof ReservaSchema>;

export async function ingerirReservas() {
  const logId = await iniciarLogETL('reservas');

  try {
    console.log('🔄 Iniciando ingestão de reservas...');

    // Opção 1: API do software de gestão
    let reservas: ReservaInput[] = [];

    if (process.env.GESTAO_API_URL && process.env.GESTAO_API_KEY) {
      reservas = await buscarReservasDaAPI();
    }
    // Opção 2: CSV local (fallback)
    else if (process.env.GESTAO_CSV_PATH) {
      reservas = await buscarReservasDeCSV();
    } else {
      throw new Error('Nenhuma fonte de dados configurada (API ou CSV)');
    }

    console.log(`📥 Encontradas ${reservas.length} reservas para processar`);

    let novos = 0;
    let atualizados = 0;
    let erros = 0;

    for (const reserva of reservas) {
      try {
        // Validar dados
        const validada = ReservaSchema.parse(reserva);

        // Buscar ou criar visitante
        let visitante = validada.email 
          ? await prisma.visitante.findFirst({ where: { email: validada.email } })
          : null;

        if (!visitante) {
          visitante = await prisma.visitante.create({
            data: {
              nome: validada.nomeVisitante,
              email: validada.email || `temp_${validada.refExterna}@placeholder.com`,
              telefone: validada.telefone,
              idioma: validada.idioma,
              pais: validada.pais,
              cidade: validada.cidade,
            },
          });
        }

        // Buscar ou criar tour
        let tour = await prisma.tour.findFirst({ where: { nome: validada.tourNome } });
        
        if (!tour) {
          tour = await prisma.tour.create({
            data: {
              nome: validada.tourNome,
              duracaoMin: 120, // Default
              precoBase: validada.valorTotal / validada.numPessoas,
              capacidadeMax: 20,
              idiomas: validada.idioma || 'pt',
            },
          });
        }

        // Buscar ou criar sessão do tour
        const sessao = await prisma.sessaoTour.upsert({
          where: {
            id: validada.sessaoTourId || `${tour.id}_${new Date(validada.dataHoraTour).toISOString()}`,
          },
          update: {},
          create: {
            tourId: tour.id,
            dataHora: new Date(validada.dataHoraTour),
            duracaoMin: 120,
            capacidadeMax: 20,
          },
        });

        // Criar ou atualizar reserva
        const reservaExiste = await prisma.reserva.findFirst({
          where: { refExterna: validada.refExterna },
        });

        if (reservaExiste) {
          await prisma.reserva.update({
            where: { id: reservaExiste.id },
            data: {
              status: validada.status,
              numPessoas: validada.numPessoas,
              valorTotal: validada.valorTotal,
              dataCancelamento:
                validada.status === 'CANCELADA' ? new Date() : reservaExiste.dataCancelamento,
            },
          });
          atualizados++;
        } else {
          await prisma.reserva.create({
            data: {
              sessaoTourId: sessao.id,
              visitanteId: visitante.id,
              status: validada.status,
              numPessoas: validada.numPessoas,
              valorTotal: validada.valorTotal,
              origem: validada.origem,
              refExterna: validada.refExterna,
              dataReserva: new Date(validada.dataReserva),
            },
          });
          novos++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar reserva ${reserva.refExterna}:`, error);
        erros++;
      }
    }

    await finalizarLogETL(logId, 'sucesso', reservas.length, novos, atualizados, erros);

    console.log(`✅ Ingestão concluída: ${novos} novos, ${atualizados} atualizados, ${erros} erros`);

    return { novos, atualizados, erros };
  } catch (error) {
    await finalizarLogETL(logId, 'erro', 0, 0, 0, 0, (error as Error).message);
    throw error;
  }
}

async function buscarReservasDaAPI(): Promise<ReservaInput[]> {
  // Exemplo de integração com API
  const response = await axios.get(`${process.env.GESTAO_API_URL}/reservas`, {
    headers: {
      Authorization: `Bearer ${process.env.GESTAO_API_KEY}`,
    },
    params: {
      desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 30 dias
    },
  });

  return response.data.reservas;
}

async function buscarReservasDeCSV(): Promise<ReservaInput[]> {
  const fs = await import('fs');
  const path = await import('path');
  const csvPath = process.env.GESTAO_CSV_PATH || './data/reservas.csv';
  const resolvedPath = path.resolve(csvPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Arquivo CSV não encontrado: ${resolvedPath}`);
    return [];
  }

  console.log(`📂 Lendo CSV: ${resolvedPath}`);
  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    console.log('⚠️  CSV vazio ou sem dados');
    return [];
  }

  // Parsear cabeçalho
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const reservas: ReservaInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      // Suporte a campos com vírgula dentro de aspas
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      // Mapear colunas para objeto
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      reservas.push({
        refExterna: row['refExterna'] || row['ref_externa'] || `CSV-${i}`,
        nomeVisitante: row['nomeVisitante'] || row['nome_visitante'] || row['nome'],
        email: row['email'] || undefined,
        telefone: row['telefone'] || undefined,
        idioma: row['idioma'] || undefined,
        pais: row['pais'] || undefined,
        cidade: row['cidade'] || undefined,
        status: (row['status'] as any) || 'CONFIRMADA',
        numPessoas: parseInt(row['numPessoas'] || row['num_pessoas'] || '1'),
        valorTotal: parseFloat(row['valorTotal'] || row['valor_total'] || '0'),
        origem: row['origem'] || 'csv',
        dataReserva: row['dataReserva'] || row['data_reserva'] || new Date().toISOString(),
        tourNome: row['tourNome'] || row['tour_nome'] || row['tour'] || 'Tour Importado',
        dataHoraTour: row['dataHoraTour'] || row['data_hora_tour'] || new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Erro ao parsear linha ${i + 1} do CSV:`, error);
    }
  }

  console.log(`📥 ${reservas.length} reservas lidas do CSV`);
  return reservas;
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
  ingerirReservas()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
