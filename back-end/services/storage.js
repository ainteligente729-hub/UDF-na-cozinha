// Armazenamento de imagens. Escolha com STORAGE_DRIVER=local | cloudinary
const fs = require('fs/promises');
const path = require('path');

const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const BASE_URL = (process.env.SITE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');

let cloudinary;
function getCloudinary() {
  if (!cloudinary) {
    cloudinary = require('cloudinary').v2; // lê CLOUDINARY_URL automaticamente
    cloudinary.config({ secure: true });
  }
  return cloudinary;
}

// publicId: ex. "receitas/12/ab12-grande" (sem extensão). Retorna a URL pública.
async function salvar(publicId, buffer) {
  if (driver === 'cloudinary') {
    const cld = getCloudinary();
    const r = await new Promise((resolve, reject) => {
      cld.uploader
        .upload_stream({ public_id: publicId, resource_type: 'image', overwrite: true }, (err, res) =>
          err ? reject(err) : resolve(res)
        )
        .end(buffer);
    });
    return r.secure_url;
  }
  const arquivo = path.join(UPLOAD_DIR, `${publicId}.webp`);
  await fs.mkdir(path.dirname(arquivo), { recursive: true });
  await fs.writeFile(arquivo, buffer);
  return `${BASE_URL}/uploads/${publicId}.webp`;
}

async function remover(publicId) {
  try {
    if (driver === 'cloudinary') {
      await getCloudinary().uploader.destroy(publicId, { resource_type: 'image' });
    } else {
      await fs.rm(path.join(UPLOAD_DIR, `${publicId}.webp`), { force: true });
    }
  } catch (e) {
    console.error('Falha ao remover imagem', publicId, e.message);
  }
}

// storage_key guarda a base (ex. "receitas/12/ab12"); as variantes são base-grande/-media/-thumb
async function removerTodas(storageKey) {
  await Promise.all(['grande', 'media', 'thumb'].map((v) => remover(`${storageKey}-${v}`)));
}

module.exports = { salvar, remover, removerTodas, UPLOAD_DIR, driver };
