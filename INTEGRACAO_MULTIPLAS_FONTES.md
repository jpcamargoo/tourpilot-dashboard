# 🔗 Integração com Múltiplas Plataformas - Vibrant Tours

**Data:** 06 de Janeiro de 2026  
**Status:** Configuração Pendente

---

## 🎯 Visão Geral

Centralizar reservas e reviews de **todas as plataformas** em um único dashboard.

### Plataformas Identificadas:
- ✅ GetYourGuide
- ✅ Viator
- ✅ Booking.com
- ✅ TripAdvisor
- ✅ Google Maps
- ✅ Reservas Diretas (WhatsApp/Telefone)

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Configuração Básica** (Semana 1) ⚡

#### 1. Telegram Bot (Alertas)
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 5 minutos  
**Custo:** Grátis

```env
TELEGRAM_BOT_TOKEN="aguardando_criacao"
TELEGRAM_CHAT_ID="aguardando_criacao"
```

**Ação:**
1. Criar bot via @BotFather
2. Criar grupo "Vibrant Tours - Alertas"
3. Adicionar bot ao grupo
4. Configurar .env

---

#### 2. Google Places API (Reviews)
**Prioridade:** 🟡 ALTA  
**Tempo:** 15 minutos  
**Custo:** Grátis (5k requests/mês)

```env
GOOGLE_PLACES_API_KEY="aguardando_criacao"
GOOGLE_PLACE_IDS="aguardando_identificacao"
```

**Ação:**
1. Criar projeto Google Cloud
2. Ativar Places API
3. Criar API Key
4. Identificar Place IDs dos tours
5. Configurar .env
6. Testar: `npm run etl:reviews`

**Resultado:** Reviews do Google importadas automaticamente diariamente às 3h

---

### **FASE 2: Reviews Complementares** (Semana 1-2) 🌟

#### 3. TripAdvisor API
**Prioridade:** 🟡 ALTA  
**Tempo:** 20 minutos  
**Custo:** Grátis (plano básico)

```env
TRIPADVISOR_API_KEY="aguardando_criacao"
TRIPADVISOR_LOCATION_IDS="aguardando_identificacao"
```

**Ação:**
1. Criar conta em https://developer-tripadvisor.com
2. Solicitar acesso Content API
3. Copiar API Key
4. Identificar Location IDs
5. Configurar .env
6. Testar

**Resultado:** Reviews do TripAdvisor importadas automaticamente

---

### **FASE 3: Reservas Automáticas** (Semana 2-3) 🎯

#### 4. GetYourGuide - Webhooks
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 30 minutos  
**Custo:** Grátis

**Ação:**
1. Contatar GetYourGuide Partner Support
2. Solicitar acesso webhooks
3. Fornecer URL: `https://seu-dashboard.vercel.app/api/webhooks/getyourguide`
4. Configurar credenciais

**Resultado:** Reservas em tempo real (instantâneo)

---

#### 5. Viator - Webhooks
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 30 minutos  
**Custo:** Grátis

**Ação:**
1. Acessar Viator Partner Hub
2. Configurar webhooks
3. URL: `https://seu-dashboard.vercel.app/api/webhooks/viator`
4. Testar integração

**Resultado:** Reservas em tempo real

---

#### 6. Booking.com - API/Webhooks
**Prioridade:** 🟢 MÉDIA  
**Tempo:** 45 minutos  
**Custo:** Grátis (parceiros)

```env
BOOKING_API_KEY="aguardando_criacao"
BOOKING_PROPERTY_ID="aguardando_identificacao"
```

**Ação:**
1. Acessar Booking.com Partner Portal
2. Solicitar acesso API
3. Configurar webhooks
4. Testar

**Resultado:** Reservas automáticas ou tempo real

---

### **FASE 4: Alternativas e Backup** (Semana 3-4) 🔄

#### 7. Importação CSV (Múltiplas Fontes)
**Prioridade:** 🟢 BAIXA (backup)  
**Tempo:** Contínuo  

**Para plataformas sem API:**
```
1. Exportar CSV da plataforma
2. Salvar em: c:\Sites\vibrant\data\reservas\
3. Rodar: npm run etl:reservas
4. Sistema importa automaticamente
```

**Templates disponíveis:**
- `docs/GUIA_IMPORTACAO.md`
- `data/template_reservas.csv`

---

#### 8. GetYourGuide Reviews (Manual)
**Solução:** CSV Import

Como GetYourGuide não tem API pública de reviews:
1. Exportar reviews manualmente
2. Converter para CSV
3. Importar via sistema

---

## 🔧 CONFIGURAÇÃO .ENV COMPLETA

```env
# ===================================
# BANCO DE DADOS
# ===================================
DATABASE_URL="postgresql://..." # ✅ JÁ CONFIGURADO
NEXTAUTH_SECRET="..." # ✅ JÁ CONFIGURADO
NEXTAUTH_URL="..." # ✅ JÁ CONFIGURADO

# ===================================
# TELEGRAM BOT (Alertas)
# ===================================
TELEGRAM_BOT_TOKEN="" # ❌ PENDENTE
TELEGRAM_CHAT_ID="" # ❌ PENDENTE

# ===================================
# REVIEWS - GOOGLE
# ===================================
GOOGLE_PLACES_API_KEY="" # ❌ PENDENTE
GOOGLE_PLACE_IDS="" # ❌ PENDENTE (separar por vírgula)

# ===================================
# REVIEWS - TRIPADVISOR
# ===================================
TRIPADVISOR_API_KEY="" # ❌ PENDENTE
TRIPADVISOR_LOCATION_IDS="" # ❌ PENDENTE (separar por vírgula)

# ===================================
# RESERVAS - GETYOURGUIDE
# ===================================
GETYOURGUIDE_API_KEY="" # ⏳ AGUARDANDO APROVAÇÃO
GETYOURGUIDE_PARTNER_ID="" # ⏳ AGUARDANDO APROVAÇÃO
GETYOURGUIDE_WEBHOOK_SECRET="" # ⏳ AGUARDANDO APROVAÇÃO

# ===================================
# RESERVAS - VIATOR
# ===================================
VIATOR_API_KEY="" # ⏳ AGUARDANDO APROVAÇÃO
VIATOR_SUPPLIER_ID="" # ⏳ AGUARDANDO APROVAÇÃO
VIATOR_WEBHOOK_SECRET="" # ⏳ AGUARDANDO APROVAÇÃO

# ===================================
# RESERVAS - BOOKING.COM
# ===================================
BOOKING_API_KEY="" # ⏳ AGUARDANDO APROVAÇÃO
BOOKING_PROPERTY_ID="" # ⏳ AGUARDANDO IDENTIFICAÇÃO
BOOKING_WEBHOOK_SECRET="" # ⏳ AGUARDANDO APROVAÇÃO

# ===================================
# BACKUP - CSV
# ===================================
GESTAO_CSV_PATH="./data/reservas" # ✅ SEMPRE DISPONÍVEL
```

---

## 🚀 ROTEIRO DE CONFIGURAÇÃO

### **Semana 1: Essencial**
- [x] Banco de dados (Supabase) - FEITO
- [x] Autenticação - FEITO
- [ ] **Telegram Bot** - 5 min
- [ ] **Google Places API** - 15 min
- [ ] **TripAdvisor API** - 20 min

**Resultado:** Alertas funcionando + Reviews automáticas

---

### **Semana 2-3: Automação de Reservas**
- [ ] Solicitar acesso GetYourGuide webhooks
- [ ] Solicitar acesso Viator API
- [ ] Solicitar acesso Booking.com API
- [ ] Configurar endpoints de webhook
- [ ] Testar integrações

**Resultado:** Reservas em tempo real

---

### **Semana 4: Otimização**
- [ ] Configurar CSV import como backup
- [ ] Documentar fluxos
- [ ] Treinar equipe
- [ ] Monitorar performance

---

## 📊 ARQUITETURA FINAL

```
┌─────────────────────────────────────────────┐
│         PLATAFORMAS EXTERNAS                │
├─────────────────────────────────────────────┤
│ GetYourGuide │ Viator │ Booking │ Diretas  │
│ TripAdvisor  │ Google Maps │ Telefone      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│           CAMADA DE INTEGRAÇÃO              │
├─────────────────────────────────────────────┤
│ • Webhooks (tempo real)                     │
│ • APIs (sync diário às 3h e 6h)            │
│ • CSV Import (manual/backup)                │
│ • Entrada Manual (dashboard)                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│         VIBRANT DASHBOARD                   │
├─────────────────────────────────────────────┤
│ • Database único (PostgreSQL)               │
│ • Análise unificada                         │
│ • KPIs consolidados                         │
│ • Alertas automáticos (Telegram)            │
└─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│            EQUIPE / GESTÃO                  │
└─────────────────────────────────────────────┘
```

---

## ✅ BENEFÍCIOS DA CENTRALIZAÇÃO

### **Antes (Múltiplos Sistemas):**
- ❌ Dados espalhados em 5+ plataformas
- ❌ Impossível ver visão consolidada
- ❌ Análise manual e demorada
- ❌ Risco de perder reservas/reviews

### **Depois (Dashboard Único):**
- ✅ **Tudo em um lugar** - Uma única tela
- ✅ **KPIs unificados** - Métricas reais de toda operação
- ✅ **Alertas inteligentes** - Telegram avisa problemas
- ✅ **Tempo real** - Webhooks + sync automático
- ✅ **Histórico completo** - Análise de tendências
- ✅ **Backup garantido** - CSV sempre disponível

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### **HOJE (30 minutos):**
1. ✅ Criar Telegram Bot
2. ✅ Configurar Google Places API
3. ✅ Testar primeiro alerta

### **ESTA SEMANA:**
4. ✅ Configurar TripAdvisor API
5. ✅ Ativar jobs automáticos
6. ✅ Importar dados históricos (CSV)

### **PRÓXIMAS 2 SEMANAS:**
7. ⏳ Solicitar acessos APIs (GetYourGuide, Viator, Booking)
8. ⏳ Configurar webhooks
9. ⏳ Testar integrações

---

## 📞 CONTATOS PARA SUPORTE API

### GetYourGuide
- **Portal:** https://partner.getyourguide.com
- **Suporte:** partner-support@getyourguide.com
- **Solicitar:** Webhook access + API credentials

### Viator
- **Portal:** https://www.viator.com/supplier
- **Suporte:** supplier.support@viator.com
- **Solicitar:** API access + Webhook configuration

### Booking.com
- **Portal:** https://partner.booking.com
- **Suporte:** Via Partner Hub
- **Solicitar:** Connectivity API

### TripAdvisor
- **Portal:** https://developer-tripadvisor.com
- **Suporte:** Via portal
- **Solicitar:** Content API access

### Google Cloud
- **Console:** https://console.cloud.google.com
- **Documentação:** https://developers.google.com/maps/documentation/places

---

## 🔍 MONITORAMENTO

### Logs ETL
Verificar importações:
```powershell
# Ver últimas importações
npm run db:studio
# Navegar para: LogETL
```

### Alertas Telegram
Status do bot:
```powershell
tsx lib/monitoring/scheduler.ts
```

### Testes Manuais
```powershell
# Testar reviews
npm run etl:reviews

# Testar reservas
npm run etl:reservas

# Testar alertas
tsx scripts/alertas/verificar.ts
```

---

## 💰 CUSTOS ESTIMADOS

| Serviço | Plano | Custo/Mês |
|---------|-------|-----------|
| Supabase | Hobby | $0 (atual) ✅ |
| Telegram Bot | - | $0 ✅ |
| Google Places API | 5k/mês | $0 ✅ |
| TripAdvisor API | Básico | $0 ✅ |
| GetYourGuide | Partner | $0 ✅ |
| Viator | Supplier | $0 ✅ |
| Booking.com | Partner | $0 ✅ |
| **TOTAL** | - | **$0/mês** 🎉 |

*Nota: Custos zero enquanto dentro dos limites gratuitos*

---

## 📈 MÉTRICAS DE SUCESSO

Após implementação completa:

- ✅ **100% das reservas** centralizadas
- ✅ **100% das reviews** importadas
- ✅ **< 1 hora** delay máximo (webhooks)
- ✅ **24/7** monitoramento automático
- ✅ **0** reservas perdidas
- ✅ **Visão única** de toda operação

---

## 🎓 DOCUMENTAÇÃO DE APOIO

- `README.md` - Overview geral
- `SETUP.md` - Guia de instalação
- `docs/GUIA_IMPORTACAO.md` - Templates CSV
- `docs/MANUAL_ADMIN.md` - Manual administrativo
- `COMANDOS_UTEIS.md` - Comandos do sistema

---

**Status Geral:** 🟡 Em Configuração  
**Próxima Ação:** Configurar Telegram Bot (5 min)

