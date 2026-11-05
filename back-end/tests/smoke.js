// Teste de ponta a ponta. Requer o banco com 01 + 02 aplicados e variáveis do .env.
// Uso: node tests/smoke.js
require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'teste';
const assert = require('assert');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const { pool } = require('../config/db');
const app = require('../server');

(async () => {
  const server = app.listen(Number(new URL(process.env.SITE_URL || 'http://localhost:3000').port) || 3000);
  const base = `http://localhost:${server.address().port}`;
  const j = async (m, p, body, token) => {
    const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const t = await r.text();
    let d; try { d = JSON.parse(t); } catch { d = t; }
    return { s: r.status, d };
  };
  const ok = (n) => console.log('  ok  ' + n);

  // dados da "parte da colega": usuários e categoria
  await pool.query('SET FOREIGN_KEY_CHECKS=0');
  for (const t of ['afiliados','receita_imagens','favoritos','avaliacoes','comentarios','receita_tags','receita_ingredientes','modo_preparo','receitas','tags','ingredientes','categorias','usuarios']) await pool.query(`DELETE FROM ${t}`);
  await pool.query('SET FOREIGN_KEY_CHECKS=1');
  const [u1] = await pool.query("INSERT INTO usuarios (nome,email,senha,perfil,dt_cadastro) VALUES ('Ana','ana@x.com','h','autor',NOW())");
  const [u2] = await pool.query("INSERT INTO usuarios (nome,email,senha,perfil,dt_cadastro) VALUES ('Beto','beto@x.com','h','leitor',NOW())");
  const [u3] = await pool.query("INSERT INTO usuarios (nome,email,senha,perfil,dt_cadastro) VALUES ('Carla','carla@x.com','h','autor',NOW())");
  const [c1] = await pool.query("INSERT INTO categorias (nome) VALUES ('Pratos principais')");
  const ana = jwt.sign({ id_usuario: u1.insertId, perfil: 'autor' }, process.env.JWT_SECRET);
  const beto = jwt.sign({ id_usuario: u2.insertId, perfil: 'leitor' }, process.env.JWT_SECRET);
  const carla = jwt.sign({ id_usuario: u3.insertId, perfil: 'autor' }, process.env.JWT_SECRET);

  // --- RBAC e validação
  assert.equal((await j('POST', '/api/receitas', {})).s, 401);
  assert.equal((await j('POST', '/api/receitas', {}, beto)).s, 403);
  assert.equal((await j('POST', '/api/receitas', { titulo: '' }, ana)).s, 400);
  ok('autenticação/RBAC/validação');

  // --- criar
  const corpo = {
    titulo: 'Frango com Batata Rústica', id_categoria: c1.insertId, dificuldade: 'facil',
    descricao: 'Clássico de forno.', tp_prep: 15, tp_cozi: 45, rendimento: 4, calorias: 520,
    ingredientes: [
      { nome: 'Frango', quantidade: 1, un_medida: 'kg' },
      { nome: 'Batata', quantidade: 500, un_medida: 'g' },
      { nome: 'Azeite', quantidade: 3, un_medida: 'colheres de sopa' },
    ],
    passos: ['Tempere o frango.', 'Corte as batatas.', 'Asse por 45 minutos.'],
    tags: ['Rápido', 'Sem Glúten'],
  };
  let r = await j('POST', '/api/receitas', corpo, ana);
  assert.equal(r.s, 201, JSON.stringify(r.d));
  const id = r.d.id_receita;
  assert.equal(r.d.slug, 'frango-com-batata-rustica');
  assert.equal(r.d.ingredientes.length, 3);
  assert.equal(r.d.passos[2].ordem, 3);
  assert.equal(r.d.tags.length, 2);
  ok('criar receita + slug + filhos');

  r = await j('POST', '/api/receitas', { ...corpo, ingredientes: [{ nome: 'Arroz', quantidade: 2, un_medida: 'xícaras' }], tags: ['Rápido'] , titulo: 'Arroz Soltinho'}, ana);
  assert.equal(r.s, 201);
  const id2 = r.d.id_receita;
  r = await j('POST', '/api/receitas', corpo, ana); // mesmo título -> slug -2
  assert.equal(r.d.slug, 'frango-com-batata-rustica-2');
  ok('slug único');

  // --- conversor de porções
  r = await j('GET', `/api/receitas/${id}?porcoes=8`);
  assert.equal(r.d.fator, 2);
  const fr = r.d.ingredientes.find((i) => i.nome === 'Frango');
  assert.equal(fr.quantidade, 2); assert.equal(fr.un_medida, 'kg');
  const bat = r.d.ingredientes.find((i) => i.nome === 'Batata');
  assert.equal(bat.quantidade, 1); assert.equal(bat.un_medida, 'kg'); // 1000 g -> 1 kg
  r = await j('GET', `/api/receitas/frango-com-batata-rustica/porcoes?multiplicador=0,5`);
  assert.equal(r.d.rendimento, 2);
  assert.equal((await j('GET', `/api/receitas/${id}/porcoes?porcoes=abc`)).s, 400);
  ok('conversor de porções (id, slug, kg/g)');

  // --- avaliações (parte da colega) para testar média/filtros
  await pool.query('INSERT INTO avaliacoes (id_receita,id_usuario,nota,dt_avaliacao) VALUES (?,?,5,NOW()),(?,?,4,NOW())', [id, u1.insertId, id, u2.insertId]);

  // --- busca avançada
  r = await j('GET', '/api/receitas/busca?ingredientes=frango,batata');
  assert.equal(r.d.total, 2); // as duas de frango+batata
  r = await j('GET', '/api/receitas/busca?ingredientes=frango,arroz&modo=qualquer');
  assert.equal(r.d.total, 3);
  r = await j('GET', '/api/receitas/busca?ingredientes=frango,arroz');
  assert.equal(r.d.total, 0);
  r = await j('GET', '/api/receitas/busca?sem_ingredientes=frango');
  assert.equal(r.d.total, 1); assert.equal(r.d.resultados[0].titulo, 'Arroz Soltinho');
  r = await j('GET', '/api/receitas/busca?tag=Rápido,Sem Glúten');
  assert.equal(r.d.total, 2);
  r = await j('GET', '/api/receitas/busca?nota_min=4.5');
  assert.equal(r.d.total, 1); assert.equal(r.d.resultados[0].nota_media, 4.5);
  r = await j('GET', '/api/receitas/busca?tempo_max=30');
  assert.equal(r.d.total, 0);
  r = await j('GET', '/api/receitas/busca?tempo_max=60&ordem=nota&limite=2&pagina=1');
  assert.equal(r.d.total, 3); assert.equal(r.d.resultados.length, 2); assert.equal(r.d.total_paginas, 2);
  ok('busca (ingredientes todos/qualquer, exclusão, tags, nota, tempo)');

  // --- editar / excluir com permissão de dono
  assert.equal((await j('PUT', `/api/receitas/${id}`, { titulo: 'X' }, carla)).s, 403);
  r = await j('PUT', `/api/receitas/${id}`, { calorias: 600, passos: ['Novo passo 1.', 'Novo passo 2.'] }, ana);
  assert.equal(r.s, 200); assert.equal(r.d.calorias, 600); assert.equal(r.d.passos.length, 2);
  assert.equal(r.d.slug, 'frango-com-batata-rustica'); // slug estável
  assert.equal(r.d.ingredientes.length, 3); // não mexeu nos ingredientes
  ok('editar parcial + RBAC de dono');

  // --- upload de imagem (parte 3)
  const png = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#c33' } }).png().toBuffer();
  const fd = new FormData();
  fd.append('imagens', new Blob([png], { type: 'image/png' }), 'prato.png');
  fd.append('alt', 'Frango assado');
  let up = await fetch(`${base}/api/receitas/${id}/imagens`, { method: 'POST', headers: { Authorization: `Bearer ${ana}` }, body: fd });
  const upd = await up.json();
  assert.equal(up.status, 201, JSON.stringify(upd));
  assert.ok(upd[0].principal);
  assert.ok(upd[0].largura <= 1600);
  assert.ok(upd[0].tamanho_otimizado_kb < upd[0].tamanho_original_kb);
  const img = await fetch(upd[0].url_thumb); // servido por /uploads
  assert.equal(img.status, 200); assert.equal(img.headers.get('content-type'), 'image/webp');
  const fdTxt = new FormData(); fdTxt.append('imagens', new Blob(['oi'], { type: 'text/plain' }), 'a.txt');
  up = await fetch(`${base}/api/receitas/${id}/imagens`, { method: 'POST', headers: { Authorization: `Bearer ${ana}` }, body: fdTxt });
  assert.equal(up.status, 400);
  const fdBad = new FormData(); fdBad.append('imagens', new Blob(['nao sou imagem'], { type: 'image/png' }), 'a.png');
  up = await fetch(`${base}/api/receitas/${id}/imagens`, { method: 'POST', headers: { Authorization: `Bearer ${ana}` }, body: fdBad });
  assert.equal(up.status, 400);
  up = await fetch(`${base}/api/receitas/${id}/imagens`, { method: 'POST', headers: { Authorization: `Bearer ${carla}` }, body: fd });
  assert.equal(up.status, 403);
  ok(`imagem: ${upd[0].tamanho_original_kb} KB -> ${upd[0].tamanho_otimizado_kb} KB WebP, 3 tamanhos, validações`);

  // --- afiliados (parte 7)
  r = await j('POST', '/api/afiliados', { id_receita: id, titulo: 'Assadeira antiaderente', loja: 'Amazon', url: 'https://amazon.com.br/dp/123?tag=udf-20' }, ana);
  assert.equal(r.s, 201);
  const idAf = r.d.id_afiliado;
  assert.equal((await j('POST', '/api/afiliados', { id_receita: id, titulo: 'x', url: 'javascript:alert(1)' }, ana)).s, 400);
  assert.equal((await j('POST', '/api/afiliados', { titulo: 'global', url: 'https://a.com' }, ana)).s, 403);
  const go = await fetch(`${base}/go/${idAf}`, { redirect: 'manual' });
  assert.equal(go.status, 302); assert.ok(go.headers.get('location').startsWith('https://amazon.com.br'));
  r = await j('GET', `/api/receitas/${id}/afiliados/estatisticas`, null, ana);
  assert.equal(r.d[0].cliques, 1);
  ok('afiliados (cadastro, validação, redirect com contagem de cliques)');

  // --- SEO (parte 6)
  r = await j('GET', `/api/receitas/${id}/schema`);
  assert.equal(r.d['@type'], 'Recipe');
  assert.equal(r.d.prepTime, 'PT15M'); assert.equal(r.d.totalTime, 'PT1H');
  assert.equal(r.d.aggregateRating.ratingValue, 4.5); assert.equal(r.d.aggregateRating.ratingCount, 2);
  assert.equal(r.d.recipeInstructions[0]['@type'], 'HowToStep');
  assert.ok(r.d.image.length === 1);
  const pag = await (await fetch(`${base}/receita/frango-com-batata-rustica`)).text();
  assert.ok(pag.includes('application/ld+json') && pag.includes('<link rel="canonical"') && pag.includes('rel="sponsored'));
  const sm = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.ok(sm.includes('<urlset') && sm.includes('/receita/arroz-soltinho') && sm.includes('image:loc'));
  assert.ok((await (await fetch(`${base}/robots.txt`)).text()).includes('Sitemap:'));
  // XSS: título com HTML não pode quebrar a página
  r = await j('POST', '/api/receitas', { ...corpo, titulo: '<script>alert(1)</script>', ingredientes: [{ nome: 'Sal', quantidade: 1, un_medida: 'g' }] }, ana);
  const xss = await (await fetch(`${base}/receita/${r.d.slug}`)).text();
  assert.ok(!xss.includes('<script>alert(1)</script>'));
  ok('SEO: JSON-LD, HTML, sitemap, robots, escape de XSS');

  // --- lista de compras (parte 7)
  await pool.query('INSERT INTO favoritos (id_receita,id_usuario,dt_fav) VALUES (?,?,NOW()),(?,?,NOW())', [id, u2.insertId, id2, u2.insertId]);
  await pool.query("INSERT INTO ingredientes (nome) VALUES ('Sal') ON DUPLICATE KEY UPDATE nome=nome");
  r = await j('GET', '/api/lista-compras', null, beto);
  assert.equal(r.s, 200);
  const nomes = r.d.itens.map((i) => i.nome);
  assert.deepEqual(nomes, ['Arroz', 'Azeite', 'Batata', 'Frango']);
  r = await j('POST', '/api/lista-compras', { receitas: [{ id_receita: id, porcoes: 8 }, { id_receita: id, porcoes: 4 }] }, beto);
  const frango = r.d.itens.find((i) => i.nome === 'Frango');
  assert.equal(frango.quantidade, 3); assert.equal(frango.un_medida, 'kg'); // 2 kg + 1 kg
  const txt = await (await fetch(`${base}/api/lista-compras?formato=texto`, { headers: { Authorization: `Bearer ${beto}` } })).text();
  assert.ok(txt.startsWith('LISTA DE COMPRAS'));
  assert.equal((await j('GET', '/api/lista-compras')).s, 401);
  ok('lista de compras consolidada (soma kg/g, porções, texto)');

  // --- PDF
  const pdf = await fetch(`${base}/api/receitas/${id}/pdf?porcoes=8`);
  const buf = Buffer.from(await pdf.arrayBuffer());
  assert.equal(pdf.headers.get('content-type'), 'application/pdf');
  assert.equal(buf.slice(0, 5).toString(), '%PDF-'); assert.ok(buf.length > 1500);
  require('fs').writeFileSync('/tmp/receita-teste.pdf', buf);
  ok(`PDF gerado (${Math.round(buf.length / 1024)} KB)`);

  // --- exclusão remove tudo, inclusive arquivos
  assert.equal((await j('DELETE', `/api/receitas/${id}`, null, carla)).s, 403);
  assert.equal((await j('DELETE', `/api/receitas/${id}`, null, ana)).s, 204);
  assert.equal((await j('GET', `/api/receitas/${id}`)).s, 404);
  const [[{ n }]] = await pool.query('SELECT COUNT(*) n FROM receita_imagens WHERE id_receita=?', [id]);
  assert.equal(n, 0);
  assert.equal((await fetch(upd[0].url_thumb)).status, 404);
  ok('exclusão em cascata + remoção dos arquivos de imagem');

  console.log('\nTODOS OS TESTES PASSARAM');
  server.close(); await pool.end();
})().catch((e) => { console.error('FALHOU:', e); process.exit(1); });
