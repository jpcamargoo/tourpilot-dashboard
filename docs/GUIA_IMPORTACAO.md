# 📥 Guia de Importação de Dados - Vibrant City Tours

**Versão:** 1.0  
**Público:** Administradores

---

## 🎯 Visão Geral

Este guia explica como importar dados históricos para o sistema, incluindo:
- Reservas passadas
- Sessões realizadas
- Dados de visitantes
- Transações financeiras

---

## 📋 1. TEMPLATE EXCEL - RESERVAS

### Download do Template
**Arquivo:** `template_importacao_reservas.xlsx`

### Colunas Obrigatórias

| Coluna | Tipo | Exemplo | Descrição |
|--------|------|---------|-----------|
| `data_hora` | Data/Hora | `2025-11-15 10:00` | Data e hora da sessão |
| `tour_nome` | Texto | `Free Walking Tour` | Nome exato do tour |
| `guia_nome` | Texto | `João Silva` | Nome do guia responsável |
| `num_pessoas` | Número | `8` | Quantidade de participantes |
| `origem` | Texto | `GetYourGuide` | Plataforma de origem |
| `status` | Texto | `CONFIRMADA` | Status da reserva |
| `valor` | Número | `0` ou `45.50` | Valor total (use ponto para decimais) |

### Colunas Opcionais

| Coluna | Tipo | Exemplo | Descrição |
|--------|------|---------|-----------|
| `visitante_nome` | Texto | `Maria Santos` | Nome do visitante |
| `visitante_email` | Email | `maria@email.com` | Email do visitante |
| `visitante_pais` | Código | `BR` | Código do país (ISO 3166-1) |
| `visitante_idioma` | Código | `pt` | Código do idioma (ISO 639-1) |
| `ref_externa` | Texto | `GYG-123456` | ID da reserva externa |
| `observacoes` | Texto | `Grupo familiar` | Notas adicionais |

---

## 📝 2. EXEMPLO DE PLANILHA

```csv
data_hora,tour_nome,guia_nome,num_pessoas,origem,status,valor,visitante_nome,visitante_pais,visitante_idioma
2025-11-15 10:00,Free Walking Tour,João Silva,8,GetYourGuide,COMPLETADA,0,Maria Santos,BR,pt
2025-11-15 14:00,Food Tour Alfama,Maria Santos,4,Viator,COMPLETADA,180,John Smith,US,en
2025-11-16 10:00,Free Walking Tour,Pedro Costa,12,Website,COMPLETADA,0,Pierre Dubois,FR,fr
2025-11-16 16:00,Sunset Tour Belém,João Silva,6,GetYourGuide,COMPLETADA,180,Ana Costa,PT,pt
2025-11-17 11:00,Sintra Day Trip,Maria Santos,8,Viator,COMPLETADA,960,Robert Johnson,UK,en
```

---

## ✅ 3. VALIDAÇÕES

### Tours
- ✅ Tour DEVE existir no sistema antes da importação
- ❌ Se tour não existir, cadastre primeiro em **Tours → Novo Tour**

### Guias
- ✅ Guia DEVE estar cadastrado no sistema
- ❌ Se guia não existir, cadastre primeiro em **Guias → Novo Guia**

### Datas
- ✅ Formato: `YYYY-MM-DD HH:MM` ou `DD/MM/YYYY HH:MM`
- ✅ Exemplos válidos:
  - `2025-11-15 10:00`
  - `15/11/2025 10:00`
- ❌ Evite: `15-11-2025`, `Nov 15 2025`

### Status Permitidos
- `CONFIRMADA` - Reserva confirmada
- `COMPLETADA` - Tour realizado
- `CANCELADA` - Reserva cancelada
- `NO_SHOW` - Cliente não compareceu
- `PENDENTE` - Aguardando confirmação

### Origem
Valores sugeridos:
- `GetYourGuide`
- `Viator`
- `TripAdvisor`
- `Booking`
- `Website`
- `Direto` (reserva direta)
- `Telefone`

### País (ISO 3166-1)
Códigos de 2 letras:
- `BR` - Brasil
- `US` - Estados Unidos
- `UK` - Reino Unido
- `FR` - França
- `ES` - Espanha
- `PT` - Portugal
- `DE` - Alemanha
- `IT` - Itália
- `JP` - Japão
- `CN` - China

### Idioma (ISO 639-1)
Códigos de 2 letras:
- `pt` - Português
- `en` - Inglês
- `es` - Espanhol
- `fr` - Francês
- `de` - Alemão
- `it` - Italiano
- `ja` - Japonês
- `zh` - Chinês

---

## 🚀 4. PROCESSO DE IMPORTAÇÃO

### Passo 1: Preparar Dados
1. Baixe o template
2. Preencha com seus dados históricos
3. Verifique todas as validações
4. Salve como `.xlsx` ou `.csv`

### Passo 2: Acessar Sistema
1. Login como ADMIN
2. Menu → **Ferramentas** → **Importar Dados**

### Passo 3: Upload
1. Clique em **Selecionar Arquivo**
2. Escolha sua planilha
3. Sistema exibe preview dos dados
4. Confira se está tudo correto

### Passo 4: Validação
Sistema verifica automaticamente:
- ✅ Formato das colunas
- ✅ Datas válidas
- ✅ Tours existentes
- ✅ Guias cadastrados
- ✅ Valores numéricos corretos

### Passo 5: Importação
1. Se tudo OK, clique em **Importar**
2. Sistema processa linha por linha
3. Barra de progresso exibida
4. Aguarde conclusão

### Passo 6: Relatório
Ao final, você verá:
```
✅ Importação concluída!

📊 Resumo:
   - Total de registros: 150
   - Importados com sucesso: 145
   - Erros: 5

📋 Detalhes dos erros:
   Linha 23: Tour "City Night Tour" não encontrado
   Linha 47: Data inválida "32/11/2025"
   Linha 89: Guia "Carlos Lima" não cadastrado
   Linha 102: Valor inválido "45,50" (use ponto: 45.50)
   Linha 134: Status inválido "CONFIRMADO" (use: CONFIRMADA)
```

---

## ⚠️ 5. ERROS COMUNS E SOLUÇÕES

### Erro: "Tour não encontrado"
**Causa:** Nome do tour na planilha diferente do cadastrado  
**Solução:** 
- Verifique nome exato em **Tours**
- Copie e cole o nome correto
- Atenção a maiúsculas/minúsculas

### Erro: "Guia não cadastrado"
**Causa:** Guia não existe no sistema  
**Solução:**
- Cadastre o guia primeiro
- Ou mude para guia existente
- Ou deixe vazio (sessão sem guia)

### Erro: "Data inválida"
**Causa:** Formato de data incorreto  
**Solução:**
- Use: `2025-11-15 10:00`
- Ou: `15/11/2025 10:00`
- Verifique vírgulas e espaços

### Erro: "Valor inválido"
**Causa:** Vírgula ao invés de ponto  
**Solução:**
- Mude de `45,50` para `45.50`
- Remova símbolos de moeda (€, $, R$)
- Use apenas números e ponto

### Erro: "Duplicata detectada"
**Causa:** Reserva já existe no sistema  
**Solução:**
- Use `ref_externa` única para evitar duplicatas
- Sistema pula automaticamente duplicatas
- Não é erro grave, apenas aviso

---

## 🔄 6. IMPORTAÇÃO VIA SCRIPT

Para grandes volumes (> 1000 registros):

### Preparar CSV
```csv
data_hora,tour_nome,guia_nome,num_pessoas,origem,status,valor
2025-11-15 10:00,Free Walking Tour,João Silva,8,GetYourGuide,COMPLETADA,0
2025-11-15 14:00,Food Tour Alfama,Maria Santos,4,Viator,COMPLETADA,180
```

### Executar Script
```bash
npm run etl:reservas caminho/para/seu/arquivo.csv
```

### Monitorar
- Logs exibidos no terminal
- Arquivo de log criado em `/logs/import_YYYYMMDD.log`
- Consulte **Logs ETL** no sistema

---

## 📊 7. APÓS A IMPORTAÇÃO

### Verificar Dados
1. Menu **Dashboard** → Verifique métricas
2. **Agenda** → Confira sessões importadas
3. **Guias** → Valide estatísticas

### Ajustes Necessários
Se algo estiver errado:
- Dados incorretos: Edite manualmente
- Muitos erros: Delete e reimporte
- Dúvidas: Consulte suporte

### Backup
**IMPORTANTE:** Sistema cria backup automático antes de cada importação grande
- Localização: `/backups/pre_import_YYYYMMDD.db`
- Retenção: 30 dias
- Restauração: Sob solicitação

---

## 💡 8. DICAS E BOAS PRÁTICAS

### Preparação
✅ Faça backup manual antes de importar  
✅ Teste com 10-20 registros primeiro  
✅ Valide dados em planilha antes  
✅ Use template fornecido  

### Durante Importação
✅ Não feche navegador durante processo  
✅ Não faça outras operações no sistema  
✅ Aguarde mensagem de conclusão  

### Após Importação
✅ Revise relatório de erros  
✅ Corrija problemas identificados  
✅ Reimporte apenas linhas com erro  
✅ Verifique métricas do dashboard  

### Dados Sensíveis
✅ Não inclua senhas ou cartões de crédito  
✅ Apenas emails necessários  
✅ Respeite LGPD/GDPR  
✅ Delete planilhas após importação  

---

## 📞 9. SUPORTE

### Problemas na Importação
- Email: suporte@vibrantcitytours.com
- Anexe: Planilha + print do erro
- Descreva: O que tentou importar

### Importações Complexas
Para casos especiais:
- Grande volume (> 10.000 registros)
- Dados em formato diferente
- Migração de outro sistema
- Integração customizada

**Contate:** dev@vibrantcitytours.com

---

## 📚 10. TEMPLATES DISPONÍVEIS

### Download de Templates

| Tipo | Arquivo | Uso |
|------|---------|-----|
| Reservas | `template_reservas.xlsx` | Importar bookings |
| Sessões | `template_sessoes.xlsx` | Criar sessões em lote |
| Transações | `template_transacoes.xlsx` | Importar gorjetas |
| Visitantes | `template_visitantes.xlsx` | Cadastro de clientes |

**Acesso:** Menu → Ferramentas → Download Templates

---

## ✨ EXEMPLO COMPLETO

### Cenário
Você tem 6 meses de dados históricos do GetYourGuide

### Passo a Passo

1. **Exportar do GetYourGuide**
   - Relatório de bookings
   - Período: Jan-Jun 2025
   - Formato: Excel

2. **Adaptar ao Template**
   ```
   GetYourGuide       →  Template Sistema
   -------------------    ----------------
   "Activity Name"    →  tour_nome
   "Guide"            →  guia_nome
   "Date & Time"      →  data_hora
   "Pax"              →  num_pessoas
   "Booking Status"   →  status
   "Price"            →  valor
   ```

3. **Cadastrar Pré-requisitos**
   - Todos os tours no sistema
   - Todos os guias cadastrados

4. **Importar**
   - Upload da planilha adaptada
   - Aguardar processamento
   - Revisar relatório

5. **Validar**
   - Dashboard mostra 6 meses de histórico
   - Métricas corretas
   - Guias com estatísticas

---

**Dúvidas?** suporte@vibrantcitytours.com  
**Última atualização:** Dezembro 2025
