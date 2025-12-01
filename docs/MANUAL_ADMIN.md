# 📘 Manual do Administrador - Vibrant City Tours

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Público:** Administradores e Gestores

---

## 🎯 Visão Geral

O dashboard Vibrant City Tours é uma plataforma completa para gestão operacional de tours guiados, oferecendo:
- Gestão de tours, guias e sessões
- Alocação inteligente de recursos
- Métricas e análises em tempo real
- Controle financeiro
- Sistema de reviews integrado

---

## 🔐 1. ACESSO AO SISTEMA

### Login
1. Acesse: `https://dashboard.vibrantcitytours.com`
2. Email: `seu_email@vibrantcitytours.com`
3. Senha: (fornecida pelo suporte)

### Primeiro Acesso
- Altere sua senha em **Perfil → Configurações**
- Configure autenticação de dois fatores (recomendado)

### Níveis de Acesso
- **ADMIN**: Acesso total ao sistema
- **GUIA**: Acesso à própria agenda e métricas
- **EQUIPE**: Visualização de relatórios

---

## 🎫 2. GESTÃO DE TOURS

### Criar Novo Tour
1. Menu lateral → **Tours**
2. Clique em **+ Novo Tour**
3. Preencha os campos:
   - **Nome**: Ex: "Free Walking Tour Lisboa"
   - **Descrição**: Detalhes do passeio
   - **Duração**: Em minutos (ex: 180)
   - **Preço Base**: Valor por pessoa (0 para free tours)
   - **Capacidade Máxima**: Número de pessoas
   - **Idiomas**: Selecione os idiomas disponíveis
   - **Status**: Ativo/Inativo
4. Clique em **Criar Tour**

### Editar Tour Existente
1. Na lista de tours, clique em **Ver Detalhes**
2. Clique no botão **Editar**
3. Modifique os campos desejados
4. Clique em **Salvar Alterações**

### Deletar Tour
⚠️ **Atenção**: Só é possível deletar tours sem sessões cadastradas
1. Na lista de tours, clique no ícone **🗑️ Lixeira**
2. Confirme a exclusão no dialog

### Desativar Tour Temporariamente
- Edite o tour e marque **Status: Inativo**
- O tour não aparecerá nas opções de agendamento

---

## 👥 3. GESTÃO DE GUIAS

### Cadastrar Novo Guia
1. Menu lateral → **Guias**
2. Clique em **+ Novo Guia**
3. Preencha os dados:
   - **Nome Completo**
   - **Email**: Será usado para login
   - **Telefone**: WhatsApp preferencial
   - **Idiomas**: Idiomas que o guia fala
   - **Status**: Ativo/Férias/Inativo
4. Sistema cria automaticamente:
   - Usuário com acesso ao dashboard
   - Senha temporária (enviada por email)

### Editar Informações do Guia
1. Lista de guias → **Ver Detalhes**
2. Botão **Editar**
3. Modifique dados necessários
4. **Salvar Alterações**

### Marcar Guia em Férias
1. Edite o guia
2. Altere **Status** para **FÉRIAS**
3. Sistema não sugerirá este guia para novas alocações

### Visualizar Performance do Guia
- **Métricas individuais**: Total de tours, nota média, reviews
- **Histórico**: Sessões passadas e futuras
- **Financeiro**: Gorjetas e balanços

---

## 📅 4. GESTÃO DA AGENDA

### Criar Nova Sessão
1. Menu **Agenda** → **+ Nova Sessão**
2. Selecione:
   - **Tour**: Escolha da lista
   - **Data e Hora**: Use o seletor
   - **Ponto de Encontro**: Local de início
   - **Guia** (opcional): Sistema sugere automaticamente
   - **Duração**: Preenchido automaticamente do tour
   - **Capacidade**: Preenchido automaticamente
3. **Observações** (opcional): Notas internas
4. Clique em **Criar Sessão**

### Visualização da Agenda

**Modo Calendário:**
- Cards coloridos por status
- Clique para ver detalhes
- Arraste para mover (em breve)

**Modo Lista:**
- Filtros por período, guia, tour
- Exportar para Excel/PDF

### Alocação Inteligente de Guias

#### Automática:
1. Na **Agenda**, veja seção **Otimização Automática**
2. Sistema mostra **sugestões** de alocação:
   - Guia disponível no horário
   - Idiomas compatíveis
   - Histórico de performance
   - Balanceamento de carga
3. Clique em **Alocar** na sugestão
4. Confirme no dialog

#### Manual:
1. Sessão sem guia → **Ver Detalhes**
2. Campo **Guia** → Selecione da lista
3. **Salvar**

### Cancelar/Deletar Sessão
⚠️ Só é possível deletar sessões sem reservas ativas
1. Card da sessão → **Deletar Sessão** (botão vermelho)
2. Confirme no dialog
3. Sistema notifica todos os envolvidos

---

## 📊 5. DASHBOARD E MÉTRICAS

### KPIs Principais
**Card de Resumo:**
- **Visitantes/Mês**: Total de turistas atendidos
- **Receita**: Faturamento do período
- **Ocupação Média**: % de capacidade utilizada
- **Tours Realizados**: Sessões completadas

### Filtros Disponíveis
- **Período**: Hoje, semana, mês, personalizado
- **Tour específico**: Filtrar por tour
- **Guia específico**: Performance individual
- **Origem**: Website, GetYourGuide, Viator, etc.

### Gráficos e Análises
1. **Distribuição por Idioma**: Quais idiomas mais demandados
2. **Origem dos Visitantes**: Países de onde vêm os turistas
3. **Taxa de Ocupação**: Tendências ao longo do tempo
4. **Comparativo de Guias**: Performance relativa

### Exportar Relatórios
1. Selecione o período desejado
2. Clique em **Exportar**
3. Escolha formato: **Excel** ou **PDF**
4. Arquivo baixa automaticamente

---

## 💰 6. GESTÃO FINANCEIRA

### Registrar Transação
1. Menu **Financeiro** (ou botão na agenda)
2. **+ Adicionar Transação**
3. Preencha:
   - **Tipo**: Gorjeta, Balanço, Ajuste
   - **Guia**: Selecione da lista
   - **Sessão** (se aplicável): Vincular ao tour
   - **Valor**: Quantia em Euros
   - **Descrição**: Observações
4. **Salvar Transação**

### Balanço por Guia
- Visualize total de gorjetas por período
- Filtre por guia
- Exporte para folha de pagamento

### Relatório Financeiro
- **Receita por Tour**: Quais geram mais retorno
- **Gorjetas Médias**: Por tour e por guia
- **Comissões**: De plataformas externas

---

## ⭐ 7. GESTÃO DE REVIEWS

### Visualização de Reviews
- **Por Tour**: Notas e comentários
- **Por Guia**: Performance individual
- **Por Plataforma**: Google, TripAdvisor, etc.

### Análise de Sentimento
Sistema categoriza automaticamente:
- 🟢 **Positivo**: Reviews favoráveis
- 🟡 **Neutro**: Reviews mistos
- 🔴 **Negativo**: Reviews críticos

### Scraping Automático
- Sistema busca reviews semanalmente
- Notificação de novas avaliações
- Histórico completo mantido

### Responder Reviews (em breve)
- Responda diretamente da plataforma
- Templates de resposta disponíveis

---

## 🔔 8. ALERTAS E NOTIFICAÇÕES

### Alertas Automáticos
Sistema envia notificações via **Telegram** para:

#### Operacionais:
- 🔴 **Urgente**: Sessão em 48h sem guia
- 🟡 **Atenção**: Ocupação < 30% faltando 24h
- 🟢 **Info**: Nova reserva confirmada
- ⚫ **Cancelamento**: Reserva cancelada

#### Configuração do Telegram:
1. Adicione o bot ao grupo da equipe
2. Bot envia alertas automaticamente
3. Configure horários de notificação

### Email Reports (opcional)
- Relatório diário (8h da manhã)
- Relatório semanal (segunda-feira)
- Relatório mensal (dia 1)

---

## 📥 9. IMPORTAÇÃO DE DADOS

### Importar Reservas (CSV/Excel)

**Template disponível em:** Menu → Ferramentas → Download Template

**Colunas obrigatórias:**
```csv
data_hora,tour_nome,guia_nome,num_pessoas,origem,status,valor
2025-12-15 10:00,Free Walking Tour,João Silva,8,GetYourGuide,CONFIRMADA,0
```

**Processo:**
1. Preencha o template
2. Menu → **Importar Dados**
3. Selecione arquivo
4. Sistema valida e importa
5. Relatório de importação exibido

### Integração Automática
- **GetYourGuide**: Sincronização a cada 2h
- **Viator**: Diária (madrugada)
- **Booking**: Sob demanda

---

## 🔒 10. SEGURANÇA E PERMISSÕES

### Níveis de Permissão

**ADMIN pode:**
- ✅ Criar/editar/deletar tours
- ✅ Criar/editar/deletar guias
- ✅ Ver todas as sessões e métricas
- ✅ Alocar qualquer guia
- ✅ Acessar financeiro completo
- ✅ Gerenciar usuários

**GUIA pode:**
- ✅ Ver apenas suas sessões
- ✅ Editar seus próprios dados
- ✅ Registrar gorjetas pessoais
- ✅ Ver seus reviews
- ❌ Não pode ver outros guias
- ❌ Não pode criar tours

**EQUIPE pode:**
- ✅ Ver relatórios e dashboards
- ✅ Visualizar agenda completa
- ❌ Não pode editar nada
- ❌ Apenas leitura

### Rate Limiting
Sistema limita requisições para prevenir abuso:
- **Leitura**: 100 req/minuto
- **Escrita**: 20 req/minuto
- **Deleção**: 10 req/5 minutos

---

## 🆘 11. SOLUÇÃO DE PROBLEMAS

### Não consigo fazer login
1. Verifique email e senha
2. Use "Esqueci minha senha"
3. Contate suporte: suporte@vibrantcitytours.com

### Sistema está lento
1. Limpe cache do navegador
2. Use Chrome ou Firefox atualizados
3. Verifique sua conexão de internet

### Não vejo meus dados
1. Verifique filtros aplicados (período, status)
2. Confirme seu nível de permissão
3. Faça logout e login novamente

### Erro ao deletar tour/guia
- Só é possível deletar sem dependências
- Tours com sessões não podem ser deletados
- Guias com sessões futuras não podem ser deletados
- **Solução**: Desative ao invés de deletar

### Integração não está sincronizando
1. Verifique credenciais da API
2. Consulte logs em **Ferramentas → Logs ETL**
3. Contate suporte técnico

---

## 📞 12. SUPORTE

### Canais de Atendimento
- **Email**: suporte@vibrantcitytours.com
- **Telegram**: Grupo de Suporte Técnico
- **Horário**: Segunda a Sexta, 9h-18h

### Documentação Adicional
- **Manual do Guia**: Para equipe operacional
- **Guia de Importação**: Templates e exemplos
- **API Documentation**: Para integrações customizadas

### Backup e Segurança
- **Backup automático**: Diário às 3h da manhã
- **Retenção**: 30 dias
- **Restauração**: Sob solicitação

---

## 🎓 13. BOAS PRÁTICAS

### Cadastramento
✅ Cadastre todos os tours antes de criar sessões  
✅ Mantenha dados dos guias atualizados  
✅ Use nomes consistentes e descritivos  

### Alocação
✅ Use o sistema de sugestão inteligente  
✅ Aloque guias com 48h de antecedência mínima  
✅ Considere idiomas dos visitantes  

### Financeiro
✅ Registre transações no mesmo dia  
✅ Adicione descrições detalhadas  
✅ Feche balanços mensalmente  

### Reviews
✅ Monitore reviews semanalmente  
✅ Responda reviews negativos rapidamente  
✅ Use feedback para melhorar tours  

---

## 📝 14. ATALHOS DO TECLADO

| Atalho | Ação |
|--------|------|
| `Ctrl + N` | Nova sessão |
| `Ctrl + F` | Buscar |
| `Ctrl + P` | Imprimir/Exportar |
| `Ctrl + S` | Salvar (em formulários) |
| `Esc` | Fechar dialog |

---

**Versão do Sistema:** 1.0  
**Última Atualização:** Dezembro 2025  

*Para sugestões de melhoria deste manual, entre em contato com a equipe de suporte.*
