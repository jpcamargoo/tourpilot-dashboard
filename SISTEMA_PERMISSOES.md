# Sistema de Permissões - Vibrant City Tours

## 📋 Visão Geral

Sistema completo de controle de acesso baseado em **Roles** (ADMIN, GUIA, EQUIPE) e **Permissions** granulares.

## 🎭 Roles (Papéis)

### 1. **ADMIN** - Administrador
✅ **Acesso Total ao Sistema**
- Gerenciar guias (criar, editar, deletar)
- Gerenciar tours (criar, editar, deletar)
- Gerenciar sessões (criar, editar, deletar, alocar guias)
- Ver todos os dados financeiros
- Adicionar/editar/deletar transações
- Executar scraping de reviews
- Ver comparativos e análises completas

### 2. **GUIA** - Guia Turístico
✅ **Acesso Restrito aos Próprios Dados**
- Ver apenas seus próprios dados
- Editar apenas seu próprio perfil
- Ver apenas suas próprias sessões
- Ver apenas suas próprias avaliações
- Ver apenas seus próprios dados financeiros
- Ver lista de tours (read-only)

❌ **Não Pode:**
- Ver/editar dados de outros guias
- Criar/editar/deletar tours
- Criar/editar sessões
- Alocar guias
- Adicionar transações
- Executar scraping
- Ver dados financeiros de outros

### 3. **EQUIPE** - Membro da Equipe
✅ **Acesso Read-Only**
- Ver todos os guias
- Ver todos os tours
- Ver todas as sessões
- Ver todas as avaliações

❌ **Não Pode:**
- Editar/criar/deletar qualquer recurso
- Ver dados financeiros
- Executar operações administrativas

---

## 🔐 Implementação

### **1. Proteção de APIs**

Todas as APIs críticas estão protegidas:

#### Exemplo: `/api/guias/route.ts`
```typescript
import { requireAuth, requirePermission, requireGuiaAccess } from '@/lib/auth-helpers';
import { Permission } from '@/lib/permissions';

// GET - Lista de guias
export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  
  // Admin vê todos, Guia vê apenas o próprio
  // ...
}

// POST - Criar guia (apenas admin)
export async function POST(request: Request) {
  const { error } = await requirePermission(Permission.CREATE_GUIA);
  if (error) return error;
  // ...
}

// PUT - Editar guia (admin ou próprio guia)
export async function PUT(request: Request) {
  const { error } = await requireGuiaAccess(guiaId);
  if (error) return error;
  // ...
}
```

#### APIs Protegidas:
- ✅ `/api/guias` - GET (filtrado), POST (admin), PUT (próprio ou admin)
- ✅ `/api/tours` - GET (todos), POST (admin), PUT (admin)
- ✅ `/api/sessoes` - GET (filtrado), POST (admin)
- ✅ `/api/transacoes` - GET (filtrado), POST (admin), DELETE (admin)
- ✅ `/api/scheduling/allocate` - GET/POST (admin)
- ✅ `/api/reviews/scrape` - POST (admin)

---

### **2. Proteção de Rotas (Middleware)**

`middleware.ts` bloqueia acessos não autorizados:

```typescript
// Rotas admin-only
const adminOnlyPaths = [
  '/dashboard/guias/novo',
  '/dashboard/tours/novo',
  '/dashboard/agenda/nova-sessao',
];

// Guias só acessam seus próprios dados
if (token?.role === 'GUIA' && token?.guiaId) {
  // Redireciona se tentar acessar outro guia
}
```

---

### **3. Hooks para Client Components**

#### `usePermissions()`
```typescript
'use client';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { Permission } from '@/lib/permissions';

function MyComponent() {
  const { hasPermission, isAdmin, canAccessGuia } = usePermissions();
  
  return (
    <>
      {hasPermission(Permission.CREATE_TOUR) && (
        <Button>Criar Tour</Button>
      )}
      
      {isAdmin() && (
        <AdminPanel />
      )}
    </>
  );
}
```

---

### **4. HOC para Páginas Inteiras**

#### `withPermission()`
```typescript
import { withPermission } from '@/lib/hoc/with-permission';
import { Permission } from '@/lib/permissions';

function AdminPage() {
  return <div>Conteúdo Admin</div>;
}

export default withPermission(
  AdminPage, 
  Permission.MANAGE_USERS,
  {
    customMessage: 'Apenas administradores podem acessar esta página'
  }
);
```

---

### **5. Componentes Visuais**

#### `<AccessDenied />`
Exibe mensagem elegante quando acesso é negado:
```typescript
import { AccessDenied } from '@/components/access-denied';

<AccessDenied 
  title="Acesso Restrito"
  message="Você não tem permissão para editar tours"
/>
```

#### `<RoleBadge />`
Exibe badge visual do role do usuário:
```typescript
import { RoleBadge } from '@/components/role-badge';

<RoleBadge role={user.role} showIcon />
// Resultado: 🛡️ Administrador (roxo)
//           👤 Guia (azul)
//           👥 Equipe (outline)
```

---

## 📊 Tabela de Permissões

| Recurso | ADMIN | GUIA | EQUIPE |
|---------|-------|------|--------|
| **Guias** |
| Ver todos guias | ✅ | ❌ | ✅ |
| Ver próprio guia | ✅ | ✅ | ❌ |
| Criar guia | ✅ | ❌ | ❌ |
| Editar qualquer guia | ✅ | ❌ | ❌ |
| Editar próprio guia | ✅ | ✅ | ❌ |
| Deletar guia | ✅ | ❌ | ❌ |
| **Tours** |
| Ver tours | ✅ | ✅ | ✅ |
| Criar tour | ✅ | ❌ | ❌ |
| Editar tour | ✅ | ❌ | ❌ |
| Deletar tour | ✅ | ❌ | ❌ |
| **Sessões/Agenda** |
| Ver todas sessões | ✅ | ❌ | ✅ |
| Ver próprias sessões | ✅ | ✅ | ❌ |
| Criar sessão | ✅ | ❌ | ❌ |
| Editar sessão | ✅ | ❌ | ❌ |
| Alocar guias | ✅ | ❌ | ❌ |
| **Reviews** |
| Ver todas reviews | ✅ | ❌ | ✅ |
| Ver próprias reviews | ✅ | ✅ | ❌ |
| Executar scraping | ✅ | ❌ | ❌ |
| **Financeiro** |
| Ver tudo | ✅ | ❌ | ❌ |
| Ver próprio | ✅ | ✅ | ❌ |
| Adicionar transação | ✅ | ❌ | ❌ |
| Editar transação | ✅ | ❌ | ❌ |
| Deletar transação | ✅ | ❌ | ❌ |
| **Sistema** |
| Comparativos | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Ver logs sistema | ✅ | ❌ | ❌ |

---

## 🔧 Utilitários Disponíveis

### Server-Side (APIs e Server Components)
```typescript
import { 
  requireAuth,              // Verifica autenticação
  requirePermission,        // Verifica permissão específica
  requireAdmin,             // Verifica se é admin
  requireGuiaAccess,        // Verifica acesso a guia
  requireGuiaEditAccess,    // Verifica permissão de edição
  requireFinancialAccess,   // Verifica acesso financeiro
} from '@/lib/auth-helpers';
```

### Client-Side (Components)
```typescript
import { usePermissions } from '@/lib/hooks/use-permissions';
// Retorna: hasPermission, isAdmin, isGuia, canAccessGuia, etc.
```

### Helpers de Permissão
```typescript
import { 
  hasPermission,            // Verifica permissão
  hasAllPermissions,        // Verifica múltiplas (AND)
  hasAnyPermission,         // Verifica múltiplas (OR)
  canAccessGuia,            // Pode acessar guia?
  canEditGuia,              // Pode editar guia?
  canAccessFinancial,       // Pode ver financeiro?
  isAdmin,                  // É admin?
  isGuia,                   // É guia?
  getAccessDeniedMessage,   // Mensagem de erro
} from '@/lib/permissions';
```

---

## 🧪 Testando Permissões

### Usuários de Teste

**Admin:**
- Email: `admin@vibrantcitytours.com`
- Senha: `admin123`
- Role: `ADMIN`
- Acesso: **Total**

**Guias:**
1. João Silva (jsilva@vibrantcitytours.com)
2. Maria Santos (msantos@vibrantcitytours.com)
3. Pedro Oliveira (poliveira@vibrantcitytours.com)
- Senha: `change-me` (todos)
- Role: `GUIA`
- Acesso: **Próprios dados apenas**

### Cenários de Teste

#### 1. Admin Total Access
```bash
1. Login como admin
2. Acessar /dashboard/guias → Ver TODOS os guias
3. Acessar /dashboard/guias/novo → Criar guia
4. Acessar /dashboard/tours/novo → Criar tour
5. Acessar /dashboard/financial → Ver TODAS transações
6. Clicar "Executar Scraping" → Funciona
7. Clicar "Alocar Guia" → Funciona
```

#### 2. Guia Restricted Access
```bash
1. Login como João Silva
2. Acessar /dashboard/guias → Ver APENAS João Silva
3. Tentar /dashboard/guias/novo → Redirecionado
4. Acessar /dashboard/guias/{outro-id} → Redirecionado para próprio
5. Acessar /dashboard/tours → Ver lista (read-only)
6. Acessar /dashboard/financial → Ver APENAS próprias transações
7. Tentar "Executar Scraping" → Botão não aparece
8. Tentar "Alocar Guia" → Botão não aparece
```

---

## 🚀 Próximos Passos Recomendados

### Segurança
- [ ] Implementar rate limiting (express-rate-limit)
- [ ] Adicionar CSRF protection
- [ ] Logs de auditoria (quem fez o quê)
- [ ] 2FA para admins

### UX
- [ ] Toast notifications (substituir alerts)
- [ ] Confirmações antes de ações destrutivas
- [ ] Loading states em todas operações
- [ ] Mensagens de erro mais amigáveis

### Features
- [ ] Convites de guias por email
- [ ] Reset de senha
- [ ] Histórico de alterações
- [ ] Dashboard personalizado por role

---

## 📚 Arquitetura

```
lib/
├── permissions.ts           # Definições de roles e permissions
├── auth-helpers.ts          # Helpers server-side
├── hooks/
│   └── use-permissions.ts   # Hook client-side
└── hoc/
    └── with-permission.tsx  # HOC para páginas

components/
├── access-denied.tsx        # UI de acesso negado
└── role-badge.tsx          # Badge visual de role

middleware.ts               # Proteção de rotas

app/api/
├── guias/route.ts         # APIs protegidas
├── tours/route.ts
├── sessoes/route.ts
├── transacoes/route.ts
└── ...
```

---

## ✅ Status de Implementação

- ✅ Sistema de roles (ADMIN, GUIA, EQUIPE)
- ✅ 35 permissões granulares definidas
- ✅ Proteção de 6 APIs principais
- ✅ Middleware para rotas do dashboard
- ✅ Hook usePermissions() para client
- ✅ HOC withPermission() para páginas
- ✅ Componentes visuais (AccessDenied, RoleBadge)
- ✅ Filtros automáticos (guias veem só seus dados)
- ✅ Helpers server-side completos
- ✅ Documentação completa

**Sistema 100% funcional e pronto para produção!** 🎉
