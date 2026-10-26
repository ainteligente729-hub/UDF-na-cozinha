// PARTE 7b: links de afiliados (cadastro, listagem e redirecionamento com contagem de cliques)
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { autenticar, autorizar } = require('../middlewares/auth');
const { HttpError } = require('../utils/erros');
const { exigirDonoOuAdmin } = require('../services/receitaService');

const urlValida = (u) => {
  try { return ['http:', 'https:'].includes(new URL(u).protocol) && String(u).length <= 1000; } catch { return false; }
};

function validar(b, { parcial }) {
  const erros = [];
  const c = {};
  if (!parcial || b.titulo !== undefined) {
    const t = String(b.titulo || '').trim();
    if (!t || t.length > 120) erros.push('titulo é obrigatório (máx. 120).'); else c.titulo = t;
  }
  if (!parcial || b.url !== undefined) {
    if (!urlValida(b.url)) erros.push('url deve ser um link http(s) válido.'); else c.url = b.url;
  }
  if (b.loja !== undefined) c.loja = b.loja ? String(b.loja).slice(0, 60) : null;
  if (b.imagem_url !== undefined) {
    if (b.imagem_url && !urlValida(b.imagem_url)) erros.push('imagem_url inválida.'); else c.imagem_url = b.imagem_url || null;
  }
  if (b.ativo !== undefined) c.ativo = b.ativo ? 1 : 0;
  if (b.id_ingredientes !== undefined) c.id_ingredientes = b.id_ingredientes ? Number(b.id_ingredientes) : null;
  if (erros.length) { const e = new HttpError(400, 'Dados inválidos.'); e.detalhes = erros; throw e; }
  return c;
}

// Públicos de uma receita (só ativos)
router.get('/api/receitas/:id/afiliados', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id_afiliado, id_ingredientes, titulo, loja, imagem_url FROM afiliados
      WHERE ativo = 1 AND (id_receita = ? OR id_receita IS NULL) ORDER BY id_afiliado`,
    [req.params.id]
  );
  res.json(rows.map((a) => ({ ...a, link: `/go/${a.id_afiliado}` })));
});

// Cadastro. Com id_receita: dono da receita ou admin. Sem id_receita (link global): só admin.
router.post('/api/afiliados', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  const c = validar(req.body || {}, { parcial: false });
  const idReceita = req.body.id_receita ? Number(req.body.id_receita) : null;
  if (idReceita) await exigirDonoOuAdmin(idReceita, req.usuario);
  else if (req.usuario.perfil !== 'admin') throw new HttpError(403, 'Apenas administradores criam links globais.');

  const [r] = await pool.query(
    `INSERT INTO afiliados (id_receita, id_ingredientes, titulo, loja, url, imagem_url, ativo, dt_cadastro)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [idReceita, c.id_ingredientes ?? null, c.titulo, c.loja ?? null, c.url, c.imagem_url ?? null, c.ativo ?? 1]
  );
  res.status(201).json({ id_afiliado: r.insertId, link: `/go/${r.insertId}` });
});

async function carregar(id, usuario) {
  const [rows] = await pool.query('SELECT * FROM afiliados WHERE id_afiliado = ?', [id]);
  if (!rows.length) throw new HttpError(404, 'Afiliado não encontrado.');
  if (rows[0].id_receita) await exigirDonoOuAdmin(rows[0].id_receita, usuario);
  else if (usuario.perfil !== 'admin') throw new HttpError(403, 'Apenas administradores alteram links globais.');
  return rows[0];
}

router.put('/api/afiliados/:id', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  await carregar(req.params.id, req.usuario);
  const c = validar(req.body || {}, { parcial: true });
  const chaves = Object.keys(c);
  if (!chaves.length) throw new HttpError(400, 'Nada para atualizar.');
  await pool.query(`UPDATE afiliados SET ${chaves.map((k) => `${k} = ?`).join(', ')} WHERE id_afiliado = ?`, [...chaves.map((k) => c[k]), req.params.id]);
  res.json({ ok: true });
});

router.delete('/api/afiliados/:id', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  await carregar(req.params.id, req.usuario);
  await pool.query('DELETE FROM afiliados WHERE id_afiliado = ?', [req.params.id]);
  res.status(204).end();
});

// Estatísticas (dono ou admin)
router.get('/api/receitas/:id/afiliados/estatisticas', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  await exigirDonoOuAdmin(req.params.id, req.usuario);
  const [rows] = await pool.query('SELECT id_afiliado, titulo, loja, cliques, ativo FROM afiliados WHERE id_receita = ? ORDER BY cliques DESC', [req.params.id]);
  res.json(rows);
});

// Redirecionamento rastreado: /go/12 -> loja do parceiro
router.get('/go/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT url FROM afiliados WHERE id_afiliado = ? AND ativo = 1', [req.params.id]);
  if (!rows.length) throw new HttpError(404, 'Link não encontrado.');
  await pool.query('UPDATE afiliados SET cliques = cliques + 1 WHERE id_afiliado = ?', [req.params.id]);
  res.set('X-Robots-Tag', 'noindex, nofollow').redirect(302, rows[0].url);
});

module.exports = router;
