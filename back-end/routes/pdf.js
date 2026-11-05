// PARTE 7c: gerador de PDF limpo para impressão
const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const { HttpError } = require('../utils/erros');
const { buscarCompleta } = require('../services/receitaService');
const { calcularFator, escalarIngredientes, formatarQuantidade } = require('../utils/unidades');

// GET /api/receitas/:ref/pdf?porcoes=8   (ou ?multiplicador=2)   |   ?download=1 força o download
router.get('/api/receitas/:ref/pdf', async (req, res) => {
  const r = await buscarCompleta(req.params.ref);
  if (!r) throw new HttpError(404, 'Receita não encontrada.');

  let ingredientes = r.ingredientes;
  let rendimento = r.rendimento;
  if (req.query.porcoes !== undefined || req.query.multiplicador !== undefined) {
    const fator = calcularFator(r.rendimento, req.query);
    ingredientes = escalarIngredientes(ingredientes, fator);
    if (rendimento) rendimento = Math.round(rendimento * fator * 100) / 100;
  }

  const site = process.env.SITE_NOME || 'UDF na Cozinha';
  const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
  const total = (r.tp_prep || 0) + (r.tp_cozi || 0);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${req.query.download ? 'attachment' : 'inline'}; filename="${r.slug}.pdf"`);

  const doc = new PDFDocument({ size: 'A4', margin: 56, info: { Title: r.titulo, Author: r.autor, Creator: site } });
  doc.pipe(res);

  doc.font('Helvetica').fontSize(9).fillColor('#888').text(site.toUpperCase(), { characterSpacing: 1.5 });
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(24).fillColor('#111').text(r.titulo);
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10).fillColor('#555').text(`Por ${r.autor}  •  ${r.categoria}`);

  const meta = [];
  if (r.tp_prep) meta.push(`Preparo: ${r.tp_prep} min`);
  if (r.tp_cozi) meta.push(`Cozimento: ${r.tp_cozi} min`);
  if (total) meta.push(`Total: ${total} min`);
  if (rendimento) meta.push(`Rendimento: ${rendimento} porções`);
  if (r.calorias) meta.push(`${r.calorias} kcal`);
  meta.push(`Dificuldade: ${r.dificuldade}`);
  doc.moveDown(0.6).fontSize(10).fillColor('#111').text(meta.join('   |   '));

  const linha = () => {
    doc.moveDown(0.6);
    doc.strokeColor('#cccccc').lineWidth(0.7).moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.6);
  };

  if (r.descricao) { linha(); doc.font('Helvetica-Oblique').fontSize(11).fillColor('#333').text(r.descricao, { align: 'justify' }); }

  linha();
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111').text('Ingredientes');
  doc.moveDown(0.4).font('Helvetica').fontSize(11);
  for (const i of ingredientes) {
    doc.text(`•  ${formatarQuantidade(i.quantidade)} ${i.un_medida} de ${i.nome}`, { indent: 6 });
  }

  linha();
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111').text('Modo de preparo');
  doc.moveDown(0.4).font('Helvetica').fontSize(11);
  for (const p of r.passos) {
    doc.font('Helvetica-Bold').text(`${p.ordem}. `, { continued: true }).font('Helvetica').text(p.desc_passo, { align: 'justify' });
    doc.moveDown(0.4);
  }

  if (r.tags.length) {
    doc.moveDown(0.4).font('Helvetica').fontSize(9).fillColor('#777').text(`Tags: ${r.tags.map((t) => t.nome).join(', ')}`);
  }
  if (siteUrl) doc.moveDown(0.8).fontSize(9).fillColor('#777').text(`${siteUrl}/receita/${r.slug}`, { link: `${siteUrl}/receita/${r.slug}` });

  doc.end();
});

module.exports = router;
