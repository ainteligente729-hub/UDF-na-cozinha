const multer = require('multer');
const { HttpError } = require('../utils/erros');

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

module.exports = multer({
  storage: multer.memoryStorage(), // a imagem vai para a memória, é otimizada e só então enviada
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (TIPOS.includes(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, 'Formato não suportado. Envie JPG, PNG, WebP ou AVIF.'));
  },
});
