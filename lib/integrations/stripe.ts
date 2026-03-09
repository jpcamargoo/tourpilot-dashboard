import Stripe from 'stripe';

// Verificar se a chave do Stripe está configurada
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn('⚠️  STRIPE_SECRET_KEY não configurada. Funcionalidades de pagamento estarão desabilitadas.');
}

// Inicializar o cliente Stripe
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2026-02-25.clover',
}) : null;

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

export class StripeService {
  // Criar uma intenção de pagamento
  async createPaymentIntent(
    amount: number,
    currency: string = 'brl',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    if (!stripe) {
      throw new Error('Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env');
    }
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Converter para centavos
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret || '',
      };
    } catch (error: any) {
      console.error('Stripe Payment Intent Error:', error);
      throw new Error(`Falha ao criar pagamento: ${error.message}`);
    }
  }

  // Confirmar um pagamento
  async confirmPayment(paymentIntentId: string) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env');
    }
    
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      };
    } catch (error: any) {
      console.error('Stripe Confirm Payment Error:', error);
      throw new Error(`Falha ao confirmar pagamento: ${error.message}`);
    }
  }

  // Criar um reembolso
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Refund> {
    if (!stripe) {
      throw new Error('Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env');
    }
    
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason,
      });

      return {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status || 'pending',
        reason: refund.reason || undefined,
      };
    } catch (error: any) {
      console.error('Stripe Refund Error:', error);
      throw new Error(`Falha ao criar reembolso: ${error.message}`);
    }
  }

  // Buscar status de um pagamento
  async getPaymentStatus(paymentIntentId: string) {    if (!stripe) {
      throw new Error('Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env');
    }
        try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000),
      };
    } catch (error: any) {
      console.error('Stripe Get Payment Error:', error);
      throw new Error(`Falha ao buscar pagamento: ${error.message}`);
    }
  }

  // Criar um cliente Stripe
  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env');
    }
    
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      };
    } catch (error: any) {
      console.error('Stripe Create Customer Error:', error);
      throw new Error(`Falha ao criar cliente: ${error.message}`);
    }
  }

  // Criar um webhook endpoint (para eventos do Stripe)
  async handleWebhook(payload: string, signature: string) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env');
    }
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Webhook secret não configurado');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      // Processar eventos específicos
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('Pagamento bem-sucedido:', paymentIntent.id);
          // Implementar lógica de confirmação de reserva
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          console.log('Pagamento falhou:', failedPayment.id);
          // Implementar lógica de notificação de falha
          break;

        case 'refund.created':
          const refund = event.data.object as Stripe.Refund;
          console.log('Reembolso criado:', refund.id);
          // Implementar lógica de processamento de reembolso
          break;

        default:
          console.log(`Evento não tratado: ${event.type}`);
      }

      return { received: true };
    } catch (error: any) {
      console.error('Stripe Webhook Error:', error);
      throw new Error(`Webhook inválido: ${error.message}`);
    }
  }

  // Listar todos os pagamentos de um cliente
  async listCustomerPayments(customerId: string, limit: number = 10) {
    if (!stripe) {
      throw new Error('Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env');
    }
    
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit,
      });

      return paymentIntents.data.map(pi => ({
        id: pi.id,
        amount: pi.amount / 100,
        currency: pi.currency,
        status: pi.status,
        created: new Date(pi.created * 1000),
      }));
    } catch (error: any) {
      console.error('Stripe List Payments Error:', error);
      throw new Error(`Falha ao listar pagamentos: ${error.message}`);
    }
  }
}

// Singleton
export const stripeService = new StripeService();
