# Checklist de Testes - Vibrant City Tours Dashboard

## 📋 Plano de Validação Completo

### 1. Setup Inicial ✓
- [ ] Banco de dados configurado e migrations aplicadas
- [ ] Variáveis de ambiente (.env) configuradas
- [ ] Dependências instaladas (npm install)
- [ ] Servidor rodando (npm run dev)
- [ ] Seed com dados de teste executado

### 2. Autenticação 🔐
- [ ] Login funciona corretamente
- [ ] Logout funciona
- [ ] Redirecionamento para login quando não autenticado
- [ ] Sessão persiste entre reloads

### 3. Dashboard Principal 📊
- [ ] Cards de métricas carregam corretamente
- [ ] Visitantes/mês exibe dados
- [ ] Reservas/mês exibe dados
- [ ] Taxa de cancelamento calcula corretamente
- [ ] Avaliação média mostra reviews
- [ ] Gráficos de idiomas funcionam
- [ ] Gráficos de países funcionam
- [ ] Tabela de próximas sessões carrega
- [ ] Links de navegação funcionam

### 4. Gestão de Guias 👥
- [ ] Lista de guias carrega
- [ ] Criar novo guia funciona
- [ ] Editar guia funciona
- [ ] Validação de campos obrigatórios
- [ ] Idiomas são salvos corretamente
- [ ] Status (ATIVO/INATIVO) funciona

### 5. Gestão de Tours 🗺️
- [ ] Lista de tours carrega
- [ ] Criar novo tour funciona
- [ ] Editar tour funciona
- [ ] Preço e duração salvam corretamente
- [ ] Capacidade máxima funciona
- [ ] Idiomas do tour salvam corretamente

### 6. Agenda 📅
- [ ] Sessões de hoje carregam
- [ ] Sessões próximos 7 dias carregam
- [ ] Sessões próximos 30 dias carregam
- [ ] Criar nova sessão funciona
- [ ] Atribuir guia à sessão funciona
- [ ] Status da sessão atualiza
- [ ] Ocupação (reservas vs capacidade) calcula corretamente

### 7. Calendário Inteligente 🤖
**Aba Otimização:**
- [ ] Detecta sessões sem guia
- [ ] Gera sugestões de alocação
- [ ] Score de compatibilidade calcula (idiomas, experiência, reviews)
- [ ] Botão "Alocar" funciona
- [ ] Verifica conflitos de horário

**Aba Disponibilidade:**
- [ ] Relatório de guias carrega
- [ ] Total de sessões por guia correto
- [ ] Horas de trabalho calculadas
- [ ] Taxa de ocupação calcula corretamente
- [ ] Indicadores visuais funcionam

### 8. Comparativos 📈
**Aba Guias:**
- [ ] Cards de destaque carregam
- [ ] Tabela comparativa completa funciona
- [ ] Rankings Top 5 funcionam
- [ ] Métricas calculam corretamente:
  - [ ] Total de sessões
  - [ ] Total de visitantes
  - [ ] Média por sessão
  - [ ] Reviews e avaliações
  - [ ] Receita gerada
  - [ ] Gorjetas recebidas

**Aba Tours:**
- [ ] Cards de destaque carregam
- [ ] Tabela comparativa funciona
- [ ] Taxa de ocupação calcula corretamente
- [ ] Barra de progresso visual funciona
- [ ] Rankings funcionam

### 9. Reviews 🌟
**Métricas:**
- [ ] Total de reviews carrega
- [ ] Reviews do mês correto
- [ ] Média geral calcula
- [ ] Tendência (30 dias) funciona
- [ ] Indicador ↑↓→ correto

**Análise de Sentimento:**
- [ ] Distribuição (positivo/neutro/negativo) correta
- [ ] Barras de progresso funcionam
- [ ] Reviews por fonte carregam
- [ ] Top tours por reviews funciona
- [ ] Reviews recentes listam corretamente

**Scraping:**
- [ ] Botão "Executar Scraping" funciona
- [ ] Google Places API integra (se configurada)
- [ ] TripAdvisor API integra (se configurada)
- [ ] Deduplicação de reviews funciona
- [ ] Sentimento analisa corretamente (PT, EN, ES, FR)

### 10. Financial 💰
**Aba Balanço:**
- [ ] Receita total calcula
- [ ] Receita de tours soma sessões × preço
- [ ] Gorjetas totais somam
- [ ] Lucro líquido calcula
- [ ] Variação vs mês anterior funciona
- [ ] Tabela receita por tour carrega

**Aba Gorjetas:**
- [ ] Total de gorjetas correto
- [ ] Média por guia calcula
- [ ] Variação mensal funciona
- [ ] Ranking de guias por gorjetas ordena corretamente
- [ ] Quantidade e média individual corretas

**Aba Transações:**
- [ ] Lista todas as transações
- [ ] Tipos (BALANCO, GORJETA, AJUSTE) exibem
- [ ] Valores positivos/negativos com cores corretas
- [ ] Descrições aparecem
- [ ] Guia e tour associados mostram

### 11. APIs 🔌
**GET Endpoints:**
- [ ] `/api/guias` retorna lista
- [ ] `/api/tours` retorna lista
- [ ] `/api/sessoes` retorna lista
- [ ] `/api/transacoes` retorna com filtros
- [ ] `/api/reviews/scrape` retorna status

**POST Endpoints:**
- [ ] `/api/guias` cria novo guia
- [ ] `/api/tours` cria novo tour
- [ ] `/api/sessoes` cria nova sessão
- [ ] `/api/transacoes` cria transação
- [ ] `/api/reviews/scrape` executa scraping
- [ ] `/api/reviews/analyze` reanálisa sentimento
- [ ] `/api/scheduling/allocate` aloca guia

**Validações:**
- [ ] Campos obrigatórios validam
- [ ] Tipos de dados validam
- [ ] Erros retornam mensagens claras

### 12. Performance ⚡
- [ ] Páginas carregam em < 3 segundos
- [ ] Queries do banco otimizadas
- [ ] Sem N+1 queries
- [ ] Suspense boundaries funcionam
- [ ] Loading states aparecem

### 13. Responsividade 📱
- [ ] Desktop (1920px) funciona
- [ ] Laptop (1366px) funciona
- [ ] Tablet (768px) funciona
- [ ] Mobile (375px) layout adequado

### 14. Erros e Edge Cases 🐛
- [ ] Dados vazios não quebram páginas
- [ ] Erros de API mostram mensagens
- [ ] Sessão expirada redireciona
- [ ] Formulários validam antes de submit
- [ ] Datas inválidas são tratadas
- [ ] Divisões por zero tratadas

---

## 🚨 Problemas Conhecidos

### Críticos (Bloqueadores)
- [ ] Nenhum identificado ainda

### Altos (Importantes)
- [ ] CSS inline styles (warnings de lint)
- [ ] Accessible name em selects (warnings)

### Médios
- [ ] Falta implementação GetYourGuide scraping
- [ ] Seed precisa de mais dados de exemplo

### Baixos (Nice to have)
- [ ] Exportação Excel/PDF não implementada
- [ ] Gráficos poderiam usar Recharts
- [ ] Filtros avançados no dashboard principal (componente criado, falta integrar)

---

## 📝 Próximos Passos Sugeridos

1. **Executar Seed com Dados de Teste**
2. **Testar Fluxo Completo de Usuário**
3. **Corrigir Problemas Encontrados**
4. **Otimizar Performance**
5. **Adicionar Testes Automatizados**
6. **Deploy em Ambiente de Staging**
