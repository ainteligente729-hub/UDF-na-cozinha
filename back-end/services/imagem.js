const sharp = require('sharp');
const { HttpError } = require('../utils/erros');

// Três tamanhos, todos em WebP
const VARIANTES = [
  { nome: 'grande', largura: 1600, qualidade: 80 },
  { nome: 'media', largura: 800, qualidade: 78 },
  { nome: 'thumb', largura: 400, qualidade: 75 },
];

async function otimizar(buffer) {
  try {
    const resultado = {};
    for (const v of VARIANTES) {
      resultado[v.nome] = await sharp(buffer)
        .rotate() // respeita a orientação do celular; metadados EXIF/GPS são removidos
        .resize({ width: v.largura, withoutEnlargement: true })
        .webp({ quality: v.qualidade })
        .toBuffer();
    }
    const meta = await sharp(resultado.grande).metadata();
    return { variantes: resultado, largura: meta.width, altura: meta.height };
  } catch {
    throw new HttpError(400, 'Arquivo de imagem inválido ou corrompido.');
  }
}

module.exports = { otimizar, VARIANTES };
