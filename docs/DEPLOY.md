# 🚀 Guia de Deploy - Vibrant City Tours

## ✅ STATUS ATUAL DO PROJETO

**Sistema:** Production-ready  
**Documentação:** Completa  
**Dados Demo:** Populados  
**Testes:** Funcionando localmente  

---

## 🌐 DEPLOY STAGING (Vercel)

### Pré-requisitos
- [ ] Conta no Vercel (gratuita): https://vercel.com
- [ ] Conta no Supabase (gratuita): https://supabase.com
- [ ] Repositório GitHub (privado recomendado)

### Passo 1: Configurar Banco de Dados (Supabase)

1. **Criar Projeto no Supabase**
   - Acesse https://supabase.com
   - Clique em "New Project"
   - Nome: `vibrant-tours-staging`
   - Região: `Lisboa` ou mais próxima
   - Senha do banco: Gere uma senha forte
   - Clique em "Create Project"

2. **Obter Connection String**
   - Settings → Database
   - Copie "Connection String" (URI)
   - Formato: `postgresql://postgres:[SUA-SENHA]@[HOST]:5432/postgres`

3. **Executar Migrations**
   ```bash
   # Configurar variável de ambiente temporariamente
   $env:DATABASE_URL="postgresql://postgres:[SENHA]@[HOST]:5432/postgres"
   
   # Executar migrations
   npx prisma migrate deploy
   
   # Popular banco com dados demo
   npm run db:seed
   ```

### Passo 2: Push para GitHub

```bash
# Criar repositório no GitHub (https://github.com/new)
# Nome sugerido: vibrant-city-tours

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/vibrant-city-tours.git

# Push inicial
git branch -M main
git push -u origin main
```

### Passo 3: Deploy na Vercel

1. **Conectar Vercel ao GitHub**
   - Acesse https://vercel.com
   - Clique em "Add New..." → "Project"
   - Import repositório `vibrant-city-tours`

2. **Configurar Variáveis de Ambiente**
   
   Na tela de configuração, adicione:
   
   ```env
   # Banco de Dados
   DATABASE_URL=postgresql://postgres:[SENHA]@[HOST]:5432/postgres
   
   # NextAuth (gere em: https://generate-secret.vercel.app/32)
   NEXTAUTH_SECRET=cole_secret_gerado_aqui
   NEXTAUTH_URL=https://vibrant-tours-staging.vercel.app
   
   # APIs Externas (opcional por enquanto)
   GETYOURGUIDE_API_KEY=aguardando_cliente
   TELEGRAM_BOT_TOKEN=aguardando_cliente
   TELEGRAM_CHAT_ID=aguardando_cliente
   ```

3. **Deploy**
   - Clique em "Deploy"
   - Aguarde build (~3-5 minutos)
   - URL gerada: `https://vibrant-tours-staging.vercel.app`

4. **Verificar Deploy**
   - Acesse a URL
   - Login: `admin@vibrantcitytours.com` / `admin123`
   - Teste funcionalidades principais

---

## 🔒 SEGURANÇA

### Variáveis Sensíveis
✅ `.env` está no `.gitignore`  
✅ Nunca commitar senhas ou tokens  
✅ Usar Vercel Environment Variables  

### Banco de Dados
✅ Connection pooling habilitado  
✅ SSL forçado no Supabase  
✅ Backups automáticos diários  

---

## 📋 CHECKLIST PRÉ-PRODUÇÃO

Antes do go-live real:

### Banco de Dados
- [ ] Migrar para PostgreSQL (se ainda não fez)
- [ ] Configurar backups automáticos
- [ ] Testar restore de backup
- [ ] Configurar alertas de espaço

### Aplicação
- [ ] Trocar senhas padrão
- [ ] Remover dados de demonstração
- [ ] Configurar domínio personalizado
- [ ] Habilitar HTTPS (automático na Vercel)
- [ ] Configurar rate limiting em produção

### Integrações
- [ ] Obter credenciais GetYourGuide
- [ ] Configurar bot Telegram
- [ ] Testar scraping de reviews
- [ ] Configurar email SMTP

### Monitoramento
- [ ] Configurar Sentry (erros)
- [ ] Habilitar logs da Vercel
- [ ] Configurar alertas críticos
- [ ] Dashboard de uptime

### Documentação
- [ ] Enviar manuais ao cliente
- [ ] Agendar treinamento da equipe
- [ ] Preparar FAQ
- [ ] Criar vídeos tutoriais

---

## 🎯 AMBIENTES RECOMENDADOS

### Desenvolvimento (Local)
- URL: `http://localhost:3000`
- Banco: SQLite (`prisma/dev.db`)
- Uso: Desenvolvimento e testes

### Staging (Vercel)
- URL: `https://vibrant-tours-staging.vercel.app`
- Banco: Supabase (PostgreSQL)
- Uso: Testes do cliente, UAT, demos

### Produção (Vercel)
- URL: `https://dashboard.vibrantcitytours.com`
- Banco: Supabase (PostgreSQL)
- Uso: Operação real, dados reais

---

## 🔄 FLUXO DE DEPLOY

```
┌─────────────┐
│  Desenvolve │
│    Local    │
└──────┬──────┘
       │ git push
       ▼
┌─────────────┐
│   GitHub    │
│  (Código)   │
└──────┬──────┘
       │ Auto-deploy
       ▼
┌─────────────┐
│   Vercel    │
│  (Staging)  │
└──────┬──────┘
       │ Testes OK?
       ▼
┌─────────────┐
│   Vercel    │
│ (Produção)  │
└─────────────┘
```

---

## 💡 DICAS

### Deploy Rápido
- Vercel faz deploy automático a cada push
- Branch `main` → Produção
- Outras branches → Preview deploys

### Rollback
Se algo der errado:
1. Vercel → Deployments
2. Encontre versão anterior funcionando
3. Clique nos 3 pontos → "Promote to Production"

### Logs
Para debugar erros em produção:
- Vercel → Seu projeto → Logs
- Filtre por erro/warning
- Últimas 24h disponíveis (grátis)

### Performance
- Next.js faz cache automático
- Vercel CDN global
- Edge functions para APIs

---

## 🆘 PROBLEMAS COMUNS

### Build Falhou
**Erro:** `Module not found`  
**Solução:** Verifique `package.json`, rode `npm install`

**Erro:** `Prisma schema not found`  
**Solução:** Adicione `postinstall: "prisma generate"` nos scripts

### Banco não Conecta
**Erro:** `Connection timeout`  
**Solução:** 
- Verifique `DATABASE_URL` nas env vars
- Confirme que IP da Vercel está permitido no Supabase
- Supabase → Settings → Database → Connection Pooling → Habilite

### Página 500
**Erro:** Erro interno do servidor  
**Solução:**
- Veja logs no Vercel
- Verifique variáveis de ambiente
- Teste localmente com mesmas env vars

---

## 📞 SUPORTE TÉCNICO

### Vercel
- Docs: https://vercel.com/docs
- Status: https://vercel-status.com
- Discord: Comunidade Vercel

### Supabase
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com
- Discord: Comunidade Supabase

### Next.js
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

---

## ✨ PRÓXIMOS PASSOS

Após deploy staging bem-sucedido:

1. **Compartilhar com Cliente**
   - Envie URL de staging
   - Credenciais de teste
   - Manuais em PDF

2. **Coletar Feedback**
   - Agende demo ao vivo
   - Liste sugestões
   - Priorize ajustes

3. **Aguardar Dados**
   - Credenciais de APIs
   - Dados históricos
   - Configurações específicas

4. **Go-Live Produção**
   - Configurar domínio personalizado
   - Popular banco com dados reais
   - Treinar equipe
   - Monitorar primeiros dias

---

**Data de Criação:** Dezembro 2025  
**Última Atualização:** Dezembro 2025  
**Versão:** 1.0
