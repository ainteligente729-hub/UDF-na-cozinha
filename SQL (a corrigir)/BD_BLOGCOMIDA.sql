-- ============================================================
-- BANCO DE DADOS: UDF na Cozinha
-- ============================================================

DROP DATABASE IF EXISTS blog_comida;

CREATE DATABASE blog_comida;

USE blog_comida;


-- ============================================================
-- TABELA: usuarios
-- ============================================================

CREATE TABLE usuarios
(
    id_usuario      INT             NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    senha           VARCHAR(255)    NOT NULL,
    perfil          ENUM('admin','autor','leitor') NOT NULL DEFAULT 'leitor',
    dt_cadastro     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_usuario)
);


-- ============================================================
-- TABELA: categorias
-- ============================================================

CREATE TABLE categorias
(
    id_categoria    INT             NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(80)     NOT NULL UNIQUE,
    descricao       VARCHAR(255),

    PRIMARY KEY (id_categoria)
);


-- ============================================================
-- TABELA: receitas
-- ============================================================

CREATE TABLE receitas
(
    id_receita      INT             NOT NULL AUTO_INCREMENT,
    id_usuario      INT             NOT NULL,
    id_categoria    INT             NOT NULL,
    titulo          VARCHAR(150)    NOT NULL,
    descricao       TEXT,
    tp_prep         INT,
    tp_cozi         INT,
    rendimento      INT,
    calorias        INT,
    dificuldade     ENUM('facil','medio','dificil') NOT NULL,
    dt_publicacao   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Campos adicionados ao projeto
    slug            VARCHAR(180),
    video_url       VARCHAR(500),
    dt_atualizacao  DATETIME,
    imagem_capa     VARCHAR(500),

    PRIMARY KEY (id_receita)
);


-- ============================================================
-- TABELA: ingredientes
-- ============================================================

CREATE TABLE ingredientes
(
    id_ingredientes INT             NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(100)    NOT NULL UNIQUE,

    PRIMARY KEY (id_ingredientes)
);


-- ============================================================
-- TABELA: modo_preparo
-- ============================================================

CREATE TABLE modo_preparo
(
    id_passo        INT             NOT NULL AUTO_INCREMENT,
    id_receita      INT             NOT NULL,
    ordem           INT             NOT NULL,
    desc_passo      TEXT            NOT NULL,

    PRIMARY KEY (id_passo),

    UNIQUE (id_receita, ordem)
);


-- ============================================================
-- TABELA: receita_ingredientes
-- ============================================================

CREATE TABLE receita_ingredientes
(
    id_receita      INT             NOT NULL,
    id_ingredientes INT             NOT NULL,
    quantidade      DECIMAL(8,2)    NOT NULL,
    un_medida       VARCHAR(30)     NOT NULL,
    ordem           INT             NOT NULL DEFAULT 0,

    PRIMARY KEY (id_receita, id_ingredientes)
);


-- ============================================================
-- TABELA: tags
-- ============================================================

CREATE TABLE tags
(
    id_tags         INT             NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(50)     NOT NULL UNIQUE,

    PRIMARY KEY (id_tags)
);


-- ============================================================
-- TABELA: receita_tags
-- ============================================================

CREATE TABLE receita_tags
(
    id_tags         INT             NOT NULL,
    id_receita      INT             NOT NULL,

    PRIMARY KEY (id_tags, id_receita)
);


-- ============================================================
-- TABELA: comentarios
-- ============================================================

CREATE TABLE comentarios
(
    id_comentario   INT             NOT NULL AUTO_INCREMENT,
    id_receita      INT             NOT NULL,
    id_usuario      INT             NOT NULL,
    texto           TEXT            NOT NULL,
    dt_comentario   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_comentario)
);


-- ============================================================
-- TABELA: avaliacoes
-- ============================================================

CREATE TABLE avaliacoes
(
    id_receita      INT             NOT NULL,
    id_usuario      INT             NOT NULL,
    nota            TINYINT         NOT NULL,
    dt_avaliacao    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_receita, id_usuario),

    CHECK (nota BETWEEN 1 AND 5)
);


-- ============================================================
-- TABELA: favoritos
-- ============================================================

CREATE TABLE favoritos
(
    id_receita      INT             NOT NULL,
    id_usuario      INT             NOT NULL,
    dt_fav          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_receita, id_usuario)
);


-- ============================================================
-- FOREIGN KEYS
-- ============================================================

-- receitas → usuarios
ALTER TABLE receitas
ADD CONSTRAINT FK_receitas_usuario
FOREIGN KEY (id_usuario)
REFERENCES usuarios(id_usuario);


-- receitas → categorias
ALTER TABLE receitas
ADD CONSTRAINT FK_receitas_categoria
FOREIGN KEY (id_categoria)
REFERENCES categorias(id_categoria);


-- modo_preparo → receitas
ALTER TABLE modo_preparo
ADD CONSTRAINT FK_preparo_receita
FOREIGN KEY (id_receita)
REFERENCES receitas(id_receita)
ON DELETE CASCADE;


-- receita_ingredientes → receitas
ALTER TABLE receita_ingredientes
ADD CONSTRAINT FK_RI_receita
FOREIGN KEY (id_receita)
REFERENCES receitas(id_receita)
ON DELETE CASCADE;


-- receita_ingredientes → ingredientes
ALTER TABLE receita_ingredientes
ADD CONSTRAINT FK_RI_ingrediente
FOREIGN KEY (id_ingredientes)
REFERENCES ingredientes(id_ingredientes);


-- receita_tags → tags
ALTER TABLE receita_tags
ADD CONSTRAINT FK_RT_tags
FOREIGN KEY (id_tags)
REFERENCES tags(id_tags);


-- receita_tags → receitas
ALTER TABLE receita_tags
ADD CONSTRAINT FK_RT_receita
FOREIGN KEY (id_receita)
REFERENCES receitas(id_receita)
ON DELETE CASCADE;


-- comentarios → usuarios
ALTER TABLE comentarios
ADD CONSTRAINT FK_COM_usuario
FOREIGN KEY (id_usuario)
REFERENCES usuarios(id_usuario);


-- comentarios → receitas
ALTER TABLE comentarios
ADD CONSTRAINT FK_COM_receita
FOREIGN KEY (id_receita)
REFERENCES receitas(id_receita)
ON DELETE CASCADE;


-- avaliacoes → usuarios
ALTER TABLE avaliacoes
ADD CONSTRAINT FK_AVAL_usuario
FOREIGN KEY (id_usuario)
REFERENCES usuarios(id_usuario);


-- avaliacoes → receitas
ALTER TABLE avaliacoes
ADD CONSTRAINT FK_AVAL_receita
FOREIGN KEY (id_receita)
REFERENCES receitas(id_receita)
ON DELETE CASCADE;


-- favoritos → usuarios
ALTER TABLE favoritos
ADD CONSTRAINT FK_FAV_usuario
FOREIGN KEY (id_usuario)
REFERENCES usuarios(id_usuario);


-- favoritos → receitas
ALTER TABLE favoritos
ADD CONSTRAINT FK_FAV_receita
FOREIGN KEY (id_receita)
REFERENCES receitas(id_receita)
ON DELETE CASCADE;


-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Usuários
-- As senhas são armazenadas em bcrypt para serem compatíveis
-- com o sistema de autenticação do backend.

INSERT INTO usuarios
    (nome, email, senha, perfil)
VALUES
    (
        'Mariazinha',
        'minimaria@email.com',
        '$2b$10$x6tgWh6m4nXw1vZSm5OEouW0.HJQFks8kETRx9Ka3Cc7nXR/CCd9S',
        'autor'
    );

INSERT INTO usuarios
    (nome, email, senha, perfil)
VALUES
    (
        'Josefina',
        'finafina@email.com',
        '$2b$10$ezsZlgPETC/1rHxXFFJCduRTzcq9ajWXKSZjiRDiiSfy.Nub7e.9m',
        'leitor'
    );

INSERT INTO usuarios
    (nome, email, senha, perfil)
VALUES
    (
        'Joao Naldo',
        'joaon@email.com',
        '$2b$10$xhHFZQjSGh85ppmnLFw4w.gmPFpBVcj.gNo.Zplu5yT/lpRpwcX5m',
        'leitor'
    );


-- Categorias

INSERT INTO categorias
    (nome, descricao)
VALUES
    (
        'Sobremesa',
        'Doces e mini lanches para pós refeição'
    );

INSERT INTO categorias
    (nome, descricao)
VALUES
    (
        'Salgados',
        'Lanches salgados para fim da tarde'
    );

INSERT INTO categorias
    (nome, descricao)
VALUES
    (
        'Bolos',
        'Assados para lanche'
    );


-- ============================================================
-- FIM DO SCRIPT
-- ============================================================