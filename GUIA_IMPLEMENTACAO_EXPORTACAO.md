# Guia Rápido: Como Adicionar Exportação em Outras Páginas

## 🎯 Template Pronto para Uso

### 1. Para Página com dados simples (Server Component)

```tsx
// No topo do arquivo
import { ExportButton } from '@/components/export-button';

// Dentro da função da página
export default async function MinhaPage() {
  // 1. Buscar dados do banco
  const dados = await prisma.minhaTabela.findMany({
    include: { relacoes: true }
  });

  // 2. Formatar dados para exportação
  const dadosExport = dados.map(item => ({
    Coluna1: item.campo1,
    Coluna2: item.campo2,
    Data: new Date(item.dataHora).toLocaleDateString('pt-BR'),
    // Adicione todos os campos que deseja exportar
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2>Título da Página</h2>
        
        {/* 3. Adicionar botão de exportação */}
        <ExportButton 
          data={dadosExport} 
          filename="meu_arquivo" 
          title="Exportar Dados"
        />
      </div>
      
      {/* Resto do conteúdo */}
    </div>
  );
}
```

### 2. Para Página com Tabs (como Financial)

```tsx
import { ExportButton } from '@/components/export-button';

export default async function MinhaPageComTabs() {
  const dados = await buscarDados();

  // Preparar dados para cada aba
  const dados1Export = dados.tipo1.map(...)
  const dados2Export = dados.tipo2.map(...)
  
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
      </TabsList>

      <TabsContent value="tab1">
        <div className="flex justify-end mb-4">
          <ExportButton 
            data={dados1Export} 
            filename="dados_aba1" 
            title="Exportar Aba 1"
          />
        </div>
        {/* Conteúdo da aba */}
      </TabsContent>

      <TabsContent value="tab2">
        <div className="flex justify-end mb-4">
          <ExportButton 
            data={dados2Export} 
            filename="dados_aba2" 
            title="Exportar Aba 2"
          />
        </div>
        {/* Conteúdo da aba */}
      </TabsContent>
    </Tabs>
  );
}
```

## 📋 Checklist de Implementação

Ao adicionar exportação em uma página, certifique-se de:

- [ ] Importar `ExportButton` no topo do arquivo
- [ ] Formatar dados com **nomes de colunas em Português**
- [ ] Usar `toLocaleDateString('pt-BR')` para datas
- [ ] Usar `toFixed(2)` para valores monetários
- [ ] Escolher um `filename` descritivo e sem espaços
- [ ] Posicionar o botão de forma visível (geralmente no header ou antes da tabela)
- [ ] Testar com dados vazios (o componente já valida, mas confirme)
- [ ] Verificar se todas as relações Prisma necessárias estão incluídas

## 🔍 Exemplos de Formatação de Dados Comuns

### Datas:
```tsx
Data: new Date(item.dataHora).toLocaleDateString('pt-BR')
// Resultado: "25/01/2025"
```

### Datas com Hora:
```tsx
DataHora: new Date(item.dataHora).toLocaleString('pt-BR')
// Resultado: "25/01/2025, 14:30:00"
```

### Valores Monetários:
```tsx
Valor: item.valor.toFixed(2)
// ou
Valor: `€${item.valor.toFixed(2)}`
```

### Enums/Status:
```tsx
Status: item.status // Já vem como string do enum
```

### Relacionamentos:
```tsx
Guia: item.guia?.nome || '-'  // Usar || '-' para valores nulos
Tour: item.tour?.nome || 'N/A'
```

### Booleanos:
```tsx
Ativo: item.ativo ? 'Sim' : 'Não'
```

### Arrays/Contagens:
```tsx
TotalReservas: item.reservas.length
```

## 🎯 Próximas Páginas Sugeridas

### Prioridade ALTA (páginas principais):

#### 1. Dashboard Principal (`/app/dashboard/page.tsx`)
```tsx
// Exportar resumo do dia
const resumoExport = {
  Data: new Date().toLocaleDateString('pt-BR'),
  TotalTours: totalTours,
  TotalReservas: totalReservas,
  ReceitaDia: receitaDia.toFixed(2),
  // etc...
};
```

#### 2. Guias (`/app/dashboard/guias/page.tsx`)
```tsx
const guiasExport = guias.map(g => ({
  Nome: g.nome,
  Email: g.email,
  Telefone: g.telefone || '-',
  Idiomas: g.idiomas.join(', '),
  TotalSessoes: g._count.sessoesTour,
  Status: g.ativo ? 'Ativo' : 'Inativo',
}));
```

#### 3. Tours (`/app/dashboard/tours/page.tsx`)
```tsx
const toursExport = tours.map(t => ({
  Nome: t.nome,
  PrecoBase: t.precoBase.toFixed(2),
  Duracao: `${t.duracao} min`,
  MaxParticipantes: t.maxParticipantes,
  Status: t.ativo ? 'Ativo' : 'Inativo',
}));
```

### Prioridade MÉDIA:

#### 4. Agenda (`/app/dashboard/agenda/page.tsx`)
```tsx
const sessoesExport = sessoes.map(s => ({
  Data: new Date(s.dataHora).toLocaleDateString('pt-BR'),
  Hora: new Date(s.dataHora).toLocaleTimeString('pt-BR'),
  Tour: s.tour.nome,
  Guia: s.guia.nome,
  Reservas: s._count.reservas,
  Status: s.status,
}));
```

#### 5. Reviews (`/app/dashboard/reviews/page.tsx`)
```tsx
const reviewsExport = reviews.map(r => ({
  Data: new Date(r.data).toLocaleDateString('pt-BR'),
  Tour: r.tour.nome,
  Avaliacao: r.rating,
  Sentimento: r.sentimentScore.toFixed(2),
  Comentario: r.comentario,
  Plataforma: r.plataforma,
}));
```

## 💡 Dicas Avançadas

### 1. Exportação com Filtros
Se a página tem filtros, passe os dados já filtrados:

```tsx
const dadosFiltrados = dados.filter(/* seus filtros */);
const exportData = dadosFiltrados.map(/* formatação */);

<ExportButton data={exportData} filename="dados_filtrados" />
```

### 2. Múltiplos Botões de Exportação
Você pode ter vários botões na mesma página:

```tsx
<div className="flex gap-2">
  <ExportButton 
    data={todosOsDados} 
    filename="completo" 
    title="Exportar Tudo"
  />
  <ExportButton 
    data={dadosResumidos} 
    filename="resumo" 
    title="Exportar Resumo"
  />
</div>
```

### 3. Exportação Condicional
Mostrar botão apenas se houver dados:

```tsx
{dados.length > 0 && (
  <ExportButton 
    data={dadosExport} 
    filename="dados" 
  />
)}
```

## 🚀 Ação Imediata

**Para implementar agora:**
1. Escolha uma página (sugestão: `/dashboard/guias/page.tsx`)
2. Copie o template do início deste guia
3. Ajuste os nomes de campos
4. Teste a exportação
5. Repita para outras páginas

**Tempo estimado por página:** 5-10 minutos

---

**Precisa de ajuda?** Veja o exemplo completo em [app/dashboard/financial/page.tsx](app/dashboard/financial/page.tsx)
