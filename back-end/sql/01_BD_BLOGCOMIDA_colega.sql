CREATE DATABASE blog_comida;
USE blog_comida;

CREATE TABLE receitas
(
	id_receita		int,
	id_usuario		int not null,
    id_categoria	int not null,
	titulo			varchar(60)	 not null,
    descrição		text,
    tp_prep			int,
    tp_cozi			int,
	rendimento		int,
    calorias		int,
    dificuldade		enum('facil','medio','dificil') not null,
    dt_publicacao		datetime
);

CREATE TABLE ingredientes
(
	nome					varchar(100) not null,
	id_ingredientes			int
);

CREATE TABLE modo_preparo
(
	id_passo		int,
    id_receita		int not null,
	ordem			int	 not null,
    desc_passo		text
);

CREATE TABLE categorias
(
	id_categoria	int,
    nome			varchar(80)		not null,
    descricao		varchar(55)
);

CREATE TABLE usuarios
(
	id_usuario		int,
    nome			varchar(100)	not null,
    email			varchar(150)	not null,
    senha			varchar(100)	not null,
    perfil			enum('admin','autor','leitor') not null default ('leitor'),
    dt_cadastro		datetime		not null
);

CREATE TABLE receita_ingredientes
(
	id_receita			int		not null,
    id_ingredientes		int		not null,
    quantidade			decimal(8,2) not null,
    un_medida			varchar(30)	not null
);

CREATE TABLE tags
(
	id_tags		int,
    nome		varchar(50)	not null
);

CREATE TABLE receita_tags
(
	id_tags		int		not null,
    id_receita		int	not null
);

CREATE TABLE comentarios
(
	id_comentario		int,
    id_receita			int,
    id_usuario			int,
    texto				text,
    dt_comentario		datetime
);

CREATE TABLE avaliacoes
(
    id_receita			int,
    id_usuario			int,
	nota				int not null,
	dt_avaliacao		datetime
);

CREATE TABLE favoritos
(
    id_receita			int,
    id_usuario			int,
    dt_fav				datetime
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