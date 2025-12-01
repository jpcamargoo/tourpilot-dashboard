# 🚀 DEPLOY STAGING - PASSO A PASSO PRÁTICO

## ✅ PRÉ-REQUISITOS VERIFICADOS
- [x] Sistema production-ready
- [x] Documentação completa
- [x] Git configurado e commitado
- [x] .env.example atualizado
- [x] postinstall script no package.json

---

## 🎯 AÇÕES NECESSÁRIAS (Por Você)

### PASSO 1: Criar Conta Supabase (5 minutos)

1. Acesse: **https://supabase.com/dashboard**
2. Clique em **"Start your project"** ou **"Sign in with GitHub"**
3. Após login, clique em **"New Project"**

**Configurações do Projeto:**
```
Organization: Sua organização (ou crie nova)
Name: vibrant-tours-staging
Database Password: [GERE UMA SENHA FORTE]
Region: West EU (Ireland) - Mais próximo de Lisboa
Pricing Plan: Free (suficiente para staging)
```

4. Clique em **"Create new project"** (leva ~2 minutos)

5. **COPIE A CONNECTION STRING:**
   - Vá em: **Settings** → **Database** → **Connection String**
   - Aba: **URI**
   - Copie a string completa (ex: `postgresql://postgres.[projeto]:[senha]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`)

⚠️ **GUARDE ESSA STRING EM LOCAL SEGURO** - Você vai precisar dela!

---

### PASSO 2: Rodar Migrations no Supabase (3 minutos)

**No seu terminal PowerShell (aqui mesmo no VS Code):**

```powershell
# 1. Configurar variável temporária com sua connection string do Supabase
$env:DATABASE_URL = "postgresql://postgres.[projeto]:[senha]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"

# 2. Executar migrations (criar tabelas)
npx prisma migrate deploy

# 3. Popular banco com dados demo
npm run db:seed

# 4. Verificar (opcional)
npx prisma studio
```

✅ **Resultado esperado:** Tabelas criadas e dados demo inseridos no Supabase

---

### PASSO 3: Criar Repositório GitHub (5 minutos)

1. Acesse: **https://github.com/new**

**Configurações do Repositório:**
```
Repository name: vibrant-city-tours
Description: Dashboard de gestão para Vibrant City Tours
Visibility: ✅ Private (RECOMENDADO)
Initialize: ❌ NÃO adicione README, .gitignore ou license
```

2. Clique em **"Create repository"**

3. **COPIE A URL DO REPOSITÓRIO** (ex: `https://github.com/SEU_USUARIO/vibrant-city-tours.git`)

**No seu terminal PowerShell:**

```powershell
# 1. Adicionar remote (substitua SEU_USUARIO pelo seu username GitHub)
git remote add origin https://github.com/SEU_USUARIO/vibrant-city-tours.git

# 2. Renomear branch para main (se estiver em master)
git branch -M main

# 3. Push inicial
git push -u origin main
```

✅ **Resultado esperado:** Código no GitHub

---

### PASSO 4: Deploy na Vercel (7 minutos)

1. Acesse: **https://vercel.com/new**
2. Clique em **"Continue with GitHub"** (autorize se necessário)
3. Em **"Import Git Repository"**, procure por **vibrant-city-tours**
4. Clique em **"Import"**

**Configuração do Projeto:**

```
Framework Preset: Next.js (detectado automaticamente)
Root Directory: ./
Build Command: next build (padrão)
Output Directory: .next (padrão)
Install Command: npm install (padrão)
```

5. **ADICIONAR ENVIRONMENT VARIABLES** (clique em "Add" para cada uma):

```env
# 1. BANCO DE DADOS (OBRIGATÓRIO)
DATABASE_URL
[Cole aqui sua connection string do Supabase do Passo 1]

# 2. NEXTAUTH SECRET (OBRIGATÓRIO)
NEXTAUTH_SECRET
[Gere em: https://generate-secret.vercel.app/32 e cole aqui]

# 3. NEXTAUTH URL (OBRIGATÓRIO)
NEXTAUTH_URL
https://vibrant-tours-staging.vercel.app
(Vercel vai sugerir a URL automaticamente - copie e cole)
```

⚠️ **IMPORTANTE:** Se a URL sugerida for diferente (ex: `vibrant-city-tours-xyz.vercel.app`), use essa!

6. Clique em **"Deploy"**

⏳ **Aguarde o build** (~3-5 minutos):
- Instalando dependências...
- Gerando Prisma Client...
- Building Next.js...
- ✅ Deployment ready!

---

### PASSO 5: Testar Deploy (2 minutos)

1. Quando o deploy terminar, clique em **"Visit"** ou copie a URL

2. **Teste de Login:**
   ```
   URL: https://vibrant-tours-staging.vercel.app/login
   Email: admin@vibrantcitytours.com
   Senha: admin123
   ```

3. **Checklist de Teste:**
   - [ ] Página de login carrega
   - [ ] Login funciona
   - [ ] Dashboard mostra dados
   - [ ] Navegação entre páginas funciona
   - [ ] Tours, Guias e Agenda carregam
   - [ ] Gráficos aparecem

✅ **Se tudo funcionar: PARABÉNS! Deploy concluído!**

---

## 📋 CHECKLIST COMPLETO

```
SUPABASE:
✅ Conta criada
✅ Projeto "vibrant-tours-staging" criado
✅ Connection string copiada
✅ Migrations executadas
✅ Dados demo inseridos

GITHUB:
✅ Repositório criado (private)
✅ Código enviado via git push
✅ Branch main configurada

VERCEL:
✅ Projeto importado do GitHub
✅ Variáveis de ambiente configuradas (3)
✅ Deploy concluído com sucesso
✅ Site acessível e funcionando

TESTE:
✅ Login funcionando
✅ Dashboard carregando
✅ Dados demo visíveis
✅ Navegação operacional
```

---

## 🎉 URL DO SEU SISTEMA

**Staging (Demo):**
```
🌐 https://vibrant-tours-staging.vercel.app
👤 admin@vibrantcitytours.com / admin123
```

**Compartilhe com o cliente:**
✅ URL acima  
✅ Credenciais de teste  
✅ Manuais em `/docs/`  
✅ Documento `ENTREGA.md`  

---

## 🔄 PRÓXIMAS AÇÕES

### Imediato
1. ✅ Testar todas as funcionalidades
2. ✅ Enviar URL ao cliente
3. ✅ Agendar demo ao vivo

### Curto Prazo (1-2 semanas)
4. ⏳ Coletar feedback do cliente
5. ⏳ Implementar ajustes solicitados
6. ⏳ Obter credenciais de APIs (GetYourGuide, Telegram)

### Médio Prazo (3-4 semanas)
7. ⏳ Configurar domínio personalizado
8. ⏳ Deploy produção
9. ⏳ Migrar dados reais
10. ⏳ Treinamento da equipe

---

## 🆘 PROBLEMAS COMUNS

### Build falhou na Vercel
**Sintoma:** Erro durante "Building..."  
**Solução:**
1. Veja logs completos no Vercel
2. Verifique se todas as 3 env vars estão configuradas
3. Certifique-se que DATABASE_URL tem `?pgbouncer=true`

### Erro 500 ao acessar site
**Sintoma:** Página branca ou erro interno  
**Solução:**
1. Vercel → Seu projeto → **Logs**
2. Procure por erros em vermelho
3. Comum: DATABASE_URL incorreta ou NEXTAUTH_SECRET faltando

### Login não funciona
**Sintoma:** Erro ao tentar fazer login  
**Solução:**
1. Verifique NEXTAUTH_URL está correto (deve ser a URL do Vercel)
2. Verifique NEXTAUTH_SECRET está preenchido
3. Tente fazer logout e login novamente

### Banco vazio (sem dados)
**Sintoma:** Dashboard mostra zero tours/guias  
**Solução:**
```powershell
# Rodar seed novamente
$env:DATABASE_URL = "sua_connection_string_do_supabase"
npm run db:seed
```

---

## 📞 SUPORTE

**Documentação:**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

**Status das Plataformas:**
- Vercel: https://www.vercel-status.com
- Supabase: https://status.supabase.com

---

**Criado em:** 1 de Dezembro de 2025  
**Última atualização:** 1 de Dezembro de 2025  
**Versão:** 1.0
