# TourPilot Dashboard

> Admin template fictício baseado em **Next.js 15 + Prisma + SQLite + NextAuth**.
> Boilerplate funcional com dados 100% fictícios, pronto para servir de base
> em projetos reais.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)]()
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)]()
[![NextAuth](https://img.shields.io/badge/NextAuth-4-7C3AED)]()
[![SQLite](https://img.shields.io/badge/SQLite-zero--config-003B57)]()

---

## ✨ O que tem dentro

- 🔐 **Autenticação completa** (NextAuth + Credentials + bcrypt + 2FA opt-in)
- 👥 **RBAC** com 3 papéis (`ADMIN`, `GUIA`, `EQUIPE`) e middleware de proteção
- 📊 **Dashboards** com gráficos (Recharts), tabelas (TanStack), exportação PDF/Excel
- 🗓️ **CRUD completo** para Guias, Tours, Sessões, Reservas, Reviews, Transações
- 🔍 **Audit logs**, filtros avançados, comparativos, relatórios e análise de sentimento
- ⏰ **ETL/Scheduling** com node-cron (gated por env, default off)
- 🧩 **Stubs de integrações** (Email, Stripe, Telegram, OTA) prontos para customizar
- 🎨 **UI** com Tailwind CSS + shadcn/ui + Radix UI
- 🌍 **i18n** com next-intl (pt, en, es, fr)
- 🧪 **Testes** com Jest + Testing Library

---

## 🚀 Quickstart

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Criar banco SQLite e gerar Prisma client
npm run db:push

# 4. Popular com dados fictícios
npm run db:seed

# 5. Iniciar em modo dev
npm run dev
```

Abra <http://localhost:3000>.

### Credenciais demo

| Papel  | Email                | Senha       |
| ------ | -------------------- | ----------- |
| Admin  | `admin@example.com`  | `admin123`  |
| Guia   | `guia@example.com`   | `guia123`   |
| Equipe | `equipe@example.com` | `equipe123` |

A tela de login mostra botões de acesso rápido para cada perfil.

---

## 📂 Estrutura

```
app/                  # Rotas Next.js (App Router)
  api/                # API routes (REST)
  dashboard/          # Páginas do dashboard protegidas por auth
  login/              # Tela de login com botões demo
components/           # Componentes reutilizáveis
  ui/                 # shadcn/ui (button, card, dialog, table, etc)
lib/
  auth.ts             # Config NextAuth
  auth-helpers.ts     # getSession, requireAuth, requirePermission
  auth/               # 2FA (speakeasy + qrcode)
  permissions.ts      # RBAC (papéis e permissões)
  prisma.ts           # Singleton Prisma
  stubs.ts            # Stubs unificados para integrações externas
  integrations/       # Email, Stripe, GetYourGuide (stubs)
  telegram/           # Alertas Telegram (stub)
  etl/                # Scheduler, scraping, ingestão
  reports/            # Geração de PDF / Excel
  sentiment/          # Análise de sentimento (stub)
  audit/              # Auditoria de mudanças
prisma/
  schema.prisma       # Schema SQLite
  seed.ts             # Dados fictícios (3 guias, 5 tours, 10 sessões…)
messages/             # i18n (pt, en, es, fr)
```

---

## 🔌 Ativando integrações reais

Por padrão, todas as integrações externas usam stubs em `lib/stubs.ts` que
apenas logam no console. Para ativar provedores reais, veja
[docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) — passo a passo para Email
(Resend), Pagamentos (Stripe), Telegram, OTA, Sentry e cron jobs.

---

## 🛠️ Scripts

| Comando             | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento                |
| `npm run build`     | Build de produção                          |
| `npm run start`     | Servidor de produção                       |
| `npm run lint`      | ESLint                                     |
| `npm run test`      | Jest                                       |
| `npm run db:push`   | Sincroniza schema com SQLite               |
| `npm run db:seed`   | Popula com dados fictícios                 |
| `npm run db:studio` | Abre Prisma Studio                         |
| `npm run db:reset`  | Reseta banco + reseed (apaga `dev.db`!)    |

---

## 🧪 Testes

```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

## 📝 Customizando

- **Trocar para PostgreSQL/MySQL**: edite `prisma/schema.prisma`
  (`provider = "postgresql"`), ajuste `DATABASE_URL` e rode `npm run db:push`
- **Adicionar permissões**: edite `lib/permissions.ts`
- **Mudar branding**: ajuste `app/layout.tsx`, `app/page.tsx`,
  `app/dashboard/layout.tsx`
- **Integrações reais**: veja seção [Ativando integrações](#-ativando-integrações-reais)

---

## ⚠️ Observações

- Dados, emails (`*@example.com`), nomes e métricas são todos fictícios.
- SQLite é ideal para template/dev. Em produção, migre para Postgres/MySQL.
- Sentry está como dep opcional — sem `SENTRY_DSN`, não é inicializado.
- 2FA (speakeasy) está pronto para uso mas desabilitado por padrão por usuário.

---

## 📄 Licença

MIT — use livremente como base para seus projetos.
