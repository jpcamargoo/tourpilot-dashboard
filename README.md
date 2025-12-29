# Vibrant City Tours — Dashboard MVP

Sistema de gestão operacional e business intelligence para tours guiados. 

## 🎯 Funcionalidades

### MVP (Sprint 0–3)
- ✅ Ingestão automática de reservas e check-in
- ✅ Métricas essenciais: visitantes/mês, idiomas, origem, ocupação
- ✅ Agenda básica dos guias (visualização + input manual validado)
- ✅ Alertas operacionais via Telegram
- ✅ Dashboards com mapas e tabelas
- ✅ Exportações Excel/PDF

### Fase 2 (Sprint 4)
- ✅ Comparativos por guia/tour
- ✅ Pipeline de reviews (scraping + sentimento)
- ✅ Financial lite (balanço + gorjetas)
- ✅ Calendário avançado com alocação inteligente

### Fase 3 (Sprint 5)
- ⏳ Origem avançada (enriquecimento de dados)
- ⏳ Geolocalização e rotas
- ⏳ Relatórios automáticos por e-mail
- ⏳ Governança completa (papéis, logs, auditoria)

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Visualização**: Recharts, Radix UI, shadcn/ui
- **Automação**: node-cron, Telegraf (Telegram Bot)
- **ETL**: Axios, Cheerio (scraping)

## 📦 Setup Inicial

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Configurar banco de dados PostgreSQL

**Opção A: Docker (recomendado)**
```bash
docker run --name vibrant-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vibrant_tours -p 5432:5432 -d postgres:16
```

**Opção B: Local**
Instale PostgreSQL 16 e crie o database `vibrant_tours`.

### 4. Executar migrations
```bash
npm run db:push
# Ou para migrations versionadas:
npm run db:migrate
```

### 5. Iniciar desenvolvimento
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📊 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run db:studio` | Abre Prisma Studio (GUI do banco) |
| `npm run db:push` | Sincroniza schema sem migrations |
| `npm run db:migrate` | Cria e executa migrations |
| `npm run etl:reservas` | Ingesta dados de reservas |
| `npm run etl:reviews` | Scraping de reviews |
| `npm run backup:db` | Backup do banco de dados |

## 🗂️ Estrutura de Pastas

```
vibrant/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rotas de autenticação
│   ├── dashboard/           # Dashboard principal
│   ├── api/                 # API Routes
│   └── layout.tsx           # Layout global
├── components/              # Componentes React
│   ├── ui/                  # Componentes base (shadcn)
│   ├── dashboard/           # Componentes do dashboard
│   └── forms/               # Formulários
├── lib/                     # Utilitários e lógica
│   ├── prisma.ts            # Cliente Prisma
│   ├── auth.ts              # Configuração NextAuth
│   ├── etl/                 # Pipeline de ingestão
│   ├── telegram/            # Bot Telegram
│   └── utils.ts             # Helpers
├── prisma/                  # Schema e migrations
│   └── schema.prisma
├── scripts/                 # Scripts de automação
│   ├── etl/                 # Jobs ETL
│   └── backup/              # Backup automático
└── public/                  # Assets estáticos
```

## 🔐 Segurança

- Autenticação via NextAuth.js
- Papéis: `ADMIN`, `GUIA`, `EQUIPE`
- Variáveis sensíveis em `.env` (nunca commitar)
- Validação de entrada com Zod
- Rate limiting nas APIs

## 🚀 Deploy

### Vercel + Supabase (recomendado)
1. Push para GitHub
2. Conectar repositório no Vercel
3. Adicionar variáveis de ambiente
4. Configurar PostgreSQL no Supabase

### Docker (self-hosted)
```bash
docker-compose up -d
```

## 📞 Suporte

Para questões técnicas, consulte a documentação em `/docs` ou abra uma issue.

---

**Desenvolvido para Vibrant City Tours** 🌟
