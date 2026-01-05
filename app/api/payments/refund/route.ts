import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripeService } from '@/lib/integrations/stripe';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';
import { hasPermission, Permission } from '@/lib/permissions';

// POST /api/payments/refund - Criar reembolso
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas admins podem fazer reembolsos
    if (!hasPermission(session.user.role, Permission.REFUND_PAYMENT)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { paymentIntentId, amount, reason } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID é obrigatório' },
        { status: 400 }
      );
    }

    // Criar reembolso
    const refund = await stripeService.createRefund(
      paymentIntentId,
      amount,
      reason
    );

    // Log da ação
    await AuditLogger.log({
      userId: session.user.id,
      action: AuditAction.UPDATE_TRANSACAO,
      resource: 'refund',
      resourceId: refund.id,
      details: {
        paymentIntentId,
        amount: refund.amount,
        reason: refund.reason,
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      refund,
    });
  } catch (error: any) {
    console.error('Erro ao criar reembolso:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar reembolso' },
      { status: 500 }
    );
  }
}
