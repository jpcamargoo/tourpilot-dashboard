# 📊 MÉTODOS DE EXTRAÇÃO DE DADOS - Vibrant City Tours

## ✅ STATUS DO BANCO DE DADOS

**Conexão:** ✅ Operacional  
**Plataforma:** Supabase PostgreSQL  
**Total de Registros:** 38 registros  
**Última Atualização:** 29/12/2025

### Dados Disponíveis:
- 👥 **5 Usuários** (1 Admin + 4 Guias)
- 🎯 **4 Guias** ativos (3 ATIVO, 1 FÉRIAS)
- 🎫 **5 Tours** configurados (todos ativos)
- 📅 **4 Sessões** agendadas
- 📋 **5 Reservas** confirmadas
- 🌍 **3 Visitantes** de diferentes países
- ⭐ **4 Reviews** (média 4.63★)
- 💰 **3 Transações** financeiras (€433.50 total)
- 📍 **3 Pontos de Encontro**

---

## 🔄 MÉTODOS DE EXTRAÇÃO DISPONÍVEIS

### 1. 🌐 **PRISMA STUDIO** (Interface Visual)

**Como acessar:**
```powershell
npx prisma studio
```
Abre em: http://localhost:5555

**✅ Vantagens:**
- Interface visual intuitiva
- Navegação entre relacionamentos
- Edição direta de registros
- Filtros e buscas rápidas
- Ideal para exploração e testes

**❌ Limitações:**
- Não é adequado para grandes volumes
- Sem exportação em massa nativa
- Requer interface gráfica

**📊 Uso Ideal:**
- Visualização rápida dos dados
- Debug e verificação
- Edições pontuais
- Exploração de relacionamentos

---

### 2. 📝 **SCRIPTS TYPESCRIPT** (Personalizado)

**Scripts Disponíveis:**

#### a) Análise Completa dos Dados
```powershell
npx tsx scripts/analisar-dados.ts
```
**Retorna:** Relatório detalhado de todas as entidades com estatísticas

#### b) Teste do Banco
```powershell
npx tsx scripts/test-database.ts
```
**Retorna:** Validação de conexão, contagens e integridade

#### c) Script Customizado (Criar o seu próprio)
```typescript
// scripts/exportar-custom.ts
import { prisma } from '../lib/prisma';
import fs from 'fs/promises';

async function exportarReservas() {
  const reservas = await prisma.reserva.findMany({
    include: {
      visitante: true,
      sessaoTour: {
        include: {
          tour: true,
          guia: true,
        },
      },
    },
  });

  // Exportar como JSON
  await fs.writeFile(
    'export-reservas.json',
    JSON.stringify(reservas, null, 2)
  );
  
  console.log(`✅ Exportadas ${reservas.length} reservas`);
}

exportarReservas();
```

**✅ Vantagens:**
- Total flexibilidade
- Pode incluir lógica de negócio
- Suporte a múltiplos formatos
- Processamento de dados complexos

**📊 Uso Ideal:**
- Exportações customizadas
- Transformações de dados
- Relatórios específicos
- Automação

---

### 3. 🔌 **API REST** (HTTP Endpoints)

**Endpoints Disponíveis:**

```bash
# Tours
GET http://localhost:3000/api/tours
GET http://localhost:3000/api/tours?id={tourId}

# Guias
GET http://localhost:3000/api/guias
GET http://localhost:3000/api/guias?id={guiaId}

# Sessões
GET http://localhost:3000/api/sessoes
GET http://localhost:3000/api/sessoes?dataInicio={data}&dataFim={data}

# Reservas (via Dashboard Filter)
POST http://localhost:3000/api/dashboard/filter
Body: { "dataInicio": "2024-01-01", "dataFim": "2024-12-31" }

# Transações
GET http://localhost:3000/api/transacoes
GET http://localhost:3000/api/transacoes?guiaId={id}&inicio={data}&fim={data}

# Reviews
GET http://localhost:3000/api/reviews/scrape

# Pontos de Encontro
GET http://localhost:3000/api/pontos
```

**⚠️ Autenticação Necessária:**
Todas as APIs requerem sessão válida (NextAuth)

**Exemplo com cURL:**
```bash
# Fazer login primeiro para obter cookie de sessão
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vibrantcitytours.com","password":"admin123"}' \
  -c cookies.txt

# Usar o cookie nas requisições
curl http://localhost:3000/api/tours -b cookies.txt
```

**✅ Vantagens:**
- Acesso remoto
- Integração com outras ferramentas
- Respeita permissões do sistema
- Rate limiting integrado

**📊 Uso Ideal:**
- Integrações externas
- Dashboards externos
- Aplicativos mobile
- Sincronização com outros sistemas

---

### 4. 💾 **BACKUP COMPLETO** (SQL Dump)

```powershell
npm run backup:db
```

**Script:** [scripts/backup/backup-database.ts](scripts/backup/backup-database.ts)

**O que faz:**
- Usa `pg_dump` para exportar todo o banco
- Gera arquivo `.sql` com timestamp
- Salva em `./backups/`
- Inclui estrutura + dados

**Formato do arquivo:**
```
vibrant_tours_2025-12-29T14-30-00-000Z.sql
```

**✅ Vantagens:**
- Backup completo e portável
- Fácil restauração
- Formato padrão PostgreSQL
- Ideal para migração

**❌ Limitações:**
- Requer PostgreSQL instalado localmente
- Não funciona diretamente com pgBouncer
- Arquivo pode ser grande

**📊 Uso Ideal:**
- Backups periódicos
- Migração de ambiente
- Disaster recovery
- Clonagem do banco

---

### 5. 📄 **EXPORTAÇÃO CSV/JSON** (Criar Script Customizado)

**Exemplo - Exportar para CSV:**

```typescript
// scripts/exportar-csv.ts
import { prisma } from '../lib/prisma';
import { createObjectCsvWriter } from 'csv-writer';

async function exportarReservasCSV() {
  const reservas = await prisma.reserva.findMany({
    include: {
      visitante: true,
      sessaoTour: {
        include: { tour: true },
      },
    },
  });

  const csvWriter = createObjectCsvWriter({
    path: 'reservas.csv',
    header: [
      { id: 'id', title: 'ID' },
      { id: 'nomeVisitante', title: 'Visitante' },
      { id: 'emailVisitante', title: 'Email' },
      { id: 'pais', title: 'País' },
      { id: 'tourNome', title: 'Tour' },
      { id: 'dataHora', title: 'Data/Hora' },
      { id: 'status', title: 'Status' },
      { id: 'numPessoas', title: 'Pessoas' },
      { id: 'valorTotal', title: 'Valor' },
    ],
  });

  const records = reservas.map(r => ({
    id: r.id,
    nomeVisitante: r.visitante?.nome || '',
    emailVisitante: r.visitante?.email || '',
    pais: r.visitante?.pais || '',
    tourNome: r.sessaoTour.tour.nome,
    dataHora: r.sessaoTour.dataHora.toISOString(),
    status: r.status,
    numPessoas: r.numPessoas,
    valorTotal: r.valorTotal,
  }));

  await csvWriter.writeRecords(records);
  console.log(`✅ Exportadas ${records.length} reservas para CSV`);
}

exportarReservasCSV();
```

**Instalar dependência:**
```powershell
npm install csv-writer
```

**✅ Vantagens:**
- Compatível com Excel/Google Sheets
- Fácil análise em ferramentas BI
- Formato universal
- Leve e portável

**📊 Uso Ideal:**
- Análise em planilhas
- Relatórios para gestão
- Importação em outras ferramentas
- Arquivamento

---

### 6. 🔄 **ETL AUTOMÁTICO** (Extração Programada)

**Scripts ETL Disponíveis:**

#### a) Ingestão de Reservas
```powershell
npm run etl:reservas
```
**Arquivo:** [scripts/etl/ingest-reservas.ts](scripts/etl/ingest-reservas.ts)

**Fontes Suportadas:**
- API externa (via `GESTAO_API_URL` e `GESTAO_API_KEY`)
- Arquivo CSV local (via `GESTAO_CSV_PATH`)

#### b) Scraping de Reviews
```powershell
npm run etl:reviews
```
**Arquivo:** [scripts/etl/scrape-reviews.ts](scripts/etl/scrape-reviews.ts)

**Fontes:**
- Google Places API
- TripAdvisor (scraping)
- GetYourGuide

**✅ Vantagens:**
- Automação completa
- Log de execução (tabela `logs_etl`)
- Controle de duplicatas
- Validação com Zod

**📊 Uso Ideal:**
- Sincronização automática
- Importação em massa
- Atualização periódica (cron)

---

## 📋 FORMATO DOS DADOS DISPONÍVEIS

### Exemplo de Estrutura - Reserva Completa:
```json
{
  "id": "cmin2kd8...",
  "sessaoTourId": "cm0xwrj1a...",
  "visitanteId": "cm0xwrj19...",
  "status": "CONFIRMADA",
  "numPessoas": 2,
  "valorTotal": 0,
  "origem": "Manual",
  "refExterna": "BOOK-001",
  "dataReserva": "2025-12-01T10:00:00Z",
  "visitante": {
    "nome": "Maria Santos",
    "email": "maria@example.com",
    "telefone": "+55...",
    "idioma": "pt",
    "pais": "BR",
    "cidade": "São Paulo"
  },
  "sessaoTour": {
    "dataHora": "2025-12-02T10:00:00Z",
    "status": "AGENDADA",
    "tour": {
      "nome": "Free Walking Tour Lisboa",
      "duracaoMin": 180,
      "precoBase": 0,
      "idiomas": "pt,en,es,fr"
    },
    "guia": {
      "nome": "João Silva",
      "idiomas": "PT,EN,ES"
    }
  }
}
```

---

## 🎯 RECOMENDAÇÕES POR CASO DE USO

### 📊 Para Análise Rápida:
→ **Prisma Studio** (http://localhost:5555)

### 📈 Para Relatórios Gerenciais:
→ **Script `analisar-dados.ts`** + Exportar para CSV

### 🔄 Para Integrações:
→ **API REST** com autenticação

### 💾 Para Backup:
→ **Script `backup-database.ts`**

### 📥 Para Importação em Planilhas:
→ **Exportação CSV customizada**

### 🤖 Para Automação:
→ **Scripts ETL** com cron jobs

---

## 🛠️ CRIANDO SUA PRÓPRIA EXTRAÇÃO

**Template Básico:**
```typescript
// scripts/minha-extracao.ts
import { prisma } from '../lib/prisma';
import fs from 'fs/promises';

async function minhaExtracao() {
  // 1. Buscar dados
  const dados = await prisma.TABELA.findMany({
    where: { /* filtros */ },
    include: { /* relacionamentos */ },
    orderBy: { /* ordenação */ },
  });

  // 2. Processar (opcional)
  const processados = dados.map(d => ({
    // transformações
  }));

  // 3. Exportar
  await fs.writeFile(
    'minha-extracao.json',
    JSON.stringify(processados, null, 2)
  );

  console.log(`✅ Exportados ${dados.length} registros`);
}

minhaExtracao()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
```

**Executar:**
```powershell
npx tsx scripts/minha-extracao.ts
```

---

## 📞 ACESSO RÁPIDO

| Ferramenta | URL/Comando | Uso |
|------------|-------------|-----|
| **Prisma Studio** | http://localhost:5555 | Visual |
| **API Tours** | http://localhost:3000/api/tours | REST |
| **Dashboard** | http://localhost:3000/dashboard | Web |
| **Análise Completa** | `npx tsx scripts/analisar-dados.ts` | CLI |
| **Backup** | `npm run backup:db` | CLI |

---

## ✅ VERIFICAÇÃO DOS DADOS

Execute agora para ver seus dados:
```powershell
# Análise completa
npx tsx scripts/analisar-dados.ts

# Ou apenas teste de conexão
npx tsx scripts/test-database.ts
```

**🎯 Todos os métodos estão prontos para uso!**
