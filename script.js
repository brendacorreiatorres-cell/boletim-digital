/* ============================================================
   BOLETIM DIGITAL — 8º ANO B
   ============================================================ */

const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 6,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Dados locais legados / fictícios do aluno (utilizados quando novo: true ou dados: null)
const dadosBrutosLocais = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

const FREQUENCIA_DEMONSTRATIVA = 92;
const MEDIA_MINIMA = 6.0;

// Estado em memória da sessão
let pinSessao = "";
let disciplinasAtuais = [];
let emEdicao = false;

// Elementos do DOM
const areaLogin = document.getElementById("area-login");
const areaBoletim = document.getElementById("area-boletim");
const formLogin = document.getElementById("form-login");
const campoPin = document.getElementById("campo-pin");
const msgLogin = document.getElementById("msg-login");
const msgBoletim = document.getElementById("msg-boletim");

const btnAlterar = document.getElementById("btn-alterar");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");

/* ------------------------------------------------------------
   FUNÇÕES DE NORMALIZAÇÃO E CÁLCULO
   ------------------------------------------------------------ */
function normalizarNotaAntiga(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  let numero = valor;
  if (typeof numero === "string") {
    numero = numero.replace(",", ".");
  }
  numero = Number(numero);
  if (isNaN(numero)) return null;

  if (numero >= 0 && numero <= 10) return numero;
  if (numero > 10 && numero <= 100) return numero / 10;
  return null;
}

function formatarNota(nota) {
  if (nota === null || nota === undefined) return "—";
  return Number(nota).toFixed(1).replace(".", ",");
}

function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null && n !== undefined;
  });
  if (validas.length === 0) return null;

  let soma = 0;
  for (let i = 0; i < validas.length; i++) {
    soma += validas[i];
  }
  return soma / validas.length;
}

function definirSituacao(media) {
  if (media === null || media === undefined) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

function somarFaltas(faltas) {
  if (Array.isArray(faltas)) {
    let total = 0;
    for (let i = 0; i < faltas.length; i++) {
      total += (Number(faltas[i]) || 0);
    }
    return total;
  }
  if (typeof faltas === "number") return faltas;
  return 0;
}

/* ------------------------------------------------------------
   PROCESSAMENTO DOS DADOS (API vs LOCAIS)
   ------------------------------------------------------------ */
function prepararDadosIniciais(dadosBrutos) {
  return dadosBrutos.map(function (item) {
    const n1 = normalizarNotaAntiga(item.tri1);
    const n2 = normalizarNotaAntiga(item.tri2);
    const n3 = normalizarNotaAntiga(item.tri3);

    const faltasArray = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltas = somarFaltas(faltasArray);
    const media = calcularMedia([n1, n2, n3]);
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      faltasTri1: faltasArray[0] !== undefined ? faltasArray[0] : 0,
      faltasTri2: faltasArray[1] !== undefined ? faltasArray[1] : 0,
      faltasTri3: faltasArray[2] !== undefined ? faltasArray[2] : 0,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    };
  });
}

function prepararDadosAPI(listaDisciplinasAPI) {
  return listaDisciplinasAPI.map(function (item) {
    const n1 = item.tri1 !== undefined ? item.tri1 : null;
    const n2 = item.tri2 !== undefined ? item.tri2 : null;
    const n3 = item.tri3 !== undefined ? item.tri3 : null;

    let f1 = 0, f2 = 0, f3 = 0, totalFaltas = 0;

    if (Array.isArray(item.faltas)) {
      f1 = item.faltas[0] || 0;
      f2 = item.faltas[1] || 0;
      f3 = item.faltas[2] || 0;
      totalFaltas = f1 + f2 + f3;
    } else if (item.faltas && typeof item.faltas === "object") {
      f1 = item.faltas.tri1 || 0;
      f2 = item.faltas.tri2 || 0;
      f3 = item.faltas.tri3 || 0;
      totalFaltas = f1 + f2 + f3;
    } else if (typeof item.faltas === "number") {
      totalFaltas = item.faltas;
    }

    const media = calcularMedia([n1, n2, n3]);
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      faltasTri1: f1,
      faltasTri2: f2,
      faltasTri3: f3,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    };
  });
}

/* ------------------------------------------------------------
   RENDERIZAÇÃO SEGURA DO DOM (TABELA E CARDS)
   ------------------------------------------------------------ */
function renderizarTabela() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  disciplinasAtuais.forEach(function (d, index) {
    const linha = document.createElement("tr");

    let classeSituacao = "situacao-indisponivel";
    if (d.situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    if (d.situacao === "Atenção") classeSituacao = "situacao-atencao";

    if (emEdicao) {
      linha.innerHTML = `
        <td class="col-disciplina"></td>
        <td><input type="text" class="input-edicao" data-idx="${index}" data-campo="tri1" value="${d.tri1 !== null ? d.tri1 : ""}"></td>
        <td><input type="text" class="input-edicao" data-idx="${index}" data-campo="tri2" value="${d.tri2 !== null ? d.tri2 : ""}"></td>
        <td><input type="text" class="input-edicao" data-idx="${index}" data-campo="tri3" value="${d.tri3 !== null ? d.tri3 : ""}"></td>
        <td><strong>${formatarNota(d.media)}</strong></td>
        <td>
          <input type="text" class="input-edicao" data-idx="${index}" data-campo="f1" value="${d.faltasTri1}" title="Faltas 1º Tri">
          <input type="text" class="input-edicao" data-idx="${index}" data-campo="f2" value="${d.faltasTri2}" title="Faltas 2º Tri">
          <input type="text" class="input-edicao" data-idx="${index}" data-campo="f3" value="${d.faltasTri3}" title="Faltas 3º Tri">
        </td>
        <td class="${classeSituacao}">${d.situacao}</td>
      `;
      linha.querySelector(".col-disciplina").textContent = d.disciplina;
    } else {
      linha.innerHTML = `
        <td class="col-disciplina"></td>
        <td>${formatarNota(d.tri1)}</td>
        <td>${formatarNota(d.tri2)}</td>
        <td>${formatarNota(d.tri3)}</td>
        <td><strong>${formatarNota(d.media)}</strong></td>
        <td>${d.faltas}</td>
        <td class="${classeSituacao}">${d.situacao}</td>
      `;
      linha.querySelector(".col-disciplina").textContent = d.disciplina;
    }

    corpoTabela.appendChild(linha);
  });
}

function renderizarCards() {
  const areaCards = document.getElementById("cards");
  areaCards.innerHTML = "";

  const mediasDisponiveis = disciplinasAtuais
    .map(function (d) { return d.media; })
    .filter(function (m) { return m !== null && m !== undefined; });

  const mediaGeral = calcularMedia(mediasDisponiveis);

  let totalFaltasGeral = 0;
  disciplinasAtuais.forEach(function (d) {
    totalFaltasGeral += d.faltas;
  });

  const qtdBom = disciplinasAtuais.filter(function (d) {
    return d.situacao === "Bom desempenho";
  }).length;

  const qtdAtencao = disciplinasAtuais.filter(function (d) {
    return d.situacao === "Atenção";
  }).length;

  const listaCards = [
    { titulo: "Média Geral", valor: mediaGeral !== null ? formatarNota(mediaGeral) : "—", extra: "Escala de 0 a 10" },
    { titulo: "Total de Faltas", valor: totalFaltasGeral, extra: "Somatório das disciplinas" },
    { titulo: "Bom Desempenho", valor: qtdBom, extra: "Disciplinas com média ≥ 6,0" },
    { titulo: "Precisam de Atenção", valor: qtdAtencao, extra: "Disciplinas com média < 6,0" },
    { titulo: "Frequência", valor: FREQUENCIA_DEMONSTRATIVA + "%", extra: "Frequência adequada" }
  ];

  listaCards.forEach(function (c) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-titulo"></div>
      <div class="card-valor"></div>
      <div class="card-extra"></div>
    `;
    card.querySelector(".card-titulo").textContent = c.titulo;
    card.querySelector(".card-valor").textContent = String(c.valor);
    card.querySelector(".card-extra").textContent = c.extra;
    areaCards.appendChild(card);
  });
}

function atualizarTela() {
  renderizarTabela();
  renderizarCards();
}

/* ------------------------------------------------------------
   AUTENTICAÇÃO E CONEXÃO COM A API (ABRIR)
   ------------------------------------------------------------ */
formLogin.addEventListener("submit", function (e) {
  e.preventDefault();
  const pinDigitado = campoPin.value.trim();
  if (!pinDigitado) return;

  msgLogin.className = "mensagem-status";
  msgLogin.textContent = "Conectando...";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinDigitado
    })
  })
    .then(function (res) {
      if (res.status === 401) {
        throw new Error("Turma, chamada ou PIN inválidos.");
      }
      if (res.status === 429) {
        throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
      }
      if (!res.ok) {
        throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
      }
      return res.json();
    })
    .then(function (resposta) {
      pinSessao = pinDigitado;
      campoPin.value = "";
      msgLogin.textContent = "";

      if (resposta.dados && Array.isArray(resposta.dados.disciplinas) && resposta.dados.disciplinas.length > 0) {
        disciplinasAtuais = prepararDadosAPI(resposta.dados.disciplinas);
      } else {
        disciplinasAtuais = prepararDadosIniciais(dadosBrutosLocais);
      }

      areaLogin.style.display = "none";
      areaBoletim.style.display = "block";
      atualizarTela();
    })
    .catch(function (erro) {
      msgLogin.className = "mensagem-status erro";
      msgLogin.textContent = erro.message || "Não foi possível conectar ao servidor. Tente novamente.";
    });
});

/* ------------------------------------------------------------
   MODO DE EDIÇÃO E VALIDAÇÕES
   ------------------------------------------------------------ */
btnAlterar.addEventListener("click", function () {
  emEdicao = true;
  btnAlterar.style.display = "none";
  btnSalvar.style.display = "inline-block";
  btnCancelar.style.display = "inline-block";
  msgBoletim.textContent = "";
  atualizarTela();
});

btnCancelar.addEventListener("click", function () {
  emEdicao = false;
  btnAlterar.style.display = "inline-block";
  btnSalvar.style.display = "none";
  btnCancelar.style.display = "none";
  msgBoletim.textContent = "";
  atualizarTela();
});

function validarNotaInput(strVal) {
  const limpo = strVal.trim();
  if (limpo === "") return { valido: true, valor: null };

  const normalizado = limpo.replace(",", ".");
  const num = Number(normalizado);

  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false, valor: null };
  }
  return { valido: true, valor: num };
}

function validarFaltaInput(strVal) {
  const limpo = strVal.trim();
  if (limpo === "") return { valido: false, valor: null };

  const num = Number(limpo);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { valido: false, valor: null };
  }
  return { valido: true, valor: num };
}

/* ------------------------------------------------------------
   SALVAMENTO NA API
   ------------------------------------------------------------ */
btnSalvar.addEventListener("click", function () {
  const inputs = document.querySelectorAll(".input-edicao");
  let possuiErro = false;

  inputs.forEach(function (input) {
    input.classList.remove("invalido");
  });

  const novasDisciplinas = JSON.parse(JSON.stringify(disciplinasAtuais));

  inputs.forEach(function (input) {
    const idx = parseInt(input.getAttribute("data-idx"), 10);
    const campo = input.getAttribute("data-campo");
    const val = input.value;

    if (campo === "tri1" || campo === "tri2" || campo === "tri3") {
      const res = validarNotaInput(val);
      if (!res.valido) {
        input.classList.add("invalido");
        possuiErro = true;
      } else {
        novasDisciplinas[idx][campo] = res.valor;
      }
    } else if (campo === "f1" || campo === "f2" || campo === "f3") {
      const res = validarFaltaInput(val);
      if (!res.valido) {
        input.classList.add("invalido");
        possuiErro = true;
      } else {
        if (campo === "f1") novasDisciplinas[idx].faltasTri1 = res.valor;
        if (campo === "f2") novasDisciplinas[idx].faltasTri2 = res.valor;
        if (campo === "f3") novasDisciplinas[idx].faltasTri3 = res.valor;
      }
    }
  });

  if (possuiErro) {
    msgBoletim.className = "mensagem-status erro";
    msgBoletim.textContent = "Verifique os campos destacados em vermelho.";
    return;
  }

  const payloadDisciplinas = novasDisciplinas.map(function (d) {
    return {
      disciplina: d.disciplina,
      tri1: d.tri1,
      tri2: d.tri2,
      tri3: d.tri3,
      faltas: [d.faltasTri1, d.faltasTri2, d.faltasTri3]
    };
  });

  msgBoletim.className = "mensagem-status";
  msgBoletim.textContent = "Salvando...";

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinSessao,
      dados: {
        disciplinas: payloadDisciplinas
      }
    })
  })
    .then(function (res) {
      if (!res.ok) {
        throw new Error("Erro ao salvar dados no servidor.");
      }
      return res.json();
    })
    .then(function () {
      disciplinasAtuais = prepararDadosAPI(payloadDisciplinas);

      emEdicao = false;
      btnAlterar.style.display = "inline-block";
      btnSalvar.style.display = "none";
      btnCancelar.style.display = "none";

      msgBoletim.className = "mensagem-status sucesso";
      msgBoletim.textContent = "Dados salvos com sucesso.";

      atualizarTela();
    })
    .catch(function (erro) {
      msgBoletim.className = "mensagem-status erro";
      msgBoletim.textContent = erro.message || "Erro ao salvar dados no servidor.";
    });
});