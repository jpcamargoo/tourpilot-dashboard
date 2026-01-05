# Guia de Monitoramento e Testes

## 🔍 Monitoramento com Sentry

### Configuração

1. **Criar conta no Sentry**
   - Acesse https://sentry.io
   - Crie um novo projeto Next.js
   - Copie o DSN

2. **Adicionar variável de ambiente**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

3. **Instalar dependências**
   ```bash
   npm install @sentry/nextjs
   ```

4. **Inicializar Sentry**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

### Recursos Habilitados

- ✅ Error tracking automático
- ✅ Performance monitoring
- ✅ Session replay (10% de sessões)
- ✅ User feedback
- ✅ Release tracking
- ✅ Source maps

### Uso Manual

```typescript
import * as Sentry from "@sentry/nextjs";

// Capturar erro
try {
  // código
} catch (error) {
  Sentry.captureException(error);
}

// Adicionar contexto
Sentry.setUser({
  id: user.id,
  email: user.email,
});

// Breadcrumbs personalizados
Sentry.addBreadcrumb({
  message: 'Tour criado',
  level: 'info',
  data: { tourId }
});
```

---

## 🧪 Testes Automatizados

### Estrutura de Testes

```
__tests__/
├── database.test.ts        # Testes de conexão
├── api/
│   ├── tours.test.ts       # Testes de API
│   ├── guias.test.ts
│   └── sessoes.test.ts
└── components/
    ├── navbar.test.tsx     # Testes de componentes
    └── export-button.test.tsx
```

### Comandos

```bash
# Rodar todos os testes
npm test

# Testes em watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Testes específicos
npm test tours.test
```

### Configuração Jest

**jest.config.ts** - Configuração principal
- Suporte a TypeScript
- Aliases (@/)
- Coverage mínimo: 50%
- Ambiente jsdom para React

**jest.setup.ts** - Configuração global
- Mocks do Next.js router
- Mocks do NextAuth
- Testing Library matchers

### Escrevendo Testes

**Exemplo - Teste de API:**
```typescript
import { GET } from '@/app/api/tours/route';

describe('Tours API', () => {
  it('should return tours list', async () => {
    const req = new NextRequest('http://localhost:3000/api/tours');
    const response = await GET(req);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

**Exemplo - Teste de Componente:**
```typescript
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/navbar';

describe('Navbar', () => {
  it('should render logo', () => {
    render(<Navbar />);
    expect(screen.getByText('Vibrant City Tours')).toBeInTheDocument();
  });
});
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions

**Workflow:** `.github/workflows/ci.yml`

**Etapas:**
1. **Lint & Type Check**
   - ESLint
   - TypeScript compiler
   - Prisma validation

2. **Build**
   - Next.js build
   - Bundle size check
   - Prisma generate

3. **Tests**
   - Unit tests
   - Integration tests
   - Coverage report

### Configuração de Secrets

No GitHub: Settings → Secrets → Actions

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...
SENTRY_DSN=https://...
```

### Status Badges

Adicione ao README.md:
```markdown
![CI](https://github.com/jpcamargoo/vibrant-city-tours/workflows/CI/CD%20Pipeline/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-80%25-green)
```

---

## 📊 Métricas e Dashboards

### Sentry Dashboard
- Errors por hora/dia
- Performance metrics
- User impact
- Release comparison

### Vercel Analytics
- Page views
- Load time
- Core Web Vitals
- Real User Monitoring

### Custom Metrics
```typescript
// lib/monitoring/metrics.ts
export function trackMetric(name: string, value: number) {
  // Enviar para Sentry
  Sentry.metrics.distribution(name, value);
  
  // Ou custom endpoint
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ name, value })
  });
}
```

---

## 🔔 Alertas

### Sentry Alerts

Configurar em Sentry:
- Erro com mais de 10 ocorrências/hora
- Taxa de erro > 5%
- Performance degradation > 50%
- Novos tipos de erro

### Notificações

Integrar com:
- Slack
- Email
- PagerDuty
- Discord

---

## ✅ Checklist de Produção

Antes de deploy em produção:

- [ ] Sentry configurado e testado
- [ ] Variáveis de ambiente configuradas
- [ ] Testes passando (mínimo 50% coverage)
- [ ] CI/CD pipeline funcionando
- [ ] Alertas configurados
- [ ] Source maps enviados para Sentry
- [ ] Performance baseline estabelecida
- [ ] Monitoring dashboard criado

---

## 📝 Próximos Passos

1. **Expandir testes**
   - E2E com Playwright
   - Testes de carga (k6)
   - Visual regression (Percy)

2. **Melhorar monitoramento**
   - Custom dashboards
   - Business metrics
   - User analytics

3. **Automação adicional**
   - Auto-deploy em staging
   - Rollback automático
   - Performance budgets
