# Script de Deploy para Vibrant Tours Production
# Uso: .\deploy.ps1

Write-Host "🚀 Iniciando deploy para vibrant-tours-prod..." -ForegroundColor Cyan

$hookUrl = "https://api.vercel.com/v1/integrations/deploy/prj_xgYtubj3hmI7vKq0EHP52z1ASNcX/w1wn5pgXOn"

try {
    $response = Invoke-WebRequest -Uri $hookUrl -Method POST -UseBasicParsing
    
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ Deploy acionado com sucesso!" -ForegroundColor Green
        Write-Host "📊 Acompanhe em: https://vercel.com/jpcamargoos-projects/vibrant-tours-prod/deployments" -ForegroundColor Yellow
        Write-Host "⏱️  Aguarde 2-3 minutos para o build completar..." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao acionar deploy: $_" -ForegroundColor Red
}
