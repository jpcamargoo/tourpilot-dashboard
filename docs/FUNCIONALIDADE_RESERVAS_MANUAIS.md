# 📝 Funcionalidade: Adicionar Reservas Manualmente

## 📋 Resumo

Implementada funcionalidade para adicionar reservas de clientes de forma manual através do dashboard. Agora é possível criar reservas diretamente na página de detalhes de cada sessão, sem depender de integrações externas ou importações ETL.

---

## ✨ Funcionalidades Implementadas

### 1. **API de Reservas** (`/api/reservas`)

#### POST `/api/reservas` - Criar nova reserva
- Validação completa de dados usando Zod
- Criação automática de visitante se não existir (busca por email)
- Verificação de capacidade disponível na sessão
- Log de auditoria automático
- Retorna reserva criada com todos os dados relacionados

**Payload de exemplo:**
```json
{
  "sessaoTourId": "clx...",
  "visitante": {
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "+351 912 345 678",
    "pais": "PT",
    "idioma": "pt",
    "cidade": "Lisboa"
  },
  "numPessoas": 2,
  "valorTotal": 45.00,
  "status": "CONFIRMADA",
  "observacoes": "Cliente VIP"
}
```

#### GET `/api/reservas` - Listar reservas (com filtros)
- Filtros: `sessaoTourId`, `status`, `visitanteId`
- Inclui dados de visitante, sessão, tour e guia
- Ordenado por data de reserva (mais recente primeiro)

---

### 2. **API de Reservas Individuais** (`/api/reservas/[id]`)

#### GET `/api/reservas/[id]` - Buscar detalhes de uma reserva
- Retorna todos os dados da reserva incluindo relacionamentos

#### PATCH `/api/reservas/[id]` - Atualizar reserva
- Permite atualizar: status, numPessoas, valorTotal, observações
- Verifica capacidade ao alterar número de pessoas
- Adiciona data de cancelamento automaticamente ao cancelar
- Log de auditoria

#### DELETE `/api/reservas/[id]` - Deletar reserva
- Remove reserva do sistema
- Log de auditoria com informações do visitante

---

### 3. **Componente de Formulário** (`AdicionarReservaDialog`)

**Localização:** `components/adicionar-reserva-dialog.tsx`

**Características:**
- Dialog modal responsivo com scroll
- Formulário dividido em duas seções:
  - **Dados do Visitante**: nome, email, telefone, país, idioma, cidade
  - **Dados da Reserva**: nº pessoas, valor, status, observações

**Validações:**
- Nome obrigatório
- Email com validação de formato
- Número de pessoas > 0
- Verifica vagas disponíveis antes de submeter
- Feedback visual com toast notifications (Sonner)

**Seleções Predefinidas:**
- 10 países mais comuns (BR, PT, US, ES, FR, UK, DE, IT, AR, MX)
- 6 idiomas principais (pt, en, es, fr, de, it)
- 3 status de reserva (CONFIRMADA, PENDENTE, COMPLETADA)

---

### 4. **Integração no Dashboard**

**Localização:** `app/dashboard/agenda/[id]/page.tsx`

**Alterações:**
- Botão "Adicionar Reserva" no cabeçalho da seção de reservas
- Passa informações de sessão para o componente:
  - ID da sessão
  - Capacidade máxima
  - Ocupação atual
- Atualização automática da lista após criar reserva (router.refresh)

---

## 🎯 Como Usar

### Passo a Passo:

1. **Acessar Agenda**
   - Menu lateral → **Agenda**

2. **Selecionar Sessão**
   - Clique em qualquer sessão para ver detalhes

3. **Adicionar Reserva**
   - Na seção "Reservas", clique em **"Adicionar Reserva"**
   - Preencha os dados do visitante (nome é obrigatório)
   - Preencha os dados da reserva (nº pessoas e valor)
   - Clique em **"Criar Reserva"**

4. **Confirmação**
   - Toast de sucesso aparece
   - Nova reserva exibida imediatamente na lista

---

## 🔒 Segurança e Validações

### Validações Backend:
✅ Autenticação obrigatória (NextAuth session)  
✅ Verificação de capacidade disponível  
✅ Validação de dados com Zod schema  
✅ Proteção contra overflow de capacidade  
✅ Log de auditoria completo  

### Validações Frontend:
✅ Nome obrigatório (min 2 caracteres)  
✅ Email com formato válido  
✅ Número de pessoas positivo  
✅ Valor não negativo  
✅ Verificação de vagas em tempo real  
✅ Feedback imediato ao usuário  

---

## 🗄️ Estrutura de Dados

### Schema Prisma (Reserva)
```prisma
model Reserva {
  id                String        @id @default(cuid())
  sessaoTourId      String
  visitanteId       String?
  status            String        @default("CONFIRMADA")
  numPessoas        Int           @default(1)
  valorTotal        Float
  origem            String?       // "manual" para reservas criadas manualmente
  refExterna        String?
  observacoes       String?
  dataReserva       DateTime      @default(now())
  dataCancelamento  DateTime?
  criadoEm          DateTime      @default(now())
  alteradoEm        DateTime      @updatedAt

  sessaoTour        SessaoTour    @relation(fields: [sessaoTourId], references: [id])
  visitante         Visitante?    @relation(fields: [visitanteId], references: [id])
}
```

### Origem
- Reservas manuais têm `origem = "manual"`
- Integrações: "getyourguide", "viator", "website", etc.

---

## 📊 Logs de Auditoria

Todas as operações de reserva são registradas:

| Ação | Evento | Detalhes Registrados |
|------|--------|---------------------|
| Criar | `CREATE_RESERVA` | visitante, sessão, nº pessoas, valor |
| Atualizar | `UPDATE_RESERVA` | campos alterados |
| Deletar | `CANCEL_RESERVA` | visitante, nº pessoas |

Visualização: **Dashboard** → **Logs de Auditoria**

---

## 🚀 Melhorias Futuras Sugeridas

1. **Edição Inline**: Editar reservas diretamente na tabela
2. **Importação em Lote**: Upload de CSV/Excel com múltiplas reservas
3. **Notificações**: Email/SMS automático ao criar reserva
4. **Check-in**: Sistema de check-in no dia do tour
5. **Histórico**: Ver histórico completo de alterações de uma reserva
6. **Pagamentos**: Integração com gateway de pagamento para free tours
7. **Confirmação Dupla**: Confirmar automaticamente reservas pendentes
8. **Cancelamento em Lote**: Cancelar múltiplas reservas de uma vez

---

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px-1919px)
- ✅ Tablet (768px-1365px)
- ✅ Mobile (320px-767px)

Modal com scroll automático para telas pequenas.

---

## 🧪 Testando

### Teste Manual:
```bash
# 1. Iniciar servidor de desenvolvimento
npm run dev

# 2. Acessar
http://localhost:3000/dashboard/agenda

# 3. Clicar em qualquer sessão

# 4. Clicar em "Adicionar Reserva"

# 5. Preencher formulário e submeter
```

### Casos de Teste:
- ✅ Criar reserva com visitante novo
- ✅ Criar reserva com visitante existente (mesmo email)
- ✅ Tentar exceder capacidade (deve falhar)
- ✅ Criar com campos opcionais vazios
- ✅ Validar email inválido
- ✅ Ver reserva aparecer na lista
- ✅ Log de auditoria criado

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- ✅ `app/api/reservas/route.ts` (POST, GET)
- ✅ `app/api/reservas/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `components/adicionar-reserva-dialog.tsx`

### Arquivos Modificados:
- ✅ `app/dashboard/agenda/[id]/page.tsx` (adicionado botão e import)

### Dependências:
- Nenhuma nova dependência necessária (usa libs existentes)

---

## 🎨 UI/UX

**Design System:** Shadcn UI  
**Notificações:** Sonner (toast)  
**Validação:** Zod + React Hook Form behavior  
**Loading States:** Spinner durante submit  
**Error Handling:** Toast com mensagens claras  

---

## ✅ Checklist de Implementação

- [x] API endpoint para criar reservas
- [x] API endpoint para listar reservas
- [x] API endpoint para atualizar reservas
- [x] API endpoint para deletar reservas
- [x] Componente de formulário modal
- [x] Integração no dashboard
- [x] Validações backend
- [x] Validações frontend
- [x] Log de auditoria
- [x] Verificação de capacidade
- [x] Busca/criação de visitante
- [x] Toast notifications
- [x] Responsividade
- [x] Tratamento de erros
- [x] Documentação

---

## 🎉 Conclusão

A funcionalidade de adicionar reservas manualmente está **100% implementada e pronta para uso**! 

Agora você pode gerenciar reservas diretamente pelo dashboard sem depender de integrações externas, ideal para:
- Walk-ins (clientes que chegam sem reserva)
- Reservas telefônicas
- Correções/ajustes manuais
- Grupos privados
- Situações especiais

**Data de Implementação:** 06/01/2026  
**Status:** ✅ Pronto para produção
