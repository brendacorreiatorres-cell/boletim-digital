/* ============================================================
   BOLETIM DIGITAL — 8º ANO
   Dados fictícios para demonstração.
   ============================================================ */

/* ------------------------------------------------------------
   CONCEITO: ARRAY
   Um array é uma lista ordenada. Aqui é uma lista de OBJETOS,
   e cada objeto representa uma disciplina.
   CONCEITO: OBJETO
   Um objeto guarda vários valores juntos usando nomes (chaves).
   ------------------------------------------------------------ */
const dadosBrutos = [
  { disciplina: "Língua Portuguesa", tri1: 82,  tri2: "7,8", tri3: 85,  faltas: [2, 1, 1] },
  { disciplina: "Matemática",        tri1: 52,  tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências",          tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História",          tri1: 7.0, tri2: 84,  tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia",         tri1: 68,  tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa",    tri1: 86,  tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte",              tri1: 9.0, tri2: 92,  tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física",   tri1: 95,  tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital",  tri1: 88,  tri2: 9.1, tri3: 93,  faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado",  tri1: 8.0, tri2: 83,  tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62,  tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48,  tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

/* Frequência geral FICTÍCIA — apenas demonstrativa.
   No futuro, esse valor será tratado de outra forma (calculado
   a partir de dados reais de presença). */
const FREQUENCIA_DEMONSTRATIVA = 92;

/* Média mínima para "Bom desempenho" */
const MEDIA_MINIMA = 6.0;

/* ------------------------------------------------------------
   FUNÇÃO: normalizarNota(valor)
   Recebe um valor bruto e devolve a nota na escala 0–10,
   ou null se a nota ainda não foi lançada / é inválida.
   CONCEITO: IF (condicional) — toma decisões com base em testes.
   ------------------------------------------------------------ */
function normalizarNota(valor) {
  // Nota ausente
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for texto, troca vírgula por ponto (ex.: "7,8" vira "7.8")
  let numero = valor;
  if (typeof numero === "string") {
    numero = numero.replace(",", ".");
  }

  numero = Number(numero);

  // Se não for número válido, trata como ausente/inválido
  if (isNaN(numero)) {
    return null;
  }

  // Regra: 0 a 10 permanece igual
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Regra: maior que 10 e até 100 divide por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras → inválido
  return null;
}

/* ------------------------------------------------------------
   FUNÇÃO: formatarNota(nota)
   Mostra "—" quando não há nota, ou o número com 1 casa decimal.
   ------------------------------------------------------------ */
function formatarNota(nota) {
  if (nota === null) return "—";
  return nota.toFixed(1).replace(".", ",");
}

/* ------------------------------------------------------------
   FUNÇÃO: calcularMedia(notas)
   Recebe um array de notas (com possíveis null) e calcula
   a média apenas das notas válidas.
   ------------------------------------------------------------ */
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) return null;

  let soma = 0;
  // CONCEITO: FOR — repete um bloco para cada item do array
  for (let i = 0; i < validas.length; i++) {
    soma += validas[i];
  }
  return soma / validas.length;
}

/* ------------------------------------------------------------
   FUNÇÃO: definirSituacao(media)
   Retorna o texto da situação conforme a média.
   ------------------------------------------------------------ */
function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

/* ------------------------------------------------------------
   FUNÇÃO: somarFaltas(faltas)
   Soma os valores inteiros do array de faltas.
   ------------------------------------------------------------ */
function somarFaltas(faltas) {
  let total = 0;
  for (let i = 0; i < faltas.length; i++) {
    total += faltas[i];
  }
  return total;
}

/* ------------------------------------------------------------
   Aqui transformamos os dados brutos em dados "prontos",
   já normalizados e calculados.
   ------------------------------------------------------------ */
const disciplinas = dadosBrutos.map(function (item) {
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  const media = calcularMedia([n1, n2, n3]);
  const totalFaltas = somarFaltas(item.faltas);
  const situacao = definirSituacao(media);

  return {
    disciplina: item.disciplina,
    tri1: n1,
    tri2: n2,
    tri3: n3,
    media: media,
    faltas: totalFaltas,
    situacao: situacao
  };
});

/* ------------------------------------------------------------
   CONCEITO: DOM
   DOM é a representação da página HTML em forma de objetos.
   Usamos JavaScript para criar e inserir elementos na tela.
   ------------------------------------------------------------ */

/* ---------- 1. PREENCHER A TABELA ---------- */
const corpoTabela = document.getElementById("corpo-tabela");

// CONCEITO: FOREACH — percorre cada item do array
disciplinas.forEach(function (d) {
  const linha = document.createElement("tr");

  // Define uma classe conforme a situação, para colorir o texto
  let classeSituacao = "situacao-indisponivel";
  if (d.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (d.situacao === "Atenção") classeSituacao = "situacao-atencao";

  linha.innerHTML = `
    <td>${d.disciplina}</td>
    <td>${formatarNota(d.tri1)}</td>
    <td>${formatarNota(d.tri2)}</td>
    <td>${formatarNota(d.tri3)}</td>
    <td><strong>${formatarNota(d.media)}</strong></td>
    <td>${d.faltas}</td>
    <td class="${classeSituacao}">${d.situacao}</td>
  `;

  corpoTabela.appendChild(linha);
});

/* ---------- 2. CALCULAR OS CARDS DE RESUMO ---------- */

// Média geral: média das médias disponíveis
const mediasDisponiveis = disciplinas
  .map(function (d) { return d.media; })
  .filter(function (m) { return m !== null; });

const mediaGeral = calcularMedia(mediasDisponiveis);

// Total de faltas somando todas as disciplinas
let totalFaltasGeral = 0;
disciplinas.forEach(function (d) {
  totalFaltasGeral += d.faltas;
});

// Quantas disciplinas estão com bom desempenho
const qtdBom = disciplinas.filter(function (d) {
  return d.situacao === "Bom desempenho";
}).length;

// Quantas precisam de atenção
const qtdAtencao = disciplinas.filter(function (d) {
  return d.situacao === "Atenção";
}).length;

/* ---------- 3. MONTAR OS CARDS NA TELA ---------- */
const areaCards = document.getElementById("cards");

// Lista de cards que queremos exibir
const listaCards = [
  {
    titulo: "Média Geral",
    valor: mediaGeral !== null ? formatarNota(mediaGeral) : "—",
    extra: "Escala de 0 a 10"
  },
  {
    titulo: "Total de Faltas",
    valor: totalFaltasGeral,
    extra: "Somatório das disciplinas"
  },
  {
    titulo: "Bom Desempenho",
    valor: qtdBom,
    extra: "Disciplinas com média ≥ 6,0"
  },
  {
    titulo: "Precisam de Atenção",
    valor: qtdAtencao,
    extra: "Disciplinas com média < 6,0"
  },
  {
    titulo: "Frequência",
    valor: FREQUENCIA_DEMONSTRATIVA + "%",
    extra: "Frequência adequada"
  }
];

// Cria cada card e insere na área de cards
listaCards.forEach(function (c) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-titulo">${c.titulo}</div>
    <div class="card-valor">${c.valor}</div>
    <div class="card-extra">${c.extra}</div>
  `;
  areaCards.appendChild(card);
});