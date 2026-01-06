import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';

// Schema de validação para criar reserva
const CriarReservaSchema = z.object({
  sessaoTourId: z.string(),
  visitante: z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido').optional(),
    telefone: z.string().optional(),
    pais: z.string().optional(),
    idioma: z.string().optional(),
    cidade: z.string().optional(),
  }),
  numPessoas: z.number().int().positive('Número de pessoas deve ser positivo'),
  valorTotal: z.number().nonnegative('Valor não pode ser negativo'),
  status: z.enum(['CONFIRMADA', 'PENDENTE', 'CANCELADA', 'NO_SHOW', 'COMPLETADA']).default('CONFIRMADA'),
  origem: z.string().default('manual'),
  observacoes: z.string().optional(),
});

// POST /api/reservas - Criar nova reserva
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validacao = CriarReservaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', detalhes: validacao.error.errors },
        { status: 400 }
      );
    }

    const { sessaoTourId, visitante, numPessoas, valorTotal, status, origem, observacoes } = validacao.data;

    // Verificar se a sessão existe
    const sessao = await prisma.sessaoTour.findUnique({
      where: { id: sessaoTourId },
      include: {
        reservas: true,
      },
    });

    if (!sessao) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    // Verificar capacidade disponível
    const reservasAtivas = sessao.reservas.filter(r => 
      r.status === 'CONFIRMADA' || r.status === 'PENDENTE'
    );
    const totalPessoas = reservasAtivas.reduce((acc, r) => acc + r.numPessoas, 0);
    
    if (totalPessoas + numPessoas > sessao.capacidadeMax) {
      return NextResponse.json(
        { error: `Capacidade excedida. Disponível: ${sessao.capacidadeMax - totalPessoas} pessoas` },
        { status: 400 }
      );
    }

    // Buscar ou criar visitante
    let visitanteDb;
    
    if (visitante.email) {
      visitanteDb = await prisma.visitante.findFirst({
        where: { email: visitante.email },
      });
    }

    if (!visitanteDb) {
      visitanteDb = await prisma.visitante.create({
        data: {
          nome: visitante.nome,
          email: visitante.email,
          telefone: visitante.telefone,
          pais: visitante.pais,
          idioma: visitante.idioma,
          cidade: visitante.cidade,
        },
      });
    }

    // Criar reserva
    const reserva = await prisma.reserva.create({
      data: {
        sessaoTourId,
        visitanteId: visitanteDb.id,
        numPessoas,
        valorTotal,
        status,
        origem,
        observacoes,
        dataReserva: new Date(),
      },
      include: {
        visitante: true,
        sessaoTour: {
          include: {
            tour: true,
          },
        },
      },
    });

    // Log de auditoria
    await AuditLogger.log({
      userId: session.user.id,
      action: AuditAction.CREATE_RESERVA,
      resource: 'reserva',
      resourceId: reserva.id,
      details: {
        visitante: visitanteDb.nome,
        sessaoTourId,
        numPessoas,
        valorTotal,
      },
    });

    return NextResponse.json(reserva, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao criar reserva', detalhes: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// GET /api/reservas - Listar reservas (com filtros)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessaoTourId = searchParams.get('sessaoTourId');
    const status = searchParams.get('status');
    const visitanteId = searchParams.get('visitanteId');

    const where: any = {};

    if (sessaoTourId) {
      where.sessaoTourId = sessaoTourId;
    }

    if (status) {
      where.status = status;
    }

    if (visitanteId) {
      where.visitanteId = visitanteId;
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        visitante: true,
        sessaoTour: {
          include: {
            tour: true,
            guia: true,
          },
        },
      },
      orderBy: {
        dataReserva: 'desc',
      },
    });

    return NextResponse.json(reservas);

  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    );
  }
}
