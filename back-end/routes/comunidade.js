const express = require('express');
const { pool } = require('../config/db');
const { HttpError } = require('../utils/erros');
const { autenticar, autenticarOpcional, autorizar } = require('../middlewares/auth');

const router = express.Router();

// ---------- funções de apoio ----------

function lerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido.');
  return id;
}

async function garantirReceita(id) {
  const [l] = await pool.query('SELECT id_receita FROM receitas WHERE id_receita = ?', [id]);
  if (l.length === 0) throw new HttpError(404, 'Receita não encontrada.');
}

// ---------- COMENTÁRIOS ----------

// Listar (público)
router.get('/api/receitas/:id/comentarios', async (req, res) => {
  const id = lerId(req.params.id);
  await garantirReceita(id);
  const [linhas] = await pool.query(
    `SELECT c.id_comentario, c.id_usuario, c.texto, c.dt_comentario, u.nome
       FROM comentarios c
       JOIN usuarios u ON u.id_usuario = c.id_usuario
      WHERE c.id_receita = ?
      ORDER BY c.dt_comentario DESC`,
    [id]
  );
  res.json(linhas);
});

// Comentar (logado)
router.post('/api/receitas/:id/comentarios', autenticar, async (req, res) => {
  const id = lerId(req.params.id);
  const texto = String(req.body.texto || '').trim();
  if (!texto) throw new HttpError(400, 'Escreva um comentário.');
  if (texto.length > 1000) throw new HttpError(400, 'Comentário muito longo (máximo 1000 caracteres).');
  await garantirReceita(id);

  const [r] = await pool.query(
    'INSERT INTO comentarios (id_receita, id_usuario, texto) VALUES (?, ?, ?)',
    [id, req.usuario.id_usuario, texto]
  );
  res.status(201).json({ id_comentario: r.insertId });
});

// Excluir: o dono do comentário ou o admin
router.delete('/api/comentarios/:id', autenticar, async (req, res) => {
  const id = lerId(req.params.id);
  const [l] = await pool.query(
    'SELECT id_usuario FROM comentarios WHERE id_comentario = ?', [id]
  );
  if (l.length === 0) throw new HttpError(404, 'Comentário não encontrado.');

  const ehDono = l[0].id_usuario === req.usuario.id_usuario;
  if (!ehDono && req.usuario.perfil !== 'admin') {
    throw new HttpError(403, 'Sem permissão para excluir este comentário.');
  }
  await pool.query('DELETE FROM comentarios WHERE id_comentario = ?', [id]);
  res.json({ mensagem: 'Comentário excluído.' });
});

// ---------- AVALIAÇÕES (notas de 1 a 5) ----------

// Avaliar ou mudar a própria nota (logado)
router.put('/api/receitas/:id/avaliacao', autenticar, async (req, res) => {
  const id = lerId(req.params.id);
  const nota = Number(req.body.nota);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    throw new HttpError(400, 'A nota deve ser um número inteiro de 1 a 5.');
  }
  await garantirReceita(id);

  await pool.query(
    `INSERT INTO avaliacoes (id_receita, id_usuario, nota)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE nota = VALUES(nota), dt_avaliacao = CURRENT_TIMESTAMP`,
    [id, req.usuario.id_usuario, nota]
  );
  res.json({ mensagem: 'Avaliação registrada.', nota });
});

// Média e total (público); se houver login, devolve também a nota da pessoa
router.get('/api/receitas/:id/avaliacoes', autenticarOpcional, async (req, res) => {
  const id = lerId(req.params.id);
  await garantirReceita(id);

  const [[resumo]] = await pool.query(
    `SELECT ROUND(AVG(nota), 1) AS media, COUNT(*) AS total
       FROM avaliacoes WHERE id_receita = ?`,
    [id]
  );

  let minhaNota = null;
  if (req.usuario) {
    const [m] = await pool.query(
      'SELECT nota FROM avaliacoes WHERE id_receita = ? AND id_usuario = ?',
      [id, req.usuario.id_usuario]
    );
    if (m.length > 0) minhaNota = m[0].nota;
  }

  res.json({
    media: resumo.media === null ? null : Number(resumo.media),
    total: resumo.total,
    minha_nota: minhaNota
  });
});

// ---------- FAVORITOS ----------

// Favoritar (logado). Repetir não dá erro.
router.post('/api/receitas/:id/favorito', autenticar, async (req, res) => {
  const id = lerId(req.params.id);
  await garantirReceita(id);
  await pool.query(
    'INSERT IGNORE INTO favoritos (id_receita, id_usuario) VALUES (?, ?)',
    [id, req.usuario.id_usuario]
  );
  res.status(201).json({ favoritado: true });
});

// Desfavoritar (logado)
router.delete('/api/receitas/:id/favorito', autenticar, async (req, res) => {
  const id = lerId(req.params.id);
  await pool.query(
    'DELETE FROM favoritos WHERE id_receita = ? AND id_usuario = ?',
    [id, req.usuario.id_usuario]
  );
  res.json({ favoritado: false });
});

// Meu livro de receitas (logado)
router.get('/api/favoritos', autenticar, async (req, res) => {
  const [linhas] = await pool.query(
    `SELECT r.id_receita, r.titulo, r.descricao, f.dt_fav
       FROM favoritos f
       JOIN receitas r ON r.id_receita = f.id_receita
      WHERE f.id_usuario = ?
      ORDER BY f.dt_fav DESC`,
    [req.usuario.id_usuario]
  );
  res.json(linhas);
});

// ---------- ADMIN ----------

router.get('/api/admin/usuarios', autenticar, autorizar('admin'), async (req, res) => {
  const [linhas] = await pool.query(
    'SELECT id_usuario, nome, email, perfil, dt_cadastro FROM usuarios ORDER BY nome'
  );
  res.json(linhas);
});

router.put('/api/admin/usuarios/:id/perfil', autenticar, autorizar('admin'), async (req, res) => {
  const id = lerId(req.params.id);
  const { perfil } = req.body;
  if (!['admin', 'autor', 'leitor'].includes(perfil)) {
    throw new HttpError(400, 'Perfil deve ser admin, autor ou leitor.');
  }
  if (id === req.usuario.id_usuario) {
    throw new HttpError(400, 'Você não pode alterar o seu próprio perfil.');
  }
  const [r] = await pool.query('UPDATE usuarios SET perfil = ? WHERE id_usuario = ?', [perfil, id]);
  if (r.affectedRows === 0) throw new HttpError(404, 'Usuário não encontrado.');
  res.json({ mensagem: 'Perfil atualizado.' });
});

module.exports = router;