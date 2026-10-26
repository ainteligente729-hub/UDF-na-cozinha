// PARTE 2: busca avançada, conversor de porções e CRUD (CMS) de receitas
const express = require('express');
const router = express.Router();
const { pool, comTransacao } = require('../config/db');
const { autenticar, autorizar } = require('../middlewares/auth');
const { HttpError } = require('../utils/erros');
const { slugUnico } = require('../utils/slug');
const { calcularFator, escalarIngredientes } = require('../utils/unidades');
const { buscarCompleta, exigirDonoOuAdmin } = require('../services/receitaService');
const storage = require('../services/storage');

const DIFICULDADES = ['facil', 'medio', 'dificil'];
const lista = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const inteiro = (v) => (v !== undefined && v !== '' && Number.isInteger(Number(v)) ? Number(v) : null);

// ------------------------------------------------------------------ filtros
router.get('/api/filtros', async (req, res) => {
  const [categorias] = await pool.query('SELECT id_categoria, nome, descricao FROM categorias ORDER BY nome');
  const [tags] = await pool.query('SELECT id_tags, nome FROM tags ORDER BY nome');
  res.json({ categorias, tags, dificuldades: DIFICULDADES });
});

// ------------------------------------------------------------------ busca avançada
// GET /api/receitas/busca?q=bolo&categoria=2&tag=vegano,rapido&tempo_max=45&dificuldade=facil
//     &nota_min=4&ingredientes=frango,batata&modo=todos&sem_ingredientes=leite
//     &ordem=nota&pagina=1&limite=12
async function buscar(req, res) {
  const q = req.query;
  const where = [];
  const params = [];

  if (q.q) {
    const like = `%${q.q}%`;
    where.push(`(r.titulo LIKE ? OR r.\`descrição\` LIKE ? OR EXISTS (
      SELECT 1 FROM receita_ingredientes ri JOIN ingredientes i ON i.id_ingredientes = ri.id_ingredientes
       WHERE ri.id_receita = r.id_receita AND i.nome LIKE ?))`);
    params.push(like, like, like);
  }

  if (q.categoria) {
    if (inteiro(q.categoria) !== null) { where.push('r.id_categoria = ?'); params.push(Number(q.categoria)); }
    else { where.push('c.nome = ?'); params.push(q.categoria); }
  }

  // todas as tags informadas precisam estar na receita
  for (const tag of lista(q.tag)) {
    where.push(`EXISTS (SELECT 1 FROM receita_tags rt JOIN tags t ON t.id_tags = rt.id_tags
                         WHERE rt.id_receita = r.id_receita AND ${inteiro(tag) !== null ? 't.id_tags = ?' : 't.nome = ?'})`);
    params.push(inteiro(tag) !== null ? Number(tag) : tag);
  }

  if (q.tempo_max !== undefined) {
    if (inteiro(q.tempo_max) === null) throw new HttpError(400, 'tempo_max deve ser um número inteiro (minutos).');
    where.push('(COALESCE(r.tp_prep, 0) + COALESCE(r.tp_cozi, 0)) <= ?');
    params.push(Number(q.tempo_max));
  }

  if (q.dificuldade) {
    if (!DIFICULDADES.includes(q.dificuldade)) throw new HttpError(400, `dificuldade deve ser: ${DIFICULDADES.join(', ')}.`);
    where.push('r.dificuldade = ?');
    params.push(q.dificuldade);
  }

  if (q.nota_min !== undefined) {
    const n = Number(q.nota_min);
    if (!(n >= 1 && n <= 5)) throw new HttpError(400, 'nota_min deve estar entre 1 e 5.');
    where.push('(SELECT AVG(a.nota) FROM avaliacoes a WHERE a.id_receita = r.id_receita) >= ?');
    params.push(n);
  }

  // "o que fazer com frango e batata": modo=todos (padrão) exige todos; modo=qualquer exige pelo menos um
  const ings = lista(q.ingredientes);
  if (ings.length) {
    const existe = `EXISTS (SELECT 1 FROM receita_ingredientes ri JOIN ingredientes i ON i.id_ingredientes = ri.id_ingredientes
                             WHERE ri.id_receita = r.id_receita AND i.nome LIKE ?)`;
    const juntar = q.modo === 'qualquer' ? ' OR ' : ' AND ';
    where.push('(' + ings.map(() => existe).join(juntar) + ')');
    ings.forEach((i) => params.push(`%${i}%`));
  }

  // exclusão (alergias / restrições)
  for (const ing of lista(q.sem_ingredientes)) {
    where.push(`NOT EXISTS (SELECT 1 FROM receita_ingredientes ri JOIN ingredientes i ON i.id_ingredientes = ri.id_ingredientes
                             WHERE ri.id_receita = r.id_receita AND i.nome LIKE ?)`);
    params.push(`%${ing}%`);
  }

  const ORDENS = {
    recentes: 'r.dt_publicacao DESC',
    antigas: 'r.dt_publicacao ASC',
    nota: 'nota_media DESC, total_avaliacoes DESC',
    tempo: '(COALESCE(r.tp_prep, 0) + COALESCE(r.tp_cozi, 0)) ASC',
    titulo: 'r.titulo ASC',
  };
  const ordem = ORDENS[q.ordem] || ORDENS.recentes;

  const limite = Math.min(Math.max(inteiro(q.limite) || 12, 1), 50);
  const pagina = Math.max(inteiro(q.pagina) || 1, 1);
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM receitas r JOIN categorias c ON c.id_categoria = r.id_categoria ${whereSql}`,
    params
  );

  const [itens] = await pool.query(
    `SELECT r.id_receita, r.titulo, r.slug, r.\`descrição\` AS descricao, r.tp_prep, r.tp_cozi,
            (COALESCE(r.tp_prep, 0) + COALESCE(r.tp_cozi, 0)) AS tempo_total,
            r.rendimento, r.calorias, r.dificuldade, r.dt_publicacao, r.imagem_capa,
            c.id_categoria, c.nome AS categoria, u.nome AS autor,
            (SELECT ROUND(AVG(a.nota), 2) FROM avaliacoes a WHERE a.id_receita = r.id_receita) AS nota_media,
            (SELECT COUNT(*) FROM avaliacoes a WHERE a.id_receita = r.id_receita) AS total_avaliacoes
       FROM receitas r
       JOIN categorias c ON c.id_categoria = r.id_categoria
       JOIN usuarios u   ON u.id_usuario = r.id_usuario
       ${whereSql}
      ORDER BY ${ordem}, r.id_receita DESC
      LIMIT ? OFFSET ?`,
    [...params, limite, (pagina - 1) * limite]
  );

  res.json({
    pagina,
    limite,
    total,
    total_paginas: Math.ceil(total / limite),
    resultados: itens.map((i) => ({
      ...i,
      nota_media: i.nota_media === null ? null : Number(i.nota_media),
      total_avaliacoes: Number(i.total_avaliacoes),
    })),
  });
}
router.get('/api/receitas/busca', buscar);
router.get('/api/receitas', buscar);

// ------------------------------------------------------------------ detalhe + conversor de porções
// GET /api/receitas/:ref?porcoes=8   ou   ?multiplicador=2   (ref = id ou slug)
router.get('/api/receitas/:ref', async (req, res) => {
  const receita = await buscarCompleta(req.params.ref);
  if (!receita) throw new HttpError(404, 'Receita não encontrada.');
  const { porcoes, multiplicador } = req.query;
  if (porcoes !== undefined || multiplicador !== undefined) {
    const fator = calcularFator(receita.rendimento, { porcoes, multiplicador });
    receita.ingredientes = escalarIngredientes(receita.ingredientes, fator);
    receita.rendimento_original = receita.rendimento;
    receita.rendimento = receita.rendimento ? Math.round(receita.rendimento * fator * 100) / 100 : null;
    receita.fator = Math.round(fator * 10000) / 10000;
  }
  res.json(receita);
});

// Atalho dedicado só ao conversor (resposta enxuta)
router.get('/api/receitas/:ref/porcoes', async (req, res) => {
  const receita = await buscarCompleta(req.params.ref);
  if (!receita) throw new HttpError(404, 'Receita não encontrada.');
  const { porcoes, multiplicador } = req.query;
  if (porcoes === undefined && multiplicador === undefined) {
    throw new HttpError(400, 'Informe ?porcoes=N ou ?multiplicador=N.');
  }
  const fator = calcularFator(receita.rendimento, { porcoes, multiplicador });
  res.json({
    id_receita: receita.id_receita,
    titulo: receita.titulo,
    rendimento_original: receita.rendimento,
    rendimento: receita.rendimento ? Math.round(receita.rendimento * fator * 100) / 100 : null,
    fator: Math.round(fator * 10000) / 10000,
    ingredientes: escalarIngredientes(receita.ingredientes, fator),
  });
});

// ------------------------------------------------------------------ validação do corpo
function validar(body, { parcial }) {
  const erros = [];
  const campos = {};
  const tem = (k) => body[k] !== undefined;

  const inteiroPos = (k, min = 0, max = 100000) => {
    if (!tem(k) || body[k] === null) return;
    const n = Number(body[k]);
    if (!Number.isInteger(n) || n < min || n > max) erros.push(`${k} deve ser inteiro entre ${min} e ${max}.`);
    else campos[k] = n;
  };

  if (!parcial || tem('titulo')) {
    const t = String(body.titulo || '').trim();
    if (!t || t.length > 60) erros.push('titulo é obrigatório (máximo 60 caracteres).');
    else campos.titulo = t;
  }
  if (!parcial || tem('id_categoria')) {
    const n = Number(body.id_categoria);
    if (!Number.isInteger(n) || n <= 0) erros.push('id_categoria é obrigatório.');
    else campos.id_categoria = n;
  }
  if (!parcial || tem('dificuldade')) {
    if (!DIFICULDADES.includes(body.dificuldade)) erros.push(`dificuldade deve ser: ${DIFICULDADES.join(', ')}.`);
    else campos.dificuldade = body.dificuldade;
  }
  if (tem('descricao')) campos.descricao = body.descricao === null ? null : String(body.descricao).trim();
  inteiroPos('tp_prep', 0, 10000);
  inteiroPos('tp_cozi', 0, 10000);
  inteiroPos('rendimento', 1, 1000);
  inteiroPos('calorias', 0, 100000);
  if (tem('video_url')) {
    if (body.video_url === null || body.video_url === '') campos.video_url = null;
    else if (!/^https?:\/\/\S+$/i.test(body.video_url) || body.video_url.length > 500) erros.push('video_url deve ser um link http(s) válido.');
    else campos.video_url = body.video_url;
  }

  const filhos = {};

  if (!parcial || tem('ingredientes')) {
    if (!Array.isArray(body.ingredientes) || !body.ingredientes.length) erros.push('ingredientes deve ser uma lista com pelo menos 1 item.');
    else {
      filhos.ingredientes = body.ingredientes.map((i, n) => {
        const nome = String(i?.nome || '').trim();
        const quantidade = Number(i?.quantidade);
        const un = String(i?.un_medida || '').trim();
        if (!nome || nome.length > 100) erros.push(`ingredientes[${n}].nome é obrigatório (máx. 100).`);
        if (!Number.isFinite(quantidade) || quantidade < 0 || quantidade > 999999.99) erros.push(`ingredientes[${n}].quantidade inválida.`);
        if (!un || un.length > 30) erros.push(`ingredientes[${n}].un_medida é obrigatória (máx. 30).`);
        return { nome, quantidade, un_medida: un };
      });
    }
  }

  if (!parcial || tem('passos')) {
    if (!Array.isArray(body.passos) || !body.passos.length) erros.push('passos deve ser uma lista com pelo menos 1 passo.');
    else {
      filhos.passos = body.passos.map((p, n) => {
        const texto = String(typeof p === 'string' ? p : p?.desc_passo || p?.descricao || '').trim();
        if (!texto) erros.push(`passos[${n}] está vazio.`);
        return texto;
      });
    }
  }

  if (tem('tags')) {
    if (!Array.isArray(body.tags)) erros.push('tags deve ser uma lista de nomes.');
    else {
      filhos.tags = [...new Set(body.tags.map((t) => String(t).trim()).filter(Boolean))];
      if (filhos.tags.some((t) => t.length > 50)) erros.push('Cada tag deve ter no máximo 50 caracteres.');
    }
  }

  if (erros.length) {
    const e = new HttpError(400, 'Dados inválidos.');
    e.detalhes = erros;
    throw e;
  }
  return { campos, filhos };
}

async function obterOuCriar(conn, tabela, pk, nome) {
  const [r] = await conn.query(`SELECT ${pk} AS id FROM ${tabela} WHERE nome = ?`, [nome]);
  if (r.length) return r[0].id;
  const [ins] = await conn.query(`INSERT INTO ${tabela} (nome) VALUES (?)`, [nome]);
  return ins.insertId;
}

async function salvarFilhos(conn, idReceita, { ingredientes, passos, tags }) {
  if (ingredientes) {
    await conn.query('DELETE FROM receita_ingredientes WHERE id_receita = ?', [idReceita]);
    const usados = new Set();
    let ordem = 0;
    for (const ing of ingredientes) {
      const idIng = await obterOuCriar(conn, 'ingredientes', 'id_ingredientes', ing.nome);
      if (usados.has(idIng)) throw new HttpError(400, `Ingrediente repetido na receita: ${ing.nome}.`);
      usados.add(idIng);
      await conn.query(
        'INSERT INTO receita_ingredientes (id_receita, id_ingredientes, quantidade, un_medida, ordem) VALUES (?, ?, ?, ?, ?)',
        [idReceita, idIng, ing.quantidade, ing.un_medida, ordem++]
      );
    }
  }
  if (passos) {
    await conn.query('DELETE FROM modo_preparo WHERE id_receita = ?', [idReceita]);
    for (let i = 0; i < passos.length; i++) {
      await conn.query('INSERT INTO modo_preparo (id_receita, ordem, desc_passo) VALUES (?, ?, ?)', [idReceita, i + 1, passos[i]]);
    }
  }
  if (tags) {
    await conn.query('DELETE FROM receita_tags WHERE id_receita = ?', [idReceita]);
    for (const nome of tags) {
      const idTag = await obterOuCriar(conn, 'tags', 'id_tags', nome);
      await conn.query('INSERT IGNORE INTO receita_tags (id_tags, id_receita) VALUES (?, ?)', [idTag, idReceita]);
    }
  }
}

// ------------------------------------------------------------------ criar
router.post('/api/receitas', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  const { campos, filhos } = validar(req.body || {}, { parcial: false });

  const id = await comTransacao(async (conn) => {
    const slug = await slugUnico(conn, campos.titulo);
    const [r] = await conn.query(
      `INSERT INTO receitas
         (id_usuario, id_categoria, titulo, slug, \`descrição\`, tp_prep, tp_cozi, rendimento, calorias,
          dificuldade, video_url, dt_publicacao, dt_atualizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [req.usuario.id_usuario, campos.id_categoria, campos.titulo, slug, campos.descricao ?? null,
       campos.tp_prep ?? null, campos.tp_cozi ?? null, campos.rendimento ?? null, campos.calorias ?? null,
       campos.dificuldade, campos.video_url ?? null]
    );
    await salvarFilhos(conn, r.insertId, filhos);
    return r.insertId;
  });

  res.status(201).location(`/api/receitas/${id}`).json(await buscarCompleta(id));
});

// ------------------------------------------------------------------ editar (dono ou admin)
router.put('/api/receitas/:id', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  const id = Number(req.params.id);
  await exigirDonoOuAdmin(id, req.usuario);
  const { campos, filhos } = validar(req.body || {}, { parcial: true });

  const COLUNAS = {
    titulo: 'titulo', id_categoria: 'id_categoria', descricao: '`descrição`', tp_prep: 'tp_prep', tp_cozi: 'tp_cozi',
    rendimento: 'rendimento', calorias: 'calorias', dificuldade: 'dificuldade', video_url: 'video_url',
  };
  const sets = Object.keys(campos).map((k) => `${COLUNAS[k]} = ?`);
  const valores = Object.keys(campos).map((k) => campos[k]);

  await comTransacao(async (conn) => {
    await conn.query(`UPDATE receitas SET ${[...sets, 'dt_atualizacao = NOW()'].join(', ')} WHERE id_receita = ?`, [...valores, id]);
    await salvarFilhos(conn, id, filhos);
  });

  res.json(await buscarCompleta(id));
});

// ------------------------------------------------------------------ excluir (dono ou admin)
router.delete('/api/receitas/:id', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  const id = Number(req.params.id);
  await exigirDonoOuAdmin(id, req.usuario);
  const [imagens] = await pool.query('SELECT storage_key FROM receita_imagens WHERE id_receita = ?', [id]);
  await pool.query('DELETE FROM receitas WHERE id_receita = ?', [id]); // cascade limpa o restante
  await Promise.all(imagens.map((i) => storage.removerTodas(i.storage_key)));
  res.status(204).end();
});

module.exports = router;
