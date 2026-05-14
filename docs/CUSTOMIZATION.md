# Customizando o TourPilot Dashboard

Este guia mostra como adaptar o template para um projeto real.

---

## 1. Trocar o branding

Arquivos a editar:

- [app/layout.tsx](../app/layout.tsx) — `metadata.title` / `description`
- [app/page.tsx](../app/page.tsx) — heading e cards da home
- [app/dashboard/layout.tsx](../app/dashboard/layout.tsx) — logo lateral
- [app/login/page.tsx](../app/login/page.tsx) — título e credenciais demo
- [package.json](../package.json) — `name`
- [README.md](../README.md) — descrição
- [lib/reports/pdf-generator.ts](../lib/reports/pdf-generator.ts) — título e cor dos PDFs
- [lib/auth/two-factor.ts](../lib/auth/two-factor.ts) — `issuer` do TOTP

---

## 2. Trocar o banco de SQLite para PostgreSQL/MySQL

### PostgreSQL

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
```

```bash
npm run db:push
npm run db:seed
```

### Campos a ajustar ao migrar

O schema atual usa **CSV strings** em vez de `String[]` para compatibilidade
com SQLite. Em Postgres você pode usar arrays nativos:

```prisma
// Exemplo: Tour.idiomas
// SQLite (atual):
idiomas String  // "pt,en,es"

// PostgreSQL:
idiomas String[]
```

E remover o helper `csvToArray()` em código que parseia esses campos.

---

## 3. Ativar integrações externas (substituir stubs)

Todos os stubs ficam em [lib/stubs.ts](../lib/stubs.ts). Para ativar:

### 3.1 Email (Resend)

```bash
npm install resend
```

Edite [lib/integrations/email.ts](../lib/integrations/email.ts):

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  async send(options: EmailOptions) {
    return resend.emails.send({
      from: options.from ?? 'noreply@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
  // ... substituir cada método chamando resend.emails.send()
}
```

Defina `RESEND_API_KEY` em `.env`.

### 3.2 Pagamentos (Stripe)

```bash
npm install stripe
```

Edite [lib/integrations/stripe.ts](../lib/integrations/stripe.ts):

```ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class StripeService {
  async createPaymentIntent(amount: number, currency = 'eur', metadata?) {
    return stripe.paymentIntents.create({ amount, currency, metadata });
  }
  // ... substituir cada método pela chamada real
}
```

Variáveis em `.env`:

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3.3 Telegram (Telegraf)

```bash
npm install telegraf
```

Edite [lib/telegram/alerts.ts](../lib/telegram/alerts.ts):

```ts
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const chatId = process.env.TELEGRAM_CHAT_ID!;

export async function enviarAlerta(mensagem: string) {
  await bot.telegram.sendMessage(chatId, mensagem);
}
```

### 3.4 OTA (GetYourGuide/Viator)

Edite [lib/integrations/getyourguide.ts](../lib/integrations/getyourguide.ts)
e substitua os `stub(...)` por `fetch()` real contra a API oficial.

---

## 4. Ativar cron jobs

Schedulers em [lib/etl/scheduler.ts](../lib/etl/scheduler.ts) e
[lib/monitoring/scheduler.ts](../lib/monitoring/scheduler.ts) estão **gated**
por `ENABLE_CRON=true`. Para ativar:

```bash
# .env
ENABLE_CRON=true
```

E importe os arquivos em algum entrypoint persistente (ex: worker dedicado),
não em Vercel serverless (que é stateless).

---

## 5. Ativar Sentry

```bash
# .env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=...
```

Os arquivos `sentry.*.config.ts` e `instrumentation.ts` já estão prontos —
sem DSN definido, o Sentry simplesmente não inicializa.

---

## 6. Adicionar/alterar permissões

Edite [lib/permissions.ts](../lib/permissions.ts):

```ts
export enum Permission {
  // ... permissões existentes
  MINHA_NOVA_ACAO = 'MINHA_NOVA_ACAO',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [/* ... */ Permission.MINHA_NOVA_ACAO],
  EQUIPE: [/* ... */],
  GUIA: [/* ... */],
};
```

Use em rotas:

```ts
import { hasPermission, Permission } from '@/lib/permissions';

if (!hasPermission(session.user.role, Permission.MINHA_NOVA_ACAO)) {
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
}
```

---

## 7. Adicionar um novo papel (role)

1. Editar enum `Role` em [lib/permissions.ts](../lib/permissions.ts)
2. Adicionar entrada em `ROLE_PERMISSIONS`
3. Atualizar `prisma/schema.prisma` se necessário (atualmente `role` é `String`)
4. Atualizar UI em [components/role-badge.tsx](../components/role-badge.tsx)

---

## 8. Deploy

### Vercel + Postgres externo (Supabase/Neon)

1. Trocar provider para `postgresql` (seção 2)
2. Configurar `DATABASE_URL` + `NEXTAUTH_SECRET` + `NEXTAUTH_URL` no painel
3. `vercel --prod`

### Docker self-hosted

```bash
docker compose up -d --build
```

O `docker-compose.yml` usa SQLite com volume persistente. Para Postgres,
adicione um serviço `db` e altere `DATABASE_URL`.

---

## 9. Remover features não usadas

Se não precisar de algum módulo, basta apagar:

- **2FA**: [lib/auth/two-factor.ts](../lib/auth/two-factor.ts), `app/api/auth/2fa/`
- **Sentry**: arquivos `sentry.*.config.ts`, `instrumentation.ts`, dep `@sentry/nextjs`
- **i18n**: pasta `messages/`, dep `next-intl`
- **Audit logs**: [lib/audit/](../lib/audit/), `app/api/audit-logs/`, `app/dashboard/audit-logs/`
- **Reports**: [lib/reports/](../lib/reports/), `app/api/reports/`, `app/dashboard/reports/`
- **Sentiment**: [lib/sentiment/](../lib/sentiment/), `app/api/reviews/analyze/`
- **Scheduling**: [lib/scheduling/](../lib/scheduling/), `app/api/scheduling/`
