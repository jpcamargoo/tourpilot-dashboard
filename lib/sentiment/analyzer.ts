/**
 * Análise de Sentimento para Reviews
 * Utiliza múltiplas estratégias para classificar o sentimento dos comentários
 */

interface SentimentAnalysis {
  sentimento: 'positivo' | 'neutro' | 'negativo';
  confianca: number; // 0 a 1
  palavrasChave: string[];
}

// Dicionários de palavras-chave em múltiplos idiomas
const PALAVRAS_POSITIVAS = {
  pt: [
    'excelente', 'ótimo', 'maravilhoso', 'perfeito', 'incrível', 'fantástico',
    'espetacular', 'adorei', 'amei', 'recomendo', 'melhor', 'excepcional',
    'impecável', 'magnífico', 'sensacional', 'top', 'show', 'demais',
    'bom', 'legal', 'bacana', 'positivo', 'agradável', 'satisfeito',
    'feliz', 'encantador', 'divertido', 'interessante', 'útil', 'prestativo',
  ],
  en: [
    'excellent', 'great', 'wonderful', 'perfect', 'amazing', 'fantastic',
    'spectacular', 'loved', 'recommend', 'best', 'exceptional', 'outstanding',
    'awesome', 'brilliant', 'superb', 'good', 'nice', 'pleasant', 'satisfied',
    'happy', 'delightful', 'enjoyable', 'interesting', 'helpful', 'friendly',
  ],
  es: [
    'excelente', 'genial', 'maravilloso', 'perfecto', 'increíble', 'fantástico',
    'espectacular', 'encantó', 'recomiendo', 'mejor', 'excepcional', 'impecable',
    'bueno', 'agradable', 'satisfecho', 'feliz', 'encantador', 'divertido',
    'interesante', 'útil', 'amable',
  ],
  fr: [
    'excellent', 'génial', 'merveilleux', 'parfait', 'incroyable', 'fantastique',
    'spectaculaire', 'adoré', 'recommande', 'meilleur', 'exceptionnel', 'impeccable',
    'bon', 'agréable', 'satisfait', 'heureux', 'charmant', 'amusant',
    'intéressant', 'utile', 'aimable',
  ],
};

const PALAVRAS_NEGATIVAS = {
  pt: [
    'péssimo', 'horrível', 'terrível', 'ruim', 'mal', 'desagradável', 'chato',
    'decepcionante', 'decepção', 'pior', 'lamentável', 'inadequado', 'insatisfeito',
    'problema', 'problemas', 'defeito', 'falha', 'não recomendo', 'evitem',
    'caro', 'fraudado', 'enganado', 'perdido', 'atrasado', 'cancelado',
    'sujo', 'desorganizado', 'confuso', 'difícil', 'complicado', 'antipático',
  ],
  en: [
    'terrible', 'horrible', 'awful', 'bad', 'poor', 'unpleasant', 'boring',
    'disappointing', 'disappointment', 'worst', 'inadequate', 'unsatisfied',
    'problem', 'problems', 'defect', 'failure', 'not recommend', 'avoid',
    'expensive', 'scam', 'fraud', 'lost', 'delayed', 'canceled', 'cancelled',
    'dirty', 'disorganized', 'confused', 'difficult', 'complicated', 'rude',
  ],
  es: [
    'pésimo', 'horrible', 'terrible', 'malo', 'desagradable', 'aburrido',
    'decepcionante', 'decepción', 'peor', 'inadecuado', 'insatisfecho',
    'problema', 'problemas', 'defecto', 'fallo', 'no recomiendo', 'evitar',
    'caro', 'estafa', 'engañado', 'perdido', 'retrasado', 'cancelado',
    'sucio', 'desorganizado', 'confuso', 'difícil', 'complicado', 'antipático',
  ],
  fr: [
    'terrible', 'horrible', 'affreux', 'mauvais', 'désagréable', 'ennuyeux',
    'décevant', 'déception', 'pire', 'inadéquat', 'insatisfait',
    'problème', 'problèmes', 'défaut', 'échec', 'ne recommande pas', 'éviter',
    'cher', 'arnaque', 'trompé', 'perdu', 'retardé', 'annulé',
    'sale', 'désorganisé', 'confus', 'difficile', 'compliqué', 'impoli',
  ],
};

const INTENSIFICADORES = [
  'muito', 'extremamente', 'super', 'bem', 'bastante', 'demais',
  'muito muito', 'realmente', 'verdadeiramente', 'incrivelmente',
  'very', 'extremely', 'super', 'really', 'truly', 'incredibly',
  'muy', 'extremadamente', 'súper', 'realmente', 'verdaderamente',
  'très', 'extrêmement', 'vraiment', 'incroyablement',
];

const NEGACOES = [
  'não', 'nem', 'nunca', 'jamais', 'nada', 'nenhum',
  'not', 'never', 'no', 'nothing', 'none', 'neither',
  'no', 'nunca', 'jamás', 'nada', 'ningún',
  'ne', 'pas', 'jamais', 'rien', 'aucun',
];

export function analisarSentimento(
  nota: number,
  comentario?: string | null
): SentimentAnalysis {
  // Análise primária baseada na nota
  let sentimento: 'positivo' | 'neutro' | 'negativo';
  let confiancaNota = 0;

  if (nota >= 4.5) {
    sentimento = 'positivo';
    confiancaNota = 0.8 + (nota - 4.5) * 0.4; // 0.8 a 1.0
  } else if (nota >= 4.0) {
    sentimento = 'positivo';
    confiancaNota = 0.6 + (nota - 4.0) * 0.4; // 0.6 a 0.8
  } else if (nota >= 3.5) {
    sentimento = 'neutro';
    confiancaNota = 0.6 + (nota - 3.5) * 0.4; // 0.6 a 0.8
  } else if (nota >= 2.5) {
    sentimento = 'neutro';
    confiancaNota = 0.5 + (3.5 - nota) * 0.1; // 0.5 a 0.6
  } else {
    sentimento = 'negativo';
    confiancaNota = 0.7 + (2.5 - nota) * 0.12; // 0.7 a 1.0
  }

  // Se não há comentário, retorna baseado na nota
  if (!comentario || comentario.trim().length === 0) {
    return {
      sentimento,
      confianca: confiancaNota,
      palavrasChave: [],
    };
  }

  // Análise de texto
  const textoAnalise = analisarTexto(comentario);

  // Combinar análise de nota e texto
  let sentimentoFinal = sentimento;
  let confiancaFinal = confiancaNota;
  
  if (textoAnalise.sentimento !== sentimento) {
    // Há discordância entre nota e texto
    // Dar mais peso ao texto se a confiança for alta
    if (textoAnalise.confianca > 0.7) {
      sentimentoFinal = textoAnalise.sentimento;
      confiancaFinal = (textoAnalise.confianca * 0.7 + confiancaNota * 0.3);
    } else {
      // Manter sentimento da nota mas reduzir confiança
      confiancaFinal = (confiancaNota * 0.7 + textoAnalise.confianca * 0.3);
    }
  } else {
    // Concordância entre nota e texto - aumentar confiança
    confiancaFinal = Math.min(1, (confiancaNota + textoAnalise.confianca) / 2 + 0.1);
  }

  return {
    sentimento: sentimentoFinal,
    confianca: confiancaFinal,
    palavrasChave: textoAnalise.palavrasChave,
  };
}

function analisarTexto(texto: string): SentimentAnalysis {
  const textoLower = texto.toLowerCase();
  const palavras = textoLower.split(/\s+/);
  
  let scorePositivo = 0;
  let scoreNegativo = 0;
  const palavrasEncontradas: string[] = [];

  // Analisar cada palavra
  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    const palavraAnterior = i > 0 ? palavras[i - 1] : '';

    // Verificar negação
    const temNegacao = NEGACOES.some(neg => 
      palavraAnterior.includes(neg) || palavra.includes(neg)
    );

    // Verificar intensificador
    const temIntensificador = INTENSIFICADORES.some(int => 
      palavraAnterior.includes(int)
    );
    const multiplicador = temIntensificador ? 1.5 : 1;

    // Verificar palavras positivas em todos os idiomas
    Object.entries(PALAVRAS_POSITIVAS).forEach(([lang, palavrasPos]) => {
      palavrasPos.forEach(palavraPos => {
        if (palavra.includes(palavraPos)) {
          const score = temNegacao ? -1 : 1;
          scorePositivo += score * multiplicador;
          palavrasEncontradas.push(temNegacao ? `não ${palavraPos}` : palavraPos);
        }
      });
    });

    // Verificar palavras negativas em todos os idiomas
    Object.entries(PALAVRAS_NEGATIVAS).forEach(([lang, palavrasNeg]) => {
      palavrasNeg.forEach(palavraNeg => {
        if (palavra.includes(palavraNeg)) {
          const score = temNegacao ? -1 : 1;
          scoreNegativo += score * multiplicador;
          palavrasEncontradas.push(temNegacao ? `não ${palavraNeg}` : palavraNeg);
        }
      });
    });
  }

  // Calcular sentimento baseado nos scores
  const totalScore = scorePositivo - scoreNegativo;
  const totalPalavras = scorePositivo + Math.abs(scoreNegativo);

  let sentimento: 'positivo' | 'neutro' | 'negativo';
  let confianca = 0;

  if (totalPalavras === 0) {
    // Sem palavras-chave identificadas
    return {
      sentimento: 'neutro',
      confianca: 0.3,
      palavrasChave: [],
    };
  }

  if (totalScore > 0) {
    sentimento = 'positivo';
    confianca = Math.min(0.9, 0.5 + (totalScore / totalPalavras) * 0.4);
  } else if (totalScore < 0) {
    sentimento = 'negativo';
    confianca = Math.min(0.9, 0.5 + (Math.abs(totalScore) / totalPalavras) * 0.4);
  } else {
    sentimento = 'neutro';
    confianca = 0.5;
  }

  return {
    sentimento,
    confianca,
    palavrasChave: [...new Set(palavrasEncontradas)].slice(0, 5),
  };
}

export function analisarTendenciaSentimento(
  reviews: Array<{ nota: number; dataPublicacao: Date; sentimento: string }>
): {
  tendencia: 'melhorando' | 'estavel' | 'piorando';
  variacao: number;
} {
  if (reviews.length < 2) {
    return { tendencia: 'estavel', variacao: 0 };
  }

  // Ordenar por data
  const reviewsOrdenadas = [...reviews].sort(
    (a, b) => a.dataPublicacao.getTime() - b.dataPublicacao.getTime()
  );

  // Dividir em duas metades
  const meio = Math.floor(reviewsOrdenadas.length / 2);
  const primeiraMetade = reviewsOrdenadas.slice(0, meio);
  const segundaMetade = reviewsOrdenadas.slice(meio);

  // Calcular média de notas
  const mediaPrimeira =
    primeiraMetade.reduce((acc, r) => acc + r.nota, 0) / primeiraMetade.length;
  const mediaSegunda =
    segundaMetade.reduce((acc, r) => acc + r.nota, 0) / segundaMetade.length;

  const variacao = mediaSegunda - mediaPrimeira;

  let tendencia: 'melhorando' | 'estavel' | 'piorando';
  if (variacao > 0.3) {
    tendencia = 'melhorando';
  } else if (variacao < -0.3) {
    tendencia = 'piorando';
  } else {
    tendencia = 'estavel';
  }

  return { tendencia, variacao };
}
