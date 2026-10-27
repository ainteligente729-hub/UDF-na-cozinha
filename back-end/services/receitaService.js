const { pool } = require('../config/db');
const { HttpError } = require('../utils/erros');

// Aceita id numérico ou slug
async function buscarCompleta(ref) {
  const porId = /^\d+$/.test(String(ref));
  const [rows] = await pool.query(
    `SELECT r.id_receita, r.id_usuario, r.id_categoria, r.titulo, r.slug,
            r.\`descrição\` AS descricao,
            r.tp_prep, r.tp_cozi, r.rendimento, r.calorias, r.dificuldade,
            r.dt_publicacao, r.dt_atualizacao, r.imagem_capa, r.video_url,
            c.nome AS categoria, u.nome AS autor,
            (SELECT ROUND(AVG(a.nota), 2) FROM avaliacoes a WHERE a.id_receita = r.id_receita) AS nota_media,
            (SELECT COUNT(*) FROM avaliacoes a WHERE a.id_receita = r.id_receita) AS total_avaliacoes
       FROM receitas r
       JOIN categorias c ON c.id_categoria = r.id_categoria
       JOIN usuarios u   ON u.id_usuario = r.id_usuario
      WHERE ${porId ? 'r.id_receita' : 'r.slug'} = ?`,
    [ref]
  );
  if (!rows.length) return null;
  const r = rows[0];
  r.nota_media = r.nota_media === null ? null : Number(r.nota_media);
  r.total_avaliacoes = Number(r.total_avaliacoes);

  const [ingredientes] = await pool.query(
    `SELECT i.id_ingredientes, i.nome, ri.quantidade, ri.un_medida
       FROM receita_ingredientes ri
       JOIN ingredientes i ON i.id_ingredientes = ri.id_ingredientes
      WHERE ri.id_receita = ?
      ORDER BY ri.ordem, i.nome`,
    [r.id_receita]
  );
  r.ingredientes = ingredientes.map((i) => ({ ...i, quantidade: Number(i.quantidade) }));

  const [passos] = await pool.query(
    'SELECT id_passo, ordem, desc_passo FROM modo_preparo WHERE id_receita = ? ORDER BY ordem',
    [r.id_receita]
  );
  r.passos = passos;

  const [tags] = await pool.query(
    `SELECT t.id_tags, t.nome FROM receita_tags rt JOIN tags t ON t.id_tags = rt.id_tags
      WHERE rt.id_receita = ? ORDER BY t.nome`,
    [r.id_receita]
  );
  r.tags = tags;

  const [imagens] = await pool.query(
    `SELECT id_imagem, url_grande, url_media, url_thumb, alt_text, largura, altura, principal
       FROM receita_imagens WHERE id_receita = ? ORDER BY principal DESC, id_imagem`,
    [r.id_receita]
  );
  r.imagens = imagens.map((i) => ({ ...i, principal: !!i.principal }));

  const [afiliados] = await pool.query(
    `SELECT id_afiliado, id_ingredientes, titulo, loja, imagem_url
       FROM afiliados WHERE ativo = 1 AND (id_receita = ? OR id_receita IS NULL) ORDER BY id_afiliado`,
    [r.id_receita]
  );
  r.afiliados = afiliados.map((a) => ({ ...a, link: `/go/${a.id_afiliado}` }));

  return r;
}

// Garante que o usuário é dono da receita ou admin. Retorna a linha da receita.
async function exigirDonoOuAdmin(idReceita, usuario) {
  const [rows] = await pool.query('SELECT id_receita, id_usuario, imagem_capa FROM receitas WHERE id_receita = ?', [idReceita]);
  if (!rows.length) throw new HttpError(404, 'Receita não encontrada.');
  if (usuario.perfil !== 'admin' && rows[0].id_usuario !== usuario.id_usuario) {
    throw new HttpError(403, 'Você só pode alterar as suas próprias receitas.');
  }
  return rows[0];
}

module.exports = { buscarCompleta, exigirDonoOuAdmin };
