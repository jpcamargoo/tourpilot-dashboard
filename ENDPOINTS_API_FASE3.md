# 📡 Endpoints de API - Fase 3

## 📋 Documentação Completa dos Endpoints

### 🔍 Audit Logs API

#### 1. **GET** `/api/audit-logs`
Buscar logs de auditoria com filtros

**Autenticação:** Requerida (ADMIN)

**Query Parameters:**
- `userId` (opcional) - Filtrar por ID do usuário
- `action` (opcional) - Filtrar por ação (LOGIN, CREATE_TOUR, etc.)
- `resource` (opcional) - Filtrar por recurso (tour, guia, etc.)
- `startDate` (opcional) - Data inicial (ISO 8601)
- `endDate` (opcional) - Data final (ISO 8601)
- `limit` (opcional) - Limite de resultados (padrão: 50)
- `offset` (opcional) - Offset para paginação (padrão: 0)

**Exemplo de Request:**
```bash
GET /api/audit-logs?userId=user123&action=CREATE_TOUR&startDate=2024-01-01&limit=20
```

**Exemplo de Response:**
```json
{
  "logs": [
    {
      "id": "log123",
      "userId": "user123",
      "action": "CREATE_TOUR",
      "resource": "tour",
      "resourceId": "tour456",
      "details": {
        "name": "City Walking Tour"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-12-15T10:30:00Z",
      "usuario": {
        "nome": "João Silva",
        "email": "joao@email.com"
      }
    }
  ],
  "total": 150
}
```

---

#### 2. **GET** `/api/audit-logs/stats`
Estatísticas de audit logs

**Autenticação:** Requerida (ADMIN)

**Query Parameters:**
- `userId` (opcional) - Estatísticas de um usuário específico

**Exemplo de Request:**
```bash
GET /api/audit-logs/stats?userId=user123
```

**Exemplo de Response:**
```json
{
  "stats": [
    {
      "action": "LOGIN",
      "count": 45
    },
    {
      "action": "CREATE_TOUR",
      "count": 12
    },
    {
      "action": "DELETE_TOUR",
      "count": 3
    }
  ]
}
```

---

### 💳 Payments API (Stripe)

#### 3. **POST** `/api/payments/intent`
Criar intenção de pagamento

**Autenticação:** Requerida

**Request Body:**
```json
{
  "amount": 150.00,
  "currency": "brl",
  "metadata": {
    "tourId": "tour123",
    "sessaoId": "sessao456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_123456",
    "amount": 150.00,
    "currency": "brl",
    "status": "requires_payment_method",
    "clientSecret": "pi_123456_secret_abc"
  }
}
```

---

#### 4. **POST** `/api/payments/refund`
Criar reembolso

**Autenticação:** Requerida (ADMIN)

**Request Body:**
```json
{
  "paymentIntentId": "pi_123456",
  "amount": 75.00,
  "reason": "requested_by_customer"
}
```

**Response:**
```json
{
  "success": true,
  "refund": {
    "id": "re_123456",
    "amount": 75.00,
    "status": "succeeded",
    "reason": "requested_by_customer"
  }
}
```

---

#### 5. **POST** `/api/payments/webhook`
Processar eventos do Stripe

**Autenticação:** Stripe Signature

**Headers:**
- `stripe-signature` - Assinatura do webhook

**Request Body:** Raw body do Stripe

**Response:**
```json
{
  "received": true
}
```

**Eventos Suportados:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `refund.created`

---

#### 6. **GET** `/api/payments/status/[paymentIntentId]`
Verificar status de um pagamento

**Autenticação:** Requerida

**Exemplo de Request:**
```bash
GET /api/payments/status/pi_123456
```

**Response:**
```json
{
  "status": {
    "id": "pi_123456",
    "status": "succeeded",
    "amount": 150.00,
    "currency": "brl",
    "created": "2024-12-15T10:30:00Z"
  }
}
```

---

### 📄 Reports API (PDF)

#### 7. **POST** `/api/reports/tours`
Gerar relatório de tours em PDF

**Autenticação:** Requerida (ADMIN/EQUIPE)

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** 
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="relatorio-tours-2024-12-15.pdf"`

**Dados incluídos:**
- Lista de tours
- Total de sessões por tour
- Total de reservas
- Receita por tour
- Resumo geral

---

#### 8. **POST** `/api/reports/financial`
Gerar relatório financeiro em PDF

**Autenticação:** Requerida (ADMIN)

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** 
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="relatorio-financeiro-2024-12-15.pdf"`

**Dados incluídos:**
- Resumo financeiro (receita, despesas, lucro)
- Lista de transações
- Breakdown por tipo de transação
- Totais e médias

---

#### 9. **POST** `/api/reports/guides`
Gerar relatório de guias em PDF

**Autenticação:** Requerida (ADMIN)

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** 
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="relatorio-guias-2024-12-15.pdf"`

**Dados incluídos:**
- Performance de cada guia
- Sessões realizadas
- Reservas atendidas
- Receita gerada
- Média de avaliações

---

#### 10. **POST** `/api/reports/reviews`
Gerar relatório de avaliações em PDF

**Autenticação:** Requerida (ADMIN/EQUIPE)

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** 
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="relatorio-reviews-2024-12-15.pdf"`

**Dados incluídos:**
- Estatísticas de reviews
- Distribuição de sentimentos
- Média de notas
- Lista de reviews
- Análise por fonte

---

## 🔐 Autenticação e Permissões

### Níveis de Acesso:

**ADMIN:**
- ✅ Todos os endpoints

**EQUIPE:**
- ✅ Audit logs (leitura)
- ✅ Payments (leitura)
- ✅ Reports (tours, reviews)

**GUIA:**
- ✅ Reports próprios
- ❌ Audit logs
- ❌ Payments admin

### Headers Requeridos:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 📊 Exemplos de Uso

### Exemplo 1: Buscar logs de login de um usuário

```typescript
const response = await fetch('/api/audit-logs?userId=user123&action=LOGIN&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(`Total de logins: ${data.total}`);
```

### Exemplo 2: Criar pagamento

```typescript
const response = await fetch('/api/payments/intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 150.00,
    currency: 'brl',
    metadata: {
      tourId: 'tour123'
    }
  })
});

const { paymentIntent } = await response.json();
// Usar clientSecret no frontend para completar pagamento
```

### Exemplo 3: Gerar relatório PDF

```typescript
const response = await fetch('/api/reports/tours', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  })
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'relatorio-tours.pdf';
a.click();
```

---

## 🚨 Códigos de Erro

| Código | Mensagem | Descrição |
|--------|----------|-----------|
| 401 | Não autorizado | Token ausente ou inválido |
| 403 | Acesso negado | Permissões insuficientes |
| 400 | Bad Request | Parâmetros inválidos |
| 404 | Not Found | Recurso não encontrado |
| 500 | Server Error | Erro interno do servidor |

---

## 📈 Rate Limiting

Todos os endpoints têm rate limiting aplicado:

- **Audit Logs:** 100 req/min
- **Payments:** 50 req/min
- **Reports:** 10 req/min (geração de PDF é intensiva)

---

**Documentação criada em:** Janeiro 2026  
**Versão:** 1.0
