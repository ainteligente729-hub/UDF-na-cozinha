// PARTE 7a: lista de compras inteligente (consolida ingredientes e soma quantidades)
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { autenticar } = require('../middlewares/auth');
const { HttpError } = require('../utils/erros');
const { normalizar, humanizar, formatarQuantidade } = require('../utils/unidades');

// itens: [{ id_receita, fator }]
async function consolidar(itens) {
  if (!itens.length) return { receitas: [], itens: [] };
  // a mesma receita pode aparecer mais de uma vez (ex.: fazer duas levas): os fatores se somam
  const fatores = new Map();
  for (const i of itens) fatores.set(i.id_receita, (fatores.get(i.id_receita) || 0) + i.fator);
  const ids = [...fatores.keys()];

  const [receitas] = await pool.query('SELECT id_receita, titulo, slug, rendimento FROM receitas WHERE id_receita IN (?)', [ids]);
  const [linhas] = await pool.query(
    `SELECT ri.id_receita, i.id_ingredientes, i.nome, ri.quantidade, ri.un_medida
       FROM receita_ingredientes ri JOIN ingredientes i ON i.id_ingredientes = ri.id_ingredientes
      WHERE ri.id_receita IN (?)`,
    [ids]
  );
  const tituloPor = new Map(receitas.map((r) => [r.id_receita, r.titulo]));

  // soma por ingrediente + unidade (kg e g viram g; l e ml viram ml)
  const mapa = new Map();
  for (const l of linhas) {
    const n = normalizar(Number(l.quantidade) * fatores.get(l.id_receita), l.un_medida);
    const k = `${l.id_ingredientes}|${n.un_medida.toLowerCase()}`;
    if (!mapa.has(k)) mapa.set(k, { id_ingredientes: l.id_ingredientes, nome: l.nome, total: 0, un_medida: n.un_medida, receitas: new Set() });
    const item = mapa.get(k);
    item.total += n.quantidade;
    item.receitas.add(tituloPor.get(l.id_receita));
  }

  const resultado = [...mapa.values()]
    .map((i) => {
      const h = humanizar(i.total, i.un_medida);
      return { id_ingredientes: i.id_ingredientes, nome: i.nome, quantidade: h.quantidade, un_medida: h.un_medida, receitas: [...i.receitas] };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return { receitas: receitas.map(({ id_receita, titulo, slug }) => ({ id_receita, titulo, slug })), itens: resultado };
}

function responder(req, res, dados) {
  if (req.query.formato === 'texto') {
    const linhas = dados.itens.map((i) => `[ ] ${formatarQuantidade(i.quantidade)} ${i.un_medida} de ${i.nome}`);
    return res.type('text/plain; charset=utf-8').send(`LISTA DE COMPRAS\n\n${linhas.join('\n')}\n`);
  }
  res.json({ total_itens: dados.itens.length, ...dados });
}

// GET /api/lista-compras  -> usa TODAS as receitas favoritadas do usuário logado
//     ?receitas=1,2,3  restringe a alguns favoritos   |   ?formato=texto
router.get('/api/lista-compras', autenticar, async (req, res) => {
  let sql = 'SELECT id_receita FROM favoritos WHERE id_usuario = ?';
  const params = [req.usuario.id_usuario];
  const filtro = String(req.query.receitas || '').split(',').filter(Boolean).map(Number).filter((n) => Number.isInteger(n) && n > 0);
  if (filtro.length) { sql += ' AND id_receita IN (?)'; params.push(filtro); }
  const [favs] = await pool.query(sql, params);
  responder(req, res, await consolidar(favs.map((f) => ({ id_receita: f.id_receita, fator: 1 }))));
});

// POST /api/lista-compras  { "receitas": [ { "id_receita": 3, "porcoes": 8 }, { "id_receita": 5 } ] }
//   Lista personalizada (qualquer receita, com porções ajustadas), sem depender dos favoritos.
router.post('/api/lista-compras', autenticar, async (req, res) => {
  const lista = req.body?.receitas;
  if (!Array.isArray(lista) || !lista.length) throw new HttpError(400, 'Envie "receitas": [{ id_receita, porcoes? }].');
  const ids = lista.map((i) => Number(i.id_receita));
  if (ids.some((n) => !Number.isInteger(n))) throw new HttpError(400, 'id_receita inválido.');

  const [rend] = await pool.query('SELECT id_receita, rendimento FROM receitas WHERE id_receita IN (?)', [ids]);
  const rendimentoPor = new Map(rend.map((r) => [r.id_receita, r.rendimento]));
  const itens = lista.map((i) => {
    const id = Number(i.id_receita);
    if (!rendimentoPor.has(id)) throw new HttpError(404, `Receita ${id} não encontrada.`);
    let fator = 1;
    if (i.porcoes !== undefined) {
      if (!rendimentoPor.get(id)) throw new HttpError(400, `Receita ${id} não tem rendimento cadastrado.`);
      fator = Number(i.porcoes) / rendimentoPor.get(id);
    }
    if (!Number.isFinite(fator) || fator <= 0 || fator > 100) throw new HttpError(400, `porcoes inválido para a receita ${id}.`);
    return { id_receita: id, fator };
  });
  responder(req, res, await consolidar(itens));
});

module.exports = router;
