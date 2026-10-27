// PARTE 6: Schema.org/Recipe (JSON-LD), página HTML com SEO, sitemap.xml e robots.txt
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { HttpError } = require('../utils/erros');
const { esc } = require('../utils/html');
const { formatarQuantidade } = require('../utils/unidades');
const { gerarSchemaReceita, serializarJsonLd } = require('../utils/seo');
const { buscarCompleta } = require('../services/receitaService');

const siteUrl = () => (process.env.SITE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
const siteNome = () => process.env.SITE_NOME || 'UDF na Cozinha';

// JSON-LD puro (útil para o frontend injetar no <head> se renderizar por conta própria)
router.get('/api/receitas/:ref/schema', async (req, res) => {
  const r = await buscarCompleta(req.params.ref);
  if (!r) throw new HttpError(404, 'Receita não encontrada.');
  res.type('application/ld+json').send(JSON.stringify(gerarSchemaReceita(r, { siteUrl: siteUrl() }), null, 2));
});

// Página HTML renderizada no servidor, com meta tags + JSON-LD (é o que o Google lê)
router.get('/receita/:slug', async (req, res) => {
  const r = await buscarCompleta(req.params.slug);
  if (!r) throw new HttpError(404, 'Receita não encontrada.');
  const url = `${siteUrl()}/receita/${r.slug}`;
  const schema = gerarSchemaReceita(r, { siteUrl: siteUrl() });
  const imagem = r.imagens[0]?.url_grande || r.imagem_capa || '';
  const descricao = (r.descricao || `Aprenda a fazer ${r.titulo}.`).slice(0, 160);
  const total = (r.tp_prep || 0) + (r.tp_cozi || 0);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(r.titulo)} | ${esc(siteNome())}</title>
  <meta name="description" content="${esc(descricao)}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(r.titulo)}">
  <meta property="og:description" content="${esc(descricao)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:site_name" content="${esc(siteNome())}">
  ${imagem ? `<meta property="og:image" content="${esc(imagem)}">\n  <meta name="twitter:card" content="summary_large_image">` : ''}
  <script type="application/ld+json">${serializarJsonLd(schema)}</script>
  <style>
    body{font-family:system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#222}
    img{max-width:100%;height:auto;border-radius:8px}
    .meta{color:#666;display:flex;gap:1rem;flex-wrap:wrap}
  </style>
</head>
<body>
  <article>
    <h1>${esc(r.titulo)}</h1>
    <p class="meta">
      <span>Por ${esc(r.autor)}</span><span>${esc(r.categoria)}</span>
      ${total ? `<span>${total} min</span>` : ''}
      ${r.rendimento ? `<span>${r.rendimento} porções</span>` : ''}
      <span>Dificuldade: ${esc(r.dificuldade)}</span>
      ${r.total_avaliacoes ? `<span>★ ${r.nota_media} (${r.total_avaliacoes})</span>` : ''}
    </p>
    ${r.imagens[0] ? `<img src="${esc(r.imagens[0].url_media)}" alt="${esc(r.imagens[0].alt_text || r.titulo)}" width="${r.imagens[0].largura || ''}">` : ''}
    ${r.descricao ? `<p>${esc(r.descricao)}</p>` : ''}
    <h2>Ingredientes</h2>
    <ul>${r.ingredientes.map((i) => `<li>${esc(formatarQuantidade(i.quantidade))} ${esc(i.un_medida)} de ${esc(i.nome)}</li>`).join('')}</ul>
    <h2>Modo de preparo</h2>
    <ol>${r.passos.map((p) => `<li>${esc(p.desc_passo)}</li>`).join('')}</ol>
    ${r.afiliados.length ? `<h2>Utensílios e ingredientes recomendados</h2><ul>${r.afiliados.map((a) => `<li><a href="${esc(a.link)}" rel="sponsored nofollow noopener" target="_blank">${esc(a.titulo)}</a>${a.loja ? ` (${esc(a.loja)})` : ''}</li>`).join('')}</ul>` : ''}
    <p><a href="/api/receitas/${r.id_receita}/pdf">Baixar versão para impressão (PDF)</a></p>
  </article>
</body>
</html>`;
  res.type('html').send(html);
});

// ------------------------------------------------------------------ sitemap.xml
let cacheSitemap = { xml: null, expira: 0 };

router.get('/sitemap.xml', async (req, res) => {
  if (!cacheSitemap.xml || Date.now() > cacheSitemap.expira) {
    const [rows] = await pool.query(
      `SELECT r.slug, COALESCE(r.dt_atualizacao, r.dt_publicacao) AS atualizado,
              (SELECT url_grande FROM receita_imagens i WHERE i.id_receita = r.id_receita
                ORDER BY i.principal DESC, i.id_imagem LIMIT 1) AS imagem
         FROM receitas r ORDER BY r.dt_publicacao DESC`
    );
    const base = siteUrl();
    const urls = [`  <url><loc>${esc(base)}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`];
    for (const r of rows) {
      const lastmod = r.atualizado ? `<lastmod>${new Date(r.atualizado).toISOString()}</lastmod>` : '';
      const img = r.imagem ? `<image:image><image:loc>${esc(r.imagem)}</image:loc></image:image>` : '';
      urls.push(`  <url><loc>${esc(base)}/receita/${esc(r.slug)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.8</priority>${img}</url>`);
    }
    cacheSitemap = {
      xml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>`,
      expira: Date.now() + 10 * 60 * 1000, // 10 min
    };
  }
  res.type('application/xml').send(cacheSitemap.xml);
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /go/\n\nSitemap: ${siteUrl()}/sitemap.xml\n`);
});

// Permite invalidar o cache quando uma receita é criada/editada (opcional)
router.invalidarSitemap = () => { cacheSitemap = { xml: null, expira: 0 }; };

module.exports = router;
