# 🚀 Guia de Instalação Completo - Fases 1, 2 e 3

## 📋 Resumo das Implementações

Este documento contém todas as instruções para instalar e configurar as melhorias implementadas nas **Fases 1, 2 e 3** do projeto Vibrant Tours.

### Fase 1 - Imediato (Testes e Monitoramento)
- ✅ CI/CD com GitHub Actions
- ✅ Monitoramento com Sentry
- ✅ Testes com Jest
- ✅ CSS fixes

### Fase 2 - Curto Prazo (Performance e Segurança)
- ✅ Cache Redis
- ✅ Autenticação 2FA (TOTP)
- ✅ Acessibilidade (WCAG 2.1)

### Fase 3 - Médio Prazo (Integrações)
- ✅ Audit Logging
- ✅ Pagamentos com Stripe
- ✅ Relatórios PDF
- ✅ i18n (4 idiomas: PT, EN, ES, FR)
- ✅ GetYourGuide API
- ✅ Email com Resend

---

## 📦 1. Instalação de Dependências

### 1.1 Instalar Todas as Dependências

Execute o seguinte comando para instalar todos os pacotes necessários:

```bash
npm install redis speakeasy qrcode @sentry/nextjs resend axios stripe jspdf jspdf-autotable date-fns next-intl
```

### 1.2 Instalar Dependências de Desenvolvimento

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest @jest/globals @types/speakeasy @types/qrcode @types/jspdf
```

### 1.3 Verificar package.json

Adicione os scripts de teste no `package.json` (se ainda não existirem):

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🗄️ 2. Configuração do Banco de Dados

### 2.1 Aplicar Migrações Prisma

Execute as migrações para adicionar os campos de 2FA e Audit Logs:

```bash
# Migração para 2FA
npx prisma migrate dev --name add-two-factor-auth

# Migração para Audit Logs
npx prisma migrate dev --name add-audit-logs

# Gerar cliente Prisma atualizado
npx prisma generate
```

### 2.2 Verificar Schema

Confirme que o schema Prisma tem os seguintes modelos:

- ✅ `Usuario` com campos: `twoFactorSecret`, `twoFactorEnabled`, `twoFactorBackupCodes`, `auditLogs`
- ✅ `AuditLog` completo

---

## 🔐 3. Configuração de Variáveis de Ambiente

### 3.1 Atualizar `.env.local`

Adicione todas as variáveis de ambiente necessárias:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_SECRET="seu-secret-aqui-gerado-com-openssl"
NEXTAUTH_URL="http://localhost:3000"

# Redis (Opcional em desenvolvimento)
REDIS_URL="redis://localhost:6379"

# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="vibrant-tours"
SENTRY_PROJECT="vibrant-city-tours"

# GetYourGuide API
GETYOURGUIDE_API_KEY="seu-api-key-aqui"
GETYOURGUIDE_PARTNER_ID="seu-partner-id-aqui"

# Resend Email
RESEND_API_KEY="re_..."
EMAIL_FROM="Vibrant Tours <noreply@vibrantcitytours.com>"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3.2 Gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 🔧 4. Configuração do Sentry

### 4.1 Executar Wizard do Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

Siga as instruções:
1. Fazer login no Sentry
2. Criar projeto "vibrant-city-tours"
3. Copiar o DSN gerado

### 4.2 Verificar Arquivos Criados

O wizard deve criar:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

---

## 🔄 5. Configuração do Redis (Opcional)

### 5.1 Instalar Redis Localmente

#### Windows (com WSL):
```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Docker:
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5.2 Testar Conexão

```bash
redis-cli ping
# Deve retornar: PONG
```

**Nota:** O cache Redis é opcional em desenvolvimento. O código tem fallback automático.

---

## 🐙 6. Configuração do GitHub Actions

### 6.1 Configurar Secrets no GitHub

Vá em: **Settings → Secrets and variables → Actions → New repository secret**

Adicione os seguintes secrets:

- `DATABASE_URL` - URL do banco de dados
- `NEXTAUTH_SECRET` - Secret do NextAuth
- `NEXTAUTH_URL` - URL da aplicação
- `SENTRY_DSN` - DSN do Sentry (opcional para build)

### 6.2 Habilitar Workflows

Os workflows em `.github/workflows/ci.yml` devem executar automaticamente em:
- Push para `main` ou `develop`
- Pull Requests

---

## 🧪 7. Executar Testes

### 7.1 Testar Configuração

```bash
# Executar todos os testes
npm test

# Executar com watch mode
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

### 7.2 Verificar Cobertura

A cobertura mínima está configurada para **50%**. Verifique o relatório em:
```
coverage/lcov-report/index.html
```

---

## 🌐 8. Configuração do i18n (Next.js 15)

### 8.1 Atualizar next.config.mjs

Adicione a configuração do `next-intl`:

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... suas configurações existentes ...
};

export default withNextIntl(nextConfig);
```

### 8.2 Criar Middleware

Crie/atualize `middleware.ts` na raiz:

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const config = {
  matcher: ['/', '/(pt|en|es|fr)/:path*']
};
```

### 8.3 Atualizar Estrutura de Pastas

```
app/
  [locale]/          ← Nova pasta
    layout.tsx       ← Mover layout principal
    page.tsx         ← Mover página principal
    dashboard/       ← Mover todas as rotas
    login/
    api/             ← APIs ficam fora do [locale]
```

---

## 💳 9. Configuração do Stripe

### 9.1 Criar Conta no Stripe

1. Acesse: https://stripe.com
2. Crie uma conta
3. Ative o modo de teste

### 9.2 Obter Chaves de API

1. Acesse: **Developers → API keys**
2. Copie:
   - **Publishable key** (para frontend)
   - **Secret key** (para backend)

### 9.3 Configurar Webhook

1. Acesse: **Developers → Webhooks**
2. Adicione endpoint: `https://seudominio.com/api/payments/webhook`
3. Selecione eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `refund.created`
4. Copie o **Signing secret**

---

## 📧 10. Configuração do Resend

### 10.1 Criar Conta no Resend

1. Acesse: https://resend.com
2. Crie uma conta
3. Verifique seu domínio (ou use domínio de teste)

### 10.2 Obter API Key

1. Acesse: **API Keys**
2. Crie uma nova chave
3. Copie para `RESEND_API_KEY`

---

## 🎫 11. Configuração do GetYourGuide (Opcional)

### 11.1 Obter Credenciais

1. Entre em contato com GetYourGuide
2. Solicite acesso à API de parceiros
3. Obtenha:
   - API Key
   - Partner ID

---

## ✅ 12. Verificação Final

### 12.1 Checklist de Instalação

Verifique se tudo está funcionando:

```bash
# 1. Dependências instaladas
npm list redis speakeasy qrcode @sentry/nextjs

# 2. Banco de dados migrado
npx prisma migrate status

# 3. Variáveis de ambiente
node -e "console.log(process.env.DATABASE_URL ? '✅ DATABASE_URL' : '❌ DATABASE_URL')"

# 4. Build do projeto
npm run build

# 5. Executar testes
npm test

# 6. Iniciar servidor
npm run dev
```

### 12.2 Testar Funcionalidades

1. **Autenticação:**
   - Login funciona
   - 2FA pode ser habilitado

2. **Cache Redis:**
   - Dashboard carrega rápido
   - Dados são cacheados

3. **Sentry:**
   - Erros são reportados
   - Performance é monitorada

4. **Testes:**
   - `npm test` executa com sucesso
   - Cobertura >= 50%

---

## 🚨 Problemas Comuns

### Erro: "Cannot find module 'redis'"
```bash
npm install redis
```

### Erro: "Prisma Client not found"
```bash
npx prisma generate
```

### Erro: "NEXTAUTH_SECRET not set"
```bash
openssl rand -base64 32
# Copie o resultado para .env.local
```

### Redis não conecta
- Verifique se o Redis está rodando: `redis-cli ping`
- O cache funciona sem Redis em dev (fallback automático)

### Testes falham
```bash
# Limpar cache do Jest
npm test -- --clearCache

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentação Adicional

- [MELHORIAS_FASE1.md](./MELHORIAS_FASE1.md) - CI/CD, Sentry, Testes
- [MELHORIAS_FASE2.md](./MELHORIAS_FASE2.md) - Redis, 2FA, Acessibilidade
- [MELHORIAS_FASE3.md](./MELHORIAS_FASE3.md) - Audit, Stripe, PDF, i18n
- [GUIA_2FA.md](./docs/GUIA_2FA.md) - Implementação completa do 2FA
- [MONITORAMENTO_TESTES.md](./docs/MONITORAMENTO_TESTES.md) - Guia de testes

---

## 🎯 Próximos Passos

Após a instalação completa:

1. **Integrar Audit Logger:**
   - Adicionar logs em todas as ações críticas
   - Criar endpoint de API para visualizar logs

2. **Implementar Pagamentos:**
   - Criar fluxo de checkout com Stripe
   - Adicionar página de pagamento
   - Testar webhooks

3. **Gerar Relatórios:**
   - Criar endpoints de API para gerar PDFs
   - Adicionar botões de exportação no dashboard

4. **Ativar i18n:**
   - Reestruturar rotas com `[locale]`
   - Adicionar seletor de idioma

5. **Fase 4:**
   - Machine Learning
   - Mobile App
   - API Marketplace

---

**Última atualização:** Dezembro 2024  
**Versão:** 3.0  
**Suporte:** Consulte a documentação ou entre em contato
