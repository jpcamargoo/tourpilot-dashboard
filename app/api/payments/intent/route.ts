import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripeService } from '@/lib/integrations/stripe';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';

// POST /api/payments/intent - Criar intenção de pagamento
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency = 'brl', metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      );
    }

    // Criar payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      currency,
      {
        ...metadata,
        userId: session.user.id,
        userEmail: session.user.email,
      }
    );

    // Log da ação
    await AuditLogger.log({
      userId: session.user.id,
      action: AuditAction.CREATE_TRANSACAO,
      resource: 'payment',
      resourceId: paymentIntent.id,
      details: {
        amount,
        currency,
        status: paymentIntent.status,
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      paymentIntent,
    });
  } catch (error: any) {
    console.error('Erro ao criar payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar pagamento' },
      { status: 500 }
    );
  }
}
