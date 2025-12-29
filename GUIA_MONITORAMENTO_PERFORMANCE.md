# 🔍 Guia de Monitoramento e Debug de Performance

## 📊 Como Validar as Otimizações

### 1. **Verificar Cache Funcionando**

#### No Browser DevTools:
```
1. Abra Chrome DevTools (F12)
2. Vá para Network tab
3. Acesse uma página do dashboard
4. Observe o tempo de carregamento
5. Recarregue a página (F5) dentro de 30-60s
6. Compare: segunda carga deve ser MUITO mais rápida
```

#### Indicadores de sucesso:
- ✅ Primeira carga: 500-1000ms
- ✅ Segunda carga (dentro do cache): 50-200ms
- ✅ Ícone "(from cache)" no Network tab

---

### 2. **Monitorar Queries do Prisma**

#### Habilitar Logs de Query:

Adicione no `.env`:
```env
# Logging de queries
DATABASE_URL="postgresql://..."
PRISMA_LOG_LEVEL=info
```

E em [lib/prisma.ts](lib/prisma.ts), ajuste:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Habilita logs
});
```

#### O que observar:
```bash
# No terminal do servidor, você verá:
prisma:query SELECT "Tour"."id", "Tour"."nome" FROM "Tour"...

# Conte quantas queries aparecem ao navegar
# ANTES: ~15-30 queries por página
# DEPOIS: ~3-8 queries por página
```

---

### 3. **Testar Performance Percebida**

#### Teste Manual (método rápido):
```
1. Limpe cache do browser (Ctrl+Shift+Del)
2. Cronometre com celular:
   - Clique em "Financial"
   - Tempo até ver skeleton
   - Tempo até ver dados reais
   
Target:
- Skeleton: <100ms
- Dados reais: <1000ms
```

#### Lighthouse Audit:
```bash
# No Chrome DevTools
1. Abra Lighthouse tab
2. Selecione "Performance"
3. Run audit
4. Score target: >85
```

---

### 4. **Verificar Memory Leaks**

#### Chrome Task Manager:
```
1. Chrome > More Tools > Task Manager (Shift+Esc)
2. Navegue entre páginas do dashboard
3. Observe "Memory Footprint"
4. Deve permanecer estável (~50-150MB)
```

#### React DevTools Profiler:
```
1. Instale React DevTools extension
2. Abra Profiler tab
3. Click "Record"
4. Navegue no dashboard
5. Stop recording
6. Analise flame chart - componentes azuis/verdes são OK
```

---

### 5. **Simular Carga de Múltiplos Usuários**

#### Teste Simples (PowerShell):
```powershell
# Simular 5 usuários acessando dashboard
1..5 | ForEach-Object {
    Start-Process "http://localhost:3000/dashboard"
    Start-Sleep -Milliseconds 500
}

# Observe no terminal do servidor
# Deve ver poucos logs de query (cache funcionando!)
```

#### Teste Avançado (k6 ou Artillery):
```bash
# Instalar k6
npm install -g k6

# Criar script test-load.js:
import http from 'k6/http';
export default function() {
  http.get('http://localhost:3000/dashboard');
}

# Rodar teste
k6 run --vus 10 --duration 30s test-load.js
```

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: Cache não funciona
**Sintomas:**
- Sempre vê queries no terminal
- Tempo de carregamento igual em reloads

**Soluções:**
```typescript
// Verificar se tem force-dynamic em algum layout
// ❌ Remover isso:
export const dynamic = 'force-dynamic';

// ✅ Usar isso:
export const revalidate = 30;
```

---

### Problema 2: Skeleton não aparece
**Sintomas:**
- Tela branca até dados carregarem

**Soluções:**
```tsx
// Verificar imports
import { DashboardSkeleton } from '@/components/loading-skeletons';

// Verificar Suspense
<Suspense fallback={<DashboardSkeleton />}>
  <MeuComponente />
</Suspense>
```

---

### Problema 3: Queries ainda lentas
**Sintomas:**
- Cache funciona mas primeira carga ainda lenta

**Investigação:**
```bash
# Habilitar Prisma query logs
# Procurar por:
# 1. Queries sem WHERE (full table scans)
# 2. Múltiplas queries para mesma tabela (N+1)
# 3. Queries retornando >1000 rows

# Soluções:
# - Adicionar índices no banco
# - Usar select específico
# - Adicionar take/limit
```

---

### Problema 4: Exportação travando
**Sintomas:**
- Botão de export demora ou trava

**Soluções:**
```tsx
// Limitar dados antes de exportar
const dadosExport = dados
  .slice(0, 1000) // Máximo 1000 registros
  .map(item => ({
    // Apenas campos necessários
  }));

<ExportButton data={dadosExport} />
```

---

## 📈 Métricas para Acompanhar

### KPIs de Performance:

#### 1. **Time to First Byte (TTFB)**
- Target: <200ms
- Como medir: Network tab > Doc > Timing > TTFB

#### 2. **First Contentful Paint (FCP)**
- Target: <1.0s
- Como medir: Lighthouse

#### 3. **Time to Interactive (TTI)**
- Target: <2.5s
- Como medir: Lighthouse

#### 4. **Cache Hit Rate**
- Target: >70%
- Como calcular:
  ```
  Cache Hits / Total Requests * 100
  ```

#### 5. **Database Query Time**
- Target: <100ms por query
- Como medir: Prisma logs

---

## 🔧 Ferramentas Recomendadas

### Development:
1. **Chrome DevTools** - Performance profiling
2. **React DevTools** - Component profiling
3. **Prisma Studio** - Query inspection

### Production (opcional):
1. **Vercel Analytics** - Real user monitoring
2. **Sentry** - Error tracking + performance
3. **DataDog** - APM completo

---

## 📝 Checklist de Validação Diária

Execute ao fazer deploy:

- [ ] Lighthouse score >85
- [ ] Nenhum erro no console
- [ ] Cache funcionando (reload rápido)
- [ ] Skeleton aparece antes dos dados
- [ ] Export funciona sem travar
- [ ] Queries <10 por página (Prisma logs)
- [ ] Memory footprint estável

---

## 🚨 Red Flags para Investigar

Sinais de que algo está errado:

1. **Query Count Alto**
   - >20 queries em uma página
   - Mesma query repetida >3x

2. **Memory Growth**
   - Memory footprint aumenta continuamente
   - >500MB para uma página simples

3. **Cache Miss Rate Alto**
   - >50% de requests não usando cache
   - Revalidate muito curto (<10s)

4. **Slow Queries**
   - Queries >500ms
   - Frequentes no Prisma log

---

## 💡 Dicas de Otimização Adicional

### Se ainda estiver lento:

#### 1. **Database Indexes**
```sql
-- Adicionar índices em colunas filtradas frequentemente
CREATE INDEX idx_reserva_data ON "Reserva"("dataReserva");
CREATE INDEX idx_transacao_data_tipo ON "Transacao"("data", "tipo");
CREATE INDEX idx_sessao_status_data ON "SessaoTour"("status", "dataHora");
```

#### 2. **Database Connection Pool**
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '&connection_limit=10'
    }
  }
});
```

#### 3. **React Query / SWR (client caching)**
```bash
npm install @tanstack/react-query
```

---

## 📞 Quando Escalar

Considere otimizações avançadas se:
- >100 usuários simultâneos
- >100k registros no banco
- Queries consistentemente >200ms
- Cache hit rate <50%

Nestes casos, considere:
- Redis para cache externo
- Read replicas do banco
- CDN para assets
- Server-side rendering otimizado

---

**Última atualização:** 29/12/2025  
**Mantido por:** GitHub Copilot
