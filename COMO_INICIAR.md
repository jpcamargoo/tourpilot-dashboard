# 🚀 COMO INICIAR O SERVIDOR - Vibrant City Tours

## ⚠️ PROBLEMA IDENTIFICADO

O terminal integrado do VS Code estava interrompendo o processo do servidor Next.js automaticamente.

## ✅ SOLUÇÃO - USAR NOVA JANELA DO POWERSHELL

### Método 1: Abrir Nova Janela (RECOMENDADO)

1. Abra o PowerShell como Administrador (botão direito → Executar como Administrador)

2. Execute:
```powershell
cd C:\Sites\vibrant
npm run dev
```

3. **MANTENHA ESSA JANELA ABERTA** enquanto estiver usando o sistema

4. Acesse no navegador: http://localhost:3000

### Método 2: Usar VS Code com Terminal Externo

1. No VS Code, pressione `Ctrl + Shift + P`

2. Digite: `Terminal: Create New Integrated Terminal`

3. No terminal, execute:
```powershell
npm run dev
```

4. **NÃO FECHE O TERMINAL** enquanto estiver usando

## 🔍 COMO SABER SE ESTÁ RODANDO

Você deve ver esta mensagem:
```
   ▲ Next.js 15.0.3
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Ready in XXXX ms
```

## 🌐 ACESSANDO O SISTEMA

1. **Dashboard/Login:** http://localhost:3000/login
2. **Página Inicial:** http://localhost:3000
3. **Prisma Studio:** http://localhost:5555 (se estiver rodando)

## 👤 CREDENCIAIS DE ACESSO

**Administrador:**
- Email: `admin@vibrantcitytours.com`
- Senha: `admin123`

**Guias (para testes):**
- João: `joao@vibrantcitytours.com` / `guia123`
- Maria: `maria@vibrantcitytours.com` / `guia123`
- Pedro: `pedro@vibrantcitytours.com` / `guia123`

## 🛑 COMO PARAR O SERVIDOR

No terminal onde o servidor está rodando:
- Pressione `Ctrl + C`
- Confirme com `S` se perguntado

## 🔧 OUTROS COMANDOS ÚTEIS

### Ver dados do banco (Prisma Studio)
```powershell
npm run db:studio
```
Acesse: http://localhost:5555

### Testar conexão com banco
```powershell
npx tsx scripts/test-database.ts
```

### Rodar testes de API
```powershell
npx tsx scripts/test-api.ts
```

## ❌ PROBLEMAS COMUNS

### 1. Porta 3000 já está em uso
**Erro:** `EADDRINUSE: address already in use`

**Solução:**
```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :3000

# Matar o processo (substitua XXXX pelo PID)
taskkill /PID XXXX /F

# Ou use outra porta
$env:PORT=3001; npm run dev
```

### 2. Erro de autenticação no banco
**Erro:** `Authentication failed`

**Solução:** Verifique se o `.env` tem a configuração correta:
```env
DATABASE_URL="postgresql://postgres.bgzyrxwiholhushavhnj:Vibrant.tours2025@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### 3. Módulos não encontrados
**Erro:** `Cannot find module`

**Solução:**
```powershell
npm install
```

### 4. Erro no Prisma Client
**Erro:** `Prisma Client not generated`

**Solução:**
```powershell
npx prisma generate
```

## 📞 STATUS ATUAL

✅ **Banco de Dados:** Conectado (Supabase PostgreSQL)  
✅ **Servidor:** Rodando em http://localhost:3000  
✅ **Dados:** 35 registros carregados  
✅ **Autenticação:** Funcionando  
✅ **APIs:** Protegidas e operacionais  

## 🎯 PRÓXIMOS PASSOS

1. ✅ Acesse http://localhost:3000/login
2. ✅ Faça login como admin
3. ✅ Explore o dashboard
4. ✅ Teste as funcionalidades:
   - Gestão de Guias
   - Gestão de Tours
   - Agenda/Sessões
   - Reviews
   - Financeiro
   - Comparativos

---

**💡 DICA:** Sempre mantenha o terminal com o servidor aberto e visível para ver logs e possíveis erros em tempo real!
