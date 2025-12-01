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
        const visitante = await prisma.visitante.upsert({
          where: {
            email: validada.email || `temp_${validada.refExterna}@placeholder.com`,
          },
          update: {
            nome: validada.nomeVisitante,
            telefone: validada.telefone,
            idioma: validada.idioma,
            pais: validada.pais,
            cidade: validada.cidade,
          },
          create: {
            nome: validada.nomeVisitante,
            email: validada.email || `temp_${validada.refExterna}@placeholder.com`,
            telefone: validada.telefone,
            idioma: validada.idioma,
            pais: validada.pais,
            cidade: validada.cidade,
          },
        });

        // Buscar ou criar tour
        const tour = await prisma.tour.upsert({
          where: { nome: validada.tourNome },
          update: {},
          create: {
            nome: validada.tourNome,
            duracaoMin: 120, // Default
            precoBase: validada.valorTotal / validada.numPessoas,
            capacidadeMax: 20,
            idiomas: [validada.idioma || 'pt'],
          },
        });

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
  // TODO: Implementar leitura de CSV
  // Usar biblioteca como 'csv-parser' ou 'papaparse'
  console.log('⚠️  Leitura de CSV não implementada ainda');
  return [];
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
