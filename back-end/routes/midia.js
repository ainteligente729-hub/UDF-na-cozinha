// PARTE 3: upload, otimização (WebP em 3 tamanhos) e gerenciamento de imagens
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../config/db');
const { autenticar, autorizar } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { HttpError } = require('../utils/erros');
const { otimizar } = require('../services/imagem');
const storage = require('../services/storage');
const { exigirDonoOuAdmin } = require('../services/receitaService');

const formatar = (i) => ({ ...i, principal: !!i.principal });

// Lista as imagens da receita
router.get('/api/receitas/:id/imagens', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id_imagem, url_grande, url_media, url_thumb, alt_text, largura, altura, principal
       FROM receita_imagens WHERE id_receita = ? ORDER BY principal DESC, id_imagem`,
    [req.params.id]
  );
  res.json(rows.map(formatar));
});

// POST /api/receitas/:id/imagens   (multipart/form-data)
//   campo de arquivo: "imagens" (até 10)   | campos opcionais: alt, principal=true
router.post('/api/receitas/:id/imagens', autenticar, autorizar('autor', 'admin'), upload.array('imagens', 10), async (req, res) => {
  const idReceita = Number(req.params.id);
  const receita = await exigirDonoOuAdmin(idReceita, req.usuario);
  if (!req.files?.length) throw new HttpError(400, 'Envie ao menos um arquivo no campo "imagens".');

  const [[{ qtd }]] = await pool.query('SELECT COUNT(*) AS qtd FROM receita_imagens WHERE id_receita = ?', [idReceita]);
  const marcarPrincipal = String(req.body.principal) === 'true' || (qtd === 0);
  const criadas = [];

  for (let n = 0; n < req.files.length; n++) {
    const arquivo = req.files[n];
    const { variantes, largura, altura } = await otimizar(arquivo.buffer);

    const base = `receitas/${idReceita}/${crypto.randomUUID()}`;
    const [urlGrande, urlMedia, urlThumb] = await Promise.all([
      storage.salvar(`${base}-grande`, variantes.grande),
      storage.salvar(`${base}-media`, variantes.media),
      storage.salvar(`${base}-thumb`, variantes.thumb),
    ]);

    const principal = marcarPrincipal && n === 0;
    if (principal) await pool.query('UPDATE receita_imagens SET principal = 0 WHERE id_receita = ?', [idReceita]);

    const [r] = await pool.query(
      `INSERT INTO receita_imagens
         (id_receita, url_grande, url_media, url_thumb, storage_key, alt_text, largura, altura, principal, dt_upload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [idReceita, urlGrande, urlMedia, urlThumb, base, (req.body.alt || '').slice(0, 200) || null, largura, altura, principal ? 1 : 0]
    );
    if (principal || (!receita.imagem_capa && n === 0)) {
      await pool.query('UPDATE receitas SET imagem_capa = ? WHERE id_receita = ?', [urlGrande, idReceita]);
      receita.imagem_capa = urlGrande;
    }
    criadas.push({
      id_imagem: r.insertId, url_grande: urlGrande, url_media: urlMedia, url_thumb: urlThumb,
      largura, altura, principal,
      tamanho_original_kb: Math.round(arquivo.size / 1024),
      tamanho_otimizado_kb: Math.round(variantes.grande.length / 1024),
    });
  }
  res.status(201).json(criadas);
});

async function carregarImagem(idImagem, usuario) {
  const [rows] = await pool.query('SELECT * FROM receita_imagens WHERE id_imagem = ?', [idImagem]);
  if (!rows.length) throw new HttpError(404, 'Imagem não encontrada.');
  await exigirDonoOuAdmin(rows[0].id_receita, usuario);
  return rows[0];
}

// Define a imagem de capa
router.patch('/api/imagens/:idImagem/principal', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  const img = await carregarImagem(req.params.idImagem, req.usuario);
  await pool.query('UPDATE receita_imagens SET principal = (id_imagem = ?) WHERE id_receita = ?', [img.id_imagem, img.id_receita]);
  await pool.query('UPDATE receitas SET imagem_capa = ? WHERE id_receita = ?', [img.url_grande, img.id_receita]);
  res.json({ ok: true, id_imagem: img.id_imagem });
});

// Edita o texto alternativo (acessibilidade e SEO)
router.patch('/api/imagens/:idImagem', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  const img = await carregarImagem(req.params.idImagem, req.usuario);
  await pool.query('UPDATE receita_imagens SET alt_text = ? WHERE id_imagem = ?', [String(req.body.alt || '').slice(0, 200) || null, img.id_imagem]);
  res.json({ ok: true });
});

router.delete('/api/imagens/:idImagem', autenticar, autorizar('autor', 'admin'), async (req, res) => {
  const img = await carregarImagem(req.params.idImagem, req.usuario);
  await pool.query('DELETE FROM receita_imagens WHERE id_imagem = ?', [img.id_imagem]);
  await storage.removerTodas(img.storage_key);

  if (img.principal) {
    const [prox] = await pool.query('SELECT id_imagem, url_grande FROM receita_imagens WHERE id_receita = ? ORDER BY id_imagem LIMIT 1', [img.id_receita]);
    if (prox.length) await pool.query('UPDATE receita_imagens SET principal = 1 WHERE id_imagem = ?', [prox[0].id_imagem]);
    await pool.query('UPDATE receitas SET imagem_capa = ? WHERE id_receita = ?', [prox[0]?.url_grande ?? null, img.id_receita]);
  }
  res.status(204).end();
});

module.exports = router;
