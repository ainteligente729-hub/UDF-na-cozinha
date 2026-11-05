USE blog_comida;

SET FOREIGN_KEY_CHECKS = 0;

-- 1) AUTO_INCREMENT nos ids (repetir não causa erro)
ALTER TABLE usuarios      MODIFY id_usuario      int NOT NULL AUTO_INCREMENT;
ALTER TABLE categorias    MODIFY id_categoria    int NOT NULL AUTO_INCREMENT;
ALTER TABLE receitas      MODIFY id_receita      int NOT NULL AUTO_INCREMENT;
ALTER TABLE ingredientes  MODIFY id_ingredientes int NOT NULL AUTO_INCREMENT;
ALTER TABLE modo_preparo  MODIFY id_passo        int NOT NULL AUTO_INCREMENT;
ALTER TABLE tags          MODIFY id_tags         int NOT NULL AUTO_INCREMENT;
ALTER TABLE comentarios   MODIFY id_comentario   int NOT NULL AUTO_INCREMENT;

SET FOREIGN_KEY_CHECKS = 1;

-- 2) Colunas novas

-- coluna receitas.slug
SET @s = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receitas' AND COLUMN_NAME = 'slug') = 0, 'ALTER TABLE receitas ADD COLUMN slug varchar(80) NULL AFTER titulo', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- coluna receitas.imagem_capa
SET @s = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receitas' AND COLUMN_NAME = 'imagem_capa') = 0, 'ALTER TABLE receitas ADD COLUMN imagem_capa varchar(500) NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- coluna receitas.video_url
SET @s = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receitas' AND COLUMN_NAME = 'video_url') = 0, 'ALTER TABLE receitas ADD COLUMN video_url varchar(500) NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- coluna receitas.dt_atualizacao
SET @s = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receitas' AND COLUMN_NAME = 'dt_atualizacao') = 0, 'ALTER TABLE receitas ADD COLUMN dt_atualizacao datetime NULL', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- coluna receita_ingredientes.ordem
SET @s = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receita_ingredientes' AND COLUMN_NAME = 'ordem') = 0, 'ALTER TABLE receita_ingredientes ADD COLUMN ordem int NOT NULL DEFAULT 0', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 3) Travas de unicidade e índices

-- índice/trava UQ_ingrediente_nome
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ingredientes' AND INDEX_NAME = 'UQ_ingrediente_nome') = 0, 'ALTER TABLE ingredientes ADD CONSTRAINT UQ_ingrediente_nome UNIQUE (nome)', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- índice/trava UQ_tag_nome
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tags' AND INDEX_NAME = 'UQ_tag_nome') = 0, 'ALTER TABLE tags ADD CONSTRAINT UQ_tag_nome UNIQUE (nome)', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

UPDATE receitas SET slug = CONCAT('receita-', id_receita) WHERE slug IS NULL;

-- índice/trava UQ_receita_slug
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receitas' AND INDEX_NAME = 'UQ_receita_slug') = 0, 'ALTER TABLE receitas ADD CONSTRAINT UQ_receita_slug UNIQUE (slug)', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- índice/trava IDX_receitas_categoria
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receitas' AND INDEX_NAME = 'IDX_receitas_categoria') = 0, 'CREATE INDEX IDX_receitas_categoria ON receitas (id_categoria)', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- índice/trava IDX_receitas_publicacao
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receitas' AND INDEX_NAME = 'IDX_receitas_publicacao') = 0, 'CREATE INDEX IDX_receitas_publicacao ON receitas (dt_publicacao)', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- índice/trava IDX_avaliacoes_receita
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'avaliacoes' AND INDEX_NAME = 'IDX_avaliacoes_receita') = 0, 'CREATE INDEX IDX_avaliacoes_receita ON avaliacoes (id_receita)', 'DO 0');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 4) Tabelas novas (IF NOT EXISTS: se já existir, não faz nada)
CREATE TABLE IF NOT EXISTS receita_imagens
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

CREATE TABLE IF NOT EXISTS afiliados
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
