function slugify(texto) {
  return (
    String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'receita'
  );
}

// Gera um slug que ainda não existe na tabela receitas
async function slugUnico(conn, titulo, ignorarId = null) {
  const base = slugify(titulo);
  let slug = base;
  let i = 2;
  for (;;) {
    const [rows] = await conn.query(
      'SELECT id_receita FROM receitas WHERE slug = ?' + (ignorarId ? ' AND id_receita <> ?' : ''),
      ignorarId ? [slug, ignorarId] : [slug]
    );
    if (!rows.length) return slug;
    slug = `${base}-${i++}`;
  }
}

module.exports = { slugify, slugUnico };
