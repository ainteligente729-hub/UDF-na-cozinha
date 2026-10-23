-- =====================================================================
-- MIGRAÇÃO DA PARTE 2/3/6/7 (rodar DEPOIS do BD_BLOGCOMIDA.sql da colega)
-- Não altera o que já existe além de: AUTO_INCREMENT nos ids e colunas novas.
-- =====================================================================
USE blog_comida;

SET FOREIGN_KEY_CHECKS = 0;

-- 1) Os ids do script original não são AUTO_INCREMENT; sem isso os INSERTs do backend falham.
ALTER TABLE usuarios      MODIFY id_usuario      int NOT NULL AUTO_INCREMENT;
ALTER TABLE categorias    MODIFY id_categoria    int NOT NULL AUTO_INCREMENT;
ALTER TABLE receitas      MODIFY id_receita      int NOT NULL AUTO_INCREMENT;
ALTER TABLE ingredientes  MODIFY id_ingredientes int NOT NULL AUTO_INCREMENT;
ALTER TABLE modo_preparo  MODIFY id_passo        int NOT NULL AUTO_INCREMENT;
ALTER TABLE tags          MODIFY id_tags         int NOT NULL AUTO_INCREMENT;
ALTER TABLE comentarios   MODIFY id_comentario   int NOT NULL AUTO_INCREMENT;

SET FOREIGN_KEY_CHECKS = 1;

-- 2) Nomes únicos (evita ingrediente/tag duplicado)
ALTER TABLE ingredientes ADD CONSTRAINT UQ_ingrediente_nome UNIQUE (nome);
ALTER TABLE tags         ADD CONSTRAINT UQ_tag_nome         UNIQUE (nome);

-- 3) Colunas novas em receitas (slug para URL/SEO, capa, vídeo, atualização)
ALTER TABLE receitas
  ADD COLUMN slug           varchar(80)  NULL AFTER titulo,
  ADD COLUMN imagem_capa    varchar(500) NULL,
  ADD COLUMN video_url      varchar(500) NULL,
  ADD COLUMN dt_atualizacao datetime     NULL,
  ADD CONSTRAINT UQ_receita_slug UNIQUE (slug);

UPDATE receitas SET slug = CONCAT('receita-', id_receita) WHERE slug IS NULL;

-- 4) Ordem dos ingredientes dentro da receita
ALTER TABLE receita_ingredientes ADD COLUMN ordem int NOT NULL DEFAULT 0;

-- 5) Índices de apoio à busca avançada
CREATE INDEX IDX_receitas_categoria ON receitas (id_categoria);
CREATE INDEX IDX_receitas_publicacao ON receitas (dt_publicacao);
CREATE INDEX IDX_avaliacoes_receita ON avaliacoes (id_receita);

-- 6) Imagens das receitas (parte 3)
CREATE TABLE receita_imagens
(
  id_imagem    int          NOT NULL AUTO_INCREMENT,
  id_receita   int          NOT NULL,
  url_grande   varchar(500) NOT NULL,
  url_media    varchar(500) NOT NULL,
  url_thumb    varchar(500) NOT NULL,
  storage_key  varchar(200) NOT NULL,
  alt_text     varchar(200),
  largura      int,
  altura       int,
  principal    tinyint(1)   NOT NULL DEFAULT 0,
  dt_upload    datetime     NOT NULL,
  PRIMARY KEY (id_imagem),
  CONSTRAINT FK_IMG_receita FOREIGN KEY (id_receita) REFERENCES receitas(id_receita) ON DELETE CASCADE
);

-- 7) Links de afiliados (parte 7)
CREATE TABLE afiliados
(
  id_afiliado     int          NOT NULL AUTO_INCREMENT,
  id_receita      int          NULL,
  id_ingredientes int          NULL,
  titulo          varchar(120) NOT NULL,
  loja            varchar(60),
  url             varchar(1000) NOT NULL,
  imagem_url      varchar(500),
  ativo           tinyint(1)   NOT NULL DEFAULT 1,
  cliques         int          NOT NULL DEFAULT 0,
  dt_cadastro     datetime     NOT NULL,
  PRIMARY KEY (id_afiliado),
  CONSTRAINT FK_AFIL_receita FOREIGN KEY (id_receita) REFERENCES receitas(id_receita) ON DELETE CASCADE,
  CONSTRAINT FK_AFIL_ingrediente FOREIGN KEY (id_ingredientes) REFERENCES ingredientes(id_ingredientes) ON DELETE SET NULL
);
