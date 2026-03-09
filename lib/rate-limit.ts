import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Usar Map para melhor performance + limite de tamanho para evitar vazamento de memória
const MAX_STORE_SIZE = 10000;
const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /**
   * Número máximo de requisições permitidas no intervalo
   */
  maxRequests: number;
  
  /**
   * Janela de tempo em milissegundos
   */
  windowMs: number;
  
  /**
   * Mensagem de erro customizada
   */
  message?: string;
}

/**
 * Implementação simples de rate limiting para Next.js API routes
 * Usa armazenamento em memória (resetado ao reiniciar o servidor)
 * 
 * Para produção, considere usar Redis ou similar
 */
export function rateLimit(config: RateLimitConfig) {
  const { maxRequests, windowMs, message = 'Muitas requisições. Tente novamente mais tarde.' } = config;

  return async (request: Request): Promise<NextResponse | null> => {
    // Obter identificador único do cliente (IP ou user-agent como fallback)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const identifier = `${ip}-${userAgent}`;

    const now = Date.now();
    const userLimit = store.get(identifier);

    // Se não existe registro ou já passou a janela, criar novo
    if (!userLimit || now > userLimit.resetTime) {
      // Evitar crescimento infinito da store
      if (store.size >= MAX_STORE_SIZE) {
        cleanupExpiredLimits();
        // Se ainda estiver cheia após cleanup, remover a entrada mais antiga
        if (store.size >= MAX_STORE_SIZE) {
          const firstKey = store.keys().next().value;
          if (firstKey) store.delete(firstKey);
        }
      }
      store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Permite a requisição
    }

    // Incrementar contador
    userLimit.count++;

    // Se excedeu o limite, retornar erro 429
    if (userLimit.count > maxRequests) {
      const resetIn = Math.ceil((userLimit.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: message,
          retryAfter: resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(userLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Adicionar headers informativos
    return null; // Permite a requisição
  };
}

/**
 * Configurações pré-definidas de rate limit
 */
export const RateLimitPresets = {
  /**
   * Para autenticação: 5 tentativas por minuto
   */
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Muitas tentativas de login. Aguarde 1 minuto.',
  },
  
  /**
   * Para APIs de leitura: 100 requisições por minuto
   */
  read: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
  },
  
  /**
   * Para APIs de escrita: 20 requisições por minuto
   */
  write: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Muitas operações de escrita. Aguarde um momento.',
  },
  
  /**
   * Para operações críticas (delete): 10 requisições por 5 minutos
   */
  critical: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutos
    message: 'Muitas operações críticas. Aguarde alguns minutos.',
  },
};

/**
 * Limpar registros expirados periodicamente (executar em cron job ou similar)
 */
export function cleanupExpiredLimits() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}

// Limpar a cada 10 minutos
if (typeof global !== 'undefined') {
  setInterval(cleanupExpiredLimits, 10 * 60 * 1000);
}
