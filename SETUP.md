# Guia de Setup — Vibrant City Tours Dashboard

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 16+ (local ou Docker)
- Conta Telegram (para alertas via bot)
- Git (recomendado)

## 🚀 Instalação

### 1. Instalar dependências

Abra o PowerShell e navegue até o diretório do projeto:

```powershell
cd c:\Sites\vibrant
npm install
```

### 2. Configurar PostgreSQL

**Opção A: Docker (recomendado)**

```powershell
docker run --name vibrant-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=vibrant_tours `
  -p 5432:5432 `
  -d postgres:16
```

**Opção B: PostgreSQL local**

Se você já tem PostgreSQL instalado, crie o banco:

```sql
CREATE DATABASE vibrant_tours;
```

### 3. Configurar variáveis de ambiente

```powershell
Copy-Item .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vibrant_tours?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-uma-chave-secreta-aqui"

TELEGRAM_BOT_TOKEN="seu-token-do-bot-telegram"
TELEGRAM_CHAT_ID="seu-chat-id"

# Configure a fonte de dados (API ou CSV)
GESTAO_API_URL="https://api.seu-software.com"
GESTAO_API_KEY="sua-api-key"
```

### 4. Criar tabelas no banco

```powershell
npm run db:push
```

Ou para criar migrations versionadas:

```powershell
npm run db:migrate
```

### 5. Iniciar aplicação

```powershell
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🤖 Configurar Bot do Telegram

### 1. Criar bot

1. Abra o Telegram e procure por `@BotFather`
2. Digite `/newbot` e siga as instruções
3. Copie o token fornecido (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Obter Chat ID

1. Inicie conversa com seu bot
2. Envie qualquer mensagem
3. Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
4. Copie o valor de `chat.id`

### 3. Configurar no .env

```env
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="987654321"
```

## 📊 Executar Jobs ETL

### Ingestão de reservas (manual)

```powershell
npm run etl:reservas
```

### Scraping de reviews (manual)

```powershell
npm run etl:reviews
```

### Verificar alertas (manual)

```powershell
tsx scripts/alertas/verificar.ts
```

### Backup manual

```powershell
npm run backup:db
```

## ⏰ Automação com Agendador

Para executar jobs automaticamente:

### Jobs ETL (ingestão diária)

```powershell
tsx lib/etl/scheduler.ts
```

### Monitoramento (alertas + backup)

```powershell
tsx lib/monitoring/scheduler.ts
```

**Recomendação**: Configure esses scripts como serviços do Windows ou use PM2:

```powershell
npm install -g pm2
pm2 start lib/etl/scheduler.ts --name etl-jobs --interpreter tsx
pm2 start lib/monitoring/scheduler.ts --name monitoring --interpreter tsx
pm2 save
pm2 startup
```

## 🗄️ Prisma Studio (GUI do Banco)

Para visualizar e editar dados:

```powershell
npm run db:studio
```

Abre em [http://localhost:5555](http://localhost:5555)

## 📝 Dados de Exemplo (Seed)

Para popular o banco com dados de teste:

```powershell
tsx prisma/seed.ts
```

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL

Verifique se o PostgreSQL está rodando:

```powershell
docker ps
# ou
Get-Service postgresql*
```

### Erros de migrations

Resetar banco (CUIDADO: apaga todos os dados):

```powershell
npx prisma migrate reset
```

### Port 3000 já em uso

Mude a porta no comando:

```powershell
$env:PORT=3001; npm run dev
```

## 🚢 Deploy em Produção

### Vercel + Supabase

1. Push para GitHub
2. Conecte no [Vercel](https://vercel.com)
3. Configure PostgreSQL no [Supabase](https://supabase.com)
4. Adicione variáveis de ambiente no Vercel

### Docker Compose (self-hosted)

```powershell
docker-compose up -d
```

## 📞 Suporte

- Documentação completa: `/README.md`
- Issues: abra issue no GitHub
- Logs: `npm run dev` mostra erros em tempo real

---

**Bom trabalho! 🎉**
