const { HttpError } = require('./erros');

// Unidades que podem ser somadas entre si (kg + g, l + ml)
const CONVERSOES = {
  g: { base: 'g', f: 1 }, gr: { base: 'g', f: 1 }, grama: { base: 'g', f: 1 }, gramas: { base: 'g', f: 1 },
  kg: { base: 'g', f: 1000 }, quilo: { base: 'g', f: 1000 }, quilos: { base: 'g', f: 1000 },
  ml: { base: 'ml', f: 1 },
  l: { base: 'ml', f: 1000 }, litro: { base: 'ml', f: 1000 }, litros: { base: 'ml', f: 1000 },
};

const chave = (un) => String(un || '').trim().toLowerCase().replace(/\./g, '');
const arredondar = (n) => Math.round(n * 100) / 100;

// Converte para a unidade base (kg -> g, l -> ml). Outras unidades ficam como estão.
function normalizar(quantidade, un) {
  const c = CONVERSOES[chave(un)];
  if (!c) return { quantidade: Number(quantidade), un_medida: String(un || '').trim() };
  return { quantidade: Number(quantidade) * c.f, un_medida: c.base };
}

// 1500 g -> 1.5 kg, 2000 ml -> 2 l
function humanizar(quantidade, un) {
  const c = chave(un);
  if (c === 'g' && quantidade >= 1000) return { quantidade: arredondar(quantidade / 1000), un_medida: 'kg' };
  if (c === 'ml' && quantidade >= 1000) return { quantidade: arredondar(quantidade / 1000), un_medida: 'l' };
  return { quantidade: arredondar(quantidade), un_medida: un };
}

function formatarQuantidade(q) {
  return Number(q).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

// Fator = porções desejadas / rendimento original (ou multiplicador direto: 2 = dobrar)
function calcularFator(rendimento, { porcoes, multiplicador } = {}) {
  let fator = 1;
  if (multiplicador !== undefined && multiplicador !== '') {
    fator = Number(String(multiplicador).replace(',', '.'));
  } else if (porcoes !== undefined && porcoes !== '') {
    const p = Number(porcoes);
    if (!rendimento) throw new HttpError(400, 'Esta receita não tem rendimento cadastrado; use "multiplicador".');
    fator = p / rendimento;
  }
  if (!Number.isFinite(fator) || fator <= 0 || fator > 100) {
    throw new HttpError(400, 'Valor inválido para porções/multiplicador (use um número entre 0 e 100).');
  }
  return fator;
}

function escalarIngredientes(ingredientes, fator) {
  return ingredientes.map((i) => {
    const original = Number(i.quantidade);
    const novo = humanizar(original * fator, i.un_medida);
    return { ...i, quantidade_original: original, un_medida_original: i.un_medida, ...novo };
  });
}

module.exports = { normalizar, humanizar, formatarQuantidade, calcularFator, escalarIngredientes, arredondar };
