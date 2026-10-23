DROP DATABASE blog_comida;
CREATE DATABASE blog_comida;
USE blog_comida;

CREATE TABLE usuarios
(
    id_usuario      int             not null,
    nome            varchar(100)    not null,
    email           varchar(150)    not null unique,
    senha           varchar(255)    not null,
    perfil          enum('admin','autor','leitor') not null default 'leitor',
    dt_cadastro     datetime        not null default current_timestamp
);

CREATE TABLE categorias
(
    id_categoria    int             not null,
    nome            varchar(80)     not null unique,
    descricao       varchar(255)
);

CREATE TABLE receitas
(
    id_receita      int             not null,
    id_usuario      int             not null,
    id_categoria    int             not null,
    titulo          varchar(150)    not null,
    descricao       text,
    tp_prep         int,
    tp_cozi         int,
    rendimento      int,
    calorias        int,
    dificuldade     enum('facil','medio','dificil') not null,
    dt_publicacao   datetime        not null default current_timestamp
);

CREATE TABLE ingredientes
(
    id_ingredientes int             not null,
    nome            varchar(100)    not null unique
);

CREATE TABLE modo_preparo
(
    id_passo        int             not null,
    id_receita      int             not null,
    ordem           int             not null,
    desc_passo      text            not null,
    unique (id_receita, ordem)
);

CREATE TABLE receita_ingredientes
(
    id_receita      int             not null,
    id_ingredientes int             not null,
    quantidade      decimal(8,2)    not null,
    un_medida       varchar(30)     not null
);

CREATE TABLE tags
(
    id_tags         int             not null,
    nome            varchar(50)     not null unique
);

CREATE TABLE receita_tags
(
    id_tags         int             not null,
    id_receita      int             not null
);

CREATE TABLE comentarios
(
    id_comentario   int             not null,
    id_receita      int             not null,
    id_usuario      int             not null,
    texto           text            not null,
    dt_comentario   datetime        not null default current_timestamp
);

CREATE TABLE avaliacoes
(
    id_receita      int             not null,
    id_usuario      int             not null,
    nota            tinyint         not null,
    dt_avaliacao    datetime        not null default current_timestamp,
    check (nota between 1 and 5)
);

CREATE TABLE favoritos
(
    id_receita      int             not null,
    id_usuario      int             not null,
    dt_fav          datetime        not null default current_timestamp
);

ALTER TABLE usuarios ADD CONSTRAINT PK_USER
PRIMARY KEY (id_usuario);

ALTER TABLE categorias ADD CONSTRAINT PK_categorias
PRIMARY KEY (id_categoria);

ALTER TABLE receitas ADD CONSTRAINT PK_receita
PRIMARY KEY (id_receita);

ALTER TABLE ingredientes ADD CONSTRAINT PK_ingredientes
PRIMARY KEY (id_ingredientes);

ALTER TABLE modo_preparo ADD CONSTRAINT PK_PASSO
PRIMARY KEY (id_passo);

ALTER TABLE receita_ingredientes ADD CONSTRAINT PK_RI
PRIMARY KEY (id_receita, id_ingredientes);

ALTER TABLE tags ADD CONSTRAINT PK_TAGS
PRIMARY KEY (id_tags);

ALTER TABLE receita_tags ADD CONSTRAINT PK_REC_TAGS
PRIMARY KEY (id_tags, id_receita);

ALTER TABLE comentarios ADD CONSTRAINT PK_COM
PRIMARY KEY (id_comentario);

ALTER TABLE avaliacoes ADD CONSTRAINT PK_RECUSER
PRIMARY KEY (id_receita, id_usuario);

ALTER TABLE favoritos ADD CONSTRAINT PK_FAVS
PRIMARY KEY (id_receita, id_usuario);

-- autoincrement
ALTER TABLE usuarios     MODIFY id_usuario      int not null AUTO_INCREMENT;
ALTER TABLE categorias   MODIFY id_categoria    int not null AUTO_INCREMENT;
ALTER TABLE receitas     MODIFY id_receita      int not null AUTO_INCREMENT;
ALTER TABLE ingredientes MODIFY id_ingredientes int not null AUTO_INCREMENT;
ALTER TABLE modo_preparo MODIFY id_passo        int not null AUTO_INCREMENT;
ALTER TABLE tags         MODIFY id_tags         int not null AUTO_INCREMENT;
ALTER TABLE comentarios  MODIFY id_comentario   int not null AUTO_INCREMENT;

-- foreign key

ALTER TABLE receitas ADD CONSTRAINT FK_receitas_usuario
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE receitas ADD CONSTRAINT FK_receitas_categoria
FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria);

ALTER TABLE modo_preparo ADD CONSTRAINT FK_preparo_receita
FOREIGN KEY (id_receita) REFERENCES receitas(id_receita)
ON DELETE CASCADE;

ALTER TABLE receita_ingredientes ADD CONSTRAINT FK_RI_receita
FOREIGN KEY (id_receita) REFERENCES receitas(id_receita)
ON DELETE CASCADE;

ALTER TABLE receita_ingredientes ADD CONSTRAINT FK_RI_ingrediente
FOREIGN KEY (id_ingredientes) REFERENCES ingredientes(id_ingredientes);

ALTER TABLE receita_tags ADD CONSTRAINT FK_RT_tags
FOREIGN KEY (id_tags) REFERENCES tags(id_tags);

ALTER TABLE receita_tags ADD CONSTRAINT FK_RT_receita
FOREIGN KEY (id_receita) REFERENCES receitas(id_receita)
ON DELETE CASCADE;

ALTER TABLE comentarios ADD CONSTRAINT FK_COM_usuario
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE comentarios ADD CONSTRAINT FK_COM_receita
FOREIGN KEY (id_receita) REFERENCES receitas(id_receita)
ON DELETE CASCADE;

ALTER TABLE avaliacoes ADD CONSTRAINT FK_AVAL_usuario
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE avaliacoes ADD CONSTRAINT FK_AVAL_receita
FOREIGN KEY (id_receita) REFERENCES receitas(id_receita)
ON DELETE CASCADE;

ALTER TABLE favoritos ADD CONSTRAINT FK_FAV_usuario
FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE favoritos ADD CONSTRAINT FK_FAV_receita
FOREIGN KEY (id_receita) REFERENCES receitas(id_receita)
ON DELETE CASCADE;

-- inserção de dados
USE blog_comida;

INSERT INTO usuarios (nome, email, senha)
VALUES ('Mariazinha', 'minimaria@email.com', 'Maria123');

INSERT INTO usuarios (nome, email, senha)
VALUES ('Josefina', 'finafina@email.com', 'Fima123');

INSERT INTO usuarios (nome, email, senha)
VALUES ('Joao Naldo', 'joaon@email.com', 'Joao123');

INSERT INTO categorias (nome, descricao)
VALUES ('Sobremesa', 'Doces e mini lanches para pós refeição');

INSERT INTO categorias (nome, descricao)
VALUES ('Salgados', 'Lanches salgados para fim da tarde');

INSERT INTO categorias (nome, descricao)
VALUES ('Bolos', 'Assados para lanche');

SELECT * FROM usuarios;


SELECT r.*, c.nome AS categoria
FROM receitas r
JOIN categorias c ON c.id_categoria = r.id_categoria;