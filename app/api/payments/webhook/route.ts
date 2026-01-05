import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/integrations/stripe';

// POST /api/payments/webhook - Processar eventos do Stripe
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura ausente' },
        { status: 400 }
      );
    }

    // Processar webhook
    const result = await stripeService.handleWebhook(body, signature);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar webhook' },
      { status: 400 }
    );
  }
}
