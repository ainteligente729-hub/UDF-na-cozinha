const { HttpError } = require('../utils/erros');

// Express 5 já encaminha erros de funções async para cá
module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err instanceof HttpError) return res.status(err.status).json({ erro: err.message, ...(err.detalhes ? { detalhes: err.detalhes } : {}) });
  if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Imagem maior que 8 MB.' : `Erro no upload: ${err.message}`;
    return res.status(400).json({ erro: msg });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'Referência inválida (categoria, usuário, receita ou ingrediente inexistente).' });
  }
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Registro duplicado.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
};
