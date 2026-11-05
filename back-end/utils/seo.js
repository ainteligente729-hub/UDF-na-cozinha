// Monta o JSON-LD (schema.org/Recipe) usado pelo Google para rich snippets.

function minutosParaISO(min) {
  min = Number(min) || 0;
  if (min <= 0) return undefined;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return 'PT' + (h ? `${h}H` : '') + (m ? `${m}M` : '');
}

const iso = (d) => (d ? new Date(d).toISOString() : undefined);

function gerarSchemaReceita(r, { siteUrl }) {
  const url = `${siteUrl}/receita/${r.slug}`;
  const imagens = r.imagens.map((i) => i.url_grande);
  if (!imagens.length && r.imagem_capa) imagens.push(r.imagem_capa);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.titulo,
    url,
    mainEntityOfPage: url,
    description: r.descricao || undefined,
    image: imagens.length ? imagens : undefined,
    author: { '@type': 'Person', name: r.autor },
    datePublished: iso(r.dt_publicacao),
    dateModified: iso(r.dt_atualizacao || r.dt_publicacao),
    prepTime: minutosParaISO(r.tp_prep),
    cookTime: minutosParaISO(r.tp_cozi),
    totalTime: minutosParaISO((r.tp_prep || 0) + (r.tp_cozi || 0)),
    recipeYield: r.rendimento ? `${r.rendimento} porções` : undefined,
    recipeCategory: r.categoria,
    keywords: r.tags.map((t) => t.nome).join(', ') || undefined,
    recipeIngredient: r.ingredientes.map((i) => `${i.quantidade} ${i.un_medida} ${i.nome}`.trim()),
    recipeInstructions: r.passos.map((p) => ({
      '@type': 'HowToStep',
      position: p.ordem,
      text: p.desc_passo,
    })),
  };

  if (r.calorias) {
    schema.nutrition = { '@type': 'NutritionInformation', calories: `${r.calorias} calories` };
  }
  if (r.total_avaliacoes > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: r.nota_media,
      ratingCount: r.total_avaliacoes,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (r.video_url && imagens[0]) {
    schema.video = {
      '@type': 'VideoObject',
      name: r.titulo,
      description: r.descricao || r.titulo,
      thumbnailUrl: imagens[0],
      contentUrl: r.video_url,
      uploadDate: iso(r.dt_publicacao),
    };
  }
  return JSON.parse(JSON.stringify(schema)); // remove campos undefined
}

// Seguro para colocar dentro de <script type="application/ld+json">
function serializarJsonLd(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

module.exports = { gerarSchemaReceita, serializarJsonLd, minutosParaISO };
