require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const storage = require('./services/storage');
const erro = require('./middlewares/erro');
const { HttpError } = require('./utils/erros');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Imagens locais (quando STORAGE_DRIVER=local)
app.use('/uploads', express.static(storage.UPLOAD_DIR, { maxAge: '30d', immutable: true }));

// --Partes 2, 3, 6 e 7
app.use(require('./routes/receitas'));   // busca, porções, CRUD
app.use(require('./routes/midia'));      // upload/otimização de imagens
app.use(require('./routes/seo'));        // JSON-LD, página da receita, sitemap, robots
app.use(require('./routes/compras'));    // lista de compras
app.use(require('./routes/afiliados'));  // links de afiliados
app.use(require('./routes/pdf'));        // PDF da receita

app.use(require('./routes/auth'));         // cadastro e login  (Helena)
app.use(require('./routes/comunidade'));   // comentários, notas, favoritos, admin   (Helena)

app.get('/api/saude', (req, res) => res.json({ ok: true }));
app.use((req, res, next) => next(new HttpError(404, 'Rota não encontrada.')));
app.use(erro);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
}
module.exports = app;
