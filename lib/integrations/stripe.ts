import { stub, mockId } from '@/lib/stubs';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface Refund {
  id: string;
  amount: number;
  status: string;
  reason?: string;
}

/**
 * StripeService stub. Substitua por integração real preenchendo os métodos
 * abaixo e instalando a SDK do Stripe. Veja docs/CUSTOMIZATION.md.
 */
export class StripeService {
  async createPaymentIntent(
    amount: number,
    currency: string = 'eur',
    metadata?: Record<string, string>,
  ): Promise<PaymentIntent> {
    const id = mockId('pi');
    stub('stripe.createPaymentIntent', { amount, currency, metadata });
    return {
      id,
      amount,
      currency,
      status: 'requires_payment_method',
      clientSecret: `${id}_secret_mock`,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    stub('stripe.confirmPayment', { paymentIntentId });
    return { id: paymentIntentId, status: 'succeeded', amount: 0 };
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  ): Promise<Refund> {
    stub('stripe.createRefund', { paymentIntentId, amount, reason });
    return {
      id: mockId('re'),
      amount: amount ?? 0,
      status: 'succeeded',
      reason,
    };
  }

  async getPaymentStatus(paymentIntentId: string) {
    stub('stripe.getPaymentStatus', { paymentIntentId });
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 0,
      currency: 'eur',
    };
  }

  async createCheckoutSession(params: {
    amount: number;
    currency?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    const id = mockId('cs');
    stub('stripe.createCheckoutSession', params);
    return {
      id,
      url: `/mock-checkout/${id}`,
    };
  }

  verifyWebhookSignature(_payload: string | Buffer, _signature: string) {
    stub('stripe.verifyWebhookSignature');
    return { type: 'mock.event', data: { object: {} } };
  }

  async handleWebhook(_payload: string | Buffer, _signature: string) {
    stub('stripe.handleWebhook');
    return { received: true, type: 'mock.event' };
  }
}

export const stripeService = new StripeService();
