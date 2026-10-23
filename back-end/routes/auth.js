const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { HttpError } = require('../utils/erros');
const { autenticar } = require('../middlewares/auth');

const router = express.Router();

// CADASTRO: todo usuário novo entra como "leitor" (padrão do banco)
router.post('/api/auth/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string'
      || !nome.trim() || !email.trim() || !senha) {
    throw new HttpError(400, 'Informe nome, e-mail e senha.');
  }
  if (senha.length < 8) {
    throw new HttpError(400, 'A senha precisa ter pelo menos 8 caracteres.');
  }

  const hash = await bcrypt.hash(senha, 10);

  try {
    const [r] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome.trim(), email.trim().toLowerCase(), hash]
    );
    res.status(201).json({ id_usuario: r.insertId, nome: nome.trim() });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Este e-mail já está cadastrado.');
    }
    throw e;
  }
});

// LOGIN: confere a senha e devolve o token (crachá)
router.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
    throw new HttpError(400, 'Informe e-mail e senha.');
  }
  if (!process.env.JWT_SECRET) {
    throw new HttpError(500, 'Servidor sem JWT_SECRET configurado.');
  }

  const [linhas] = await pool.query(
    'SELECT id_usuario, nome, senha, perfil FROM usuarios WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  const usuario = linhas[0];

  const confere = usuario && await bcrypt.compare(senha, usuario.senha);
  if (!confere) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }

  // Estes 3 nomes (id_usuario, perfil, nome) são os que o middleware da Steffany lê
  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, perfil: usuario.perfil, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token, nome: usuario.nome, perfil: usuario.perfil });
});

// QUEM SOU EU: o front usa para saber o perfil de quem está logado
router.get('/api/auth/eu', autenticar, (req, res) => {
  res.json(req.usuario);
});

module.exports = router;