# 🛠️ Comandos Úteis - Performance e Testes

## 🚀 Comandos Essenciais

### Iniciar Servidor
```powershell
# Desenvolvimento
npm run dev

# Produção (build)
npm run build
npm start
```

### Testar Performance
```powershell
# Análise completa de performance
npx ts-node scripts/analisar-performance.ts

# Verificar conexão com banco
npx ts-node scripts/test-database.ts

# Análise detalhada de dados
npx ts-node scripts/analisar-dados.ts
```

---

## 📊 Monitoramento

### Prisma Studio (visualizar banco)
```powershell
npx prisma studio
# Abre em http://localhost:5555
```

### Logs de Query em Tempo Real
```powershell
# Modificar lib/prisma.ts temporariamente:
# log: ['query', 'info', 'warn', 'error']

# Depois rodar:
npm run dev

# Terminal mostrará todas as queries
```

### Verificar Uso de Memória
```powershell
# PowerShell - Monitorar processo Node
Get-Process node | Select-Object ProcessName, WorkingSet, CPU

# Atualizar a cada 2 segundos
while($true) { 
  Clear-Host
  Get-Process node | Select-Object ProcessName, @{n="Memory(MB)";e={$_.WorkingSet/1MB}}, CPU
  Start-Sleep -Seconds 2
}
```

---

## 🔍 Debug e Testes

### Testar Endpoint Específico
```powershell
# Dashboard
Invoke-WebRequest -Uri http://localhost:3000/dashboard -Method GET -TimeoutSec 10

# Financial
Invoke-WebRequest -Uri http://localhost:3000/dashboard/financial -Method GET -TimeoutSec 10

# Medir tempo de resposta
Measure-Command {
  Invoke-WebRequest -Uri http://localhost:3000/dashboard
}
```

### Simular Múltiplos Usuários
```powershell
# 5 usuários simultâneos
1..5 | ForEach-Object -Parallel {
  Invoke-WebRequest -Uri http://localhost:3000/dashboard
} -ThrottleLimit 5

# Com medição de tempo
$jobs = 1..10 | ForEach-Object {
  Start-Job -ScriptBlock {
    Measure-Command {
      Invoke-WebRequest -Uri http://localhost:3000/dashboard
    }
  }
}

$jobs | Wait-Job | Receive-Job
```

### Verificar Cache Funcionando
```powershell
# Primeira requisição (sem cache)
Measure-Command {
  Invoke-WebRequest -Uri http://localhost:3000/dashboard
}

# Aguardar 2 segundos
Start-Sleep -Seconds 2

# Segunda requisição (com cache)
Measure-Command {
  Invoke-WebRequest -Uri http://localhost:3000/dashboard
}

# Segunda deve ser MUITO mais rápida
```

---

## 🗃️ Banco de Dados

### Reset e Seed
```powershell
# Reset completo
npx prisma migrate reset

# Apenas seed
npx prisma db seed

# Seed de teste
npx ts-node prisma/seed-test.ts
```

### Backup
```powershell
# Backup automático
npx ts-node scripts/backup/backup-database.ts

# Backup manual (se tiver pg_dump)
pg_dump $env:DATABASE_URL > backup.sql
```

### Verificar Tamanho do Banco
```powershell
# Via script
npx ts-node -e "
import { prisma } from './lib/prisma';

async function checkSize() {
  const tables = ['Usuario', 'Guia', 'Tour', 'SessaoTour', 'Reserva', 'Review', 'Transacao'];
  
  for (const table of tables) {
    const count = await prisma[table.toLowerCase()].count();
    console.log(`${table}: ${count} registros`);
  }
  
  await prisma.$disconnect();
}

checkSize();
"
```

---

## ⚡ Limpeza e Otimização

### Limpar Cache Next.js
```powershell
# Remover .next
Remove-Item -Recurse -Force .next

# Rebuild
npm run build
```

### Limpar node_modules
```powershell
# Remover e reinstalar
Remove-Item -Recurse -Force node_modules
npm install
```

### Verificar Pacotes Desatualizados
```powershell
# Listar outdated
npm outdated

# Atualizar (cuidado em produção!)
npm update
```

---

## 📈 Análise de Performance

### Lighthouse via CLI
```powershell
# Instalar lighthouse
npm install -g lighthouse

# Rodar análise
lighthouse http://localhost:3000/dashboard --view

# Apenas performance
lighthouse http://localhost:3000/dashboard --only-categories=performance --view
```

### Bundle Analyzer
```powershell
# Instalar
npm install @next/bundle-analyzer --save-dev

# Adicionar em next.config.mjs:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({
#   enabled: process.env.ANALYZE === 'true',
# })

# Analisar
$env:ANALYZE="true"; npm run build
```

---

## 🐛 Troubleshooting

### Servidor não inicia
```powershell
# Verificar porta em uso
netstat -ano | findstr :3000

# Matar processo
Stop-Process -Id <PID> -Force

# Ou usar killport
npx kill-port 3000
```

### Prisma Client desatualizado
```powershell
# Regenerar client
npx prisma generate

# Se ainda não funcionar
Remove-Item -Recurse -Force node_modules/.prisma
npx prisma generate
```

### Erros de tipo TypeScript
```powershell
# Verificar erros
npx tsc --noEmit

# Limpar cache
Remove-Item -Recurse -Force .next
npm run dev
```

### Conexão com banco falha
```powershell
# Verificar variável de ambiente
echo $env:DATABASE_URL

# Testar conexão
npx prisma db pull

# Se usar Supabase, verificar pgBouncer
# DATABASE_URL deve ter: ?pgbouncer=true&connection_limit=1
```

---

## 📦 Deploy

### Build para Produção
```powershell
# Verificar se compila
npm run build

# Testar produção localmente
npm start

# Build time esperado: 30-60s
```

### Verificar Variáveis de Ambiente
```powershell
# Listar variáveis necessárias
Get-Content .env

# Variáveis obrigatórias:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

### Preview antes de Deploy
```powershell
# Build
npm run build

# Start em modo produção
npm start

# Testar como usuário
Invoke-WebRequest -Uri http://localhost:3000
```

---

## 🔒 Segurança

### Verificar Dependências Vulneráveis
```powershell
# Audit
npm audit

# Fix automático (safe)
npm audit fix

# Fix forçado (cuidado!)
npm audit fix --force
```

### Verificar Secrets Expostos
```powershell
# Procurar por secrets no código
Select-String -Path "*.ts","*.tsx" -Pattern "password|secret|key" -Exclude "node_modules/*"

# Verificar .env não está no git
git ls-files | Select-String ".env"
# Não deve retornar nada!
```

---

## 📊 Métricas Rápidas

### One-liner para métricas básicas
```powershell
# Performance score rápido
function Get-PerformanceScore {
  $time = Measure-Command { Invoke-WebRequest -Uri http://localhost:3000/dashboard }
  $score = [math]::Max(0, 100 - ($time.TotalSeconds * 50))
  Write-Host "Time: $($time.TotalSeconds)s - Score: $score/100"
}

Get-PerformanceScore
```

### Monitorar em tempo real
```powershell
# Loop de monitoramento
while($true) {
  $time = Measure-Command { 
    Invoke-WebRequest -Uri http://localhost:3000/dashboard -ErrorAction SilentlyContinue 
  }
  
  $color = if($time.TotalSeconds -lt 1) { "Green" } 
           elseif($time.TotalSeconds -lt 2) { "Yellow" } 
           else { "Red" }
  
  Write-Host "$(Get-Date -Format 'HH:mm:ss') - Response: $($time.TotalSeconds)s" -ForegroundColor $color
  Start-Sleep -Seconds 5
}
```

---

## 🎯 Checklist Diário

Execute antes de entregar:

```powershell
# 1. Verificar erros TypeScript
npx tsc --noEmit

# 2. Testar build
npm run build

# 3. Verificar performance
npx ts-node scripts/analisar-performance.ts

# 4. Testar export
# Abrir browser e clicar em "Exportar"

# 5. Verificar banco
npx ts-node scripts/test-database.ts

# Se todos passarem: ✅ Pronto para entregar!
```

---

## 💾 Backup Rápido

```powershell
# Backup completo antes de mudanças
$date = Get-Date -Format "yyyy-MM-dd_HHmm"
npx ts-node scripts/backup/backup-database.ts

# Commit git
git add .
git commit -m "Backup antes de otimizações - $date"
git push
```

---

## 📚 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| **Dev** | `npm run dev` | Servidor desenvolvimento |
| **Build** | `npm run build` | Build produção |
| **Start** | `npm start` | Iniciar produção |
| **Test DB** | `npx ts-node scripts/test-database.ts` | Testar conexão |
| **Analyze** | `npx ts-node scripts/analisar-dados.ts` | Análise de dados |
| **Performance** | `npx ts-node scripts/analisar-performance.ts` | Análise performance |
| **Studio** | `npx prisma studio` | Interface visual banco |
| **Generate** | `npx prisma generate` | Regenerar Prisma client |
| **Migrate** | `npx prisma migrate dev` | Rodar migrations |

---

**Última atualização:** 29/12/2025  
**Mantido por:** GitHub Copilot  

💡 **Dica:** Adicione este arquivo aos favoritos para referência rápida!
