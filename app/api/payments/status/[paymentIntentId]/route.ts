import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripeService } from '@/lib/integrations/stripe';

// GET /api/payments/status/[paymentIntentId] - Verificar status do pagamento
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { paymentIntentId } = await params;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID é obrigatório' },
        { status: 400 }
      );
    }

    const status = await stripeService.getPaymentStatus(paymentIntentId);

    return NextResponse.json({ status });
  } catch (error: any) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar status do pagamento' },
      { status: 500 }
    );
  }
}
