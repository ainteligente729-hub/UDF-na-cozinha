// ATENÇÃO: versão mínima para o backend funcionar de ponta a ponta.
// A parte 4 (autenticação/JWT) é da sua colega. Se ela já tem um middleware,
// basta trocar o require nas rotas, desde que ele preencha req.usuario = { id_usuario, perfil }.
const jwt = require('jsonwebtoken');
const { HttpError } = require('../utils/erros');

function lerToken(req) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  return tipo === 'Bearer' ? token : null;
}

function decodificar(token) {
  const p = jwt.verify(token, process.env.JWT_SECRET);
  return { id_usuario: p.id_usuario ?? p.id, perfil: p.perfil, nome: p.nome };
}

function autenticar(req, res, next) {
  const token = lerToken(req);
  if (!token) throw new HttpError(401, 'Token não informado.');
  try {
    req.usuario = decodificar(token);
  } catch {
    throw new HttpError(401, 'Token inválido ou expirado.');
  }
  next();
}

// Para rotas públicas que se comportam diferente se houver login
function autenticarOpcional(req, res, next) {
  const token = lerToken(req);
  if (token) {
    try { req.usuario = decodificar(token); } catch { /* ignora */ }
  }
  next();
}

// RBAC: autorizar('autor', 'admin')
function autorizar(...perfis) {
  return (req, res, next) => {
    if (!req.usuario) throw new HttpError(401, 'Não autenticado.');
    if (!perfis.includes(req.usuario.perfil)) throw new HttpError(403, 'Sem permissão para esta ação.');
    next();
  };
}

module.exports = { autenticar, autenticarOpcional, autorizar };
