/**
 * Stubs unificados para integrações externas.
 *
 * Em template, todas as integrações externas (email, payments, telegram, OTA,
 * scraping) usam estes stubs por padrão. Para ativar provedores reais,
 * implemente a lógica em cada arquivo lib/integrations/*.ts ou lib/telegram/*.ts
 * e remova a chamada a `stub()`.
 */

const isTest = process.env.NODE_ENV === 'test';

/**
 * Loga uma chamada simulada a uma integração externa e retorna um valor
 * configurável (default: `{ ok: true }`).
 */
export function stub<T = { ok: true }>(
  name: string,
  payload?: unknown,
  returnValue?: T,
): T {
  if (!isTest) {
    // eslint-disable-next-line no-console
    console.log(`[STUB:${name}]`, payload ?? '');
  }
  return (returnValue ?? ({ ok: true } as unknown as T)) as T;
}

/** Gera um ID determinístico para respostas mockadas. */
export function mockId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
