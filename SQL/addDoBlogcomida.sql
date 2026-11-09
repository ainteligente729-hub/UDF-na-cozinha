USE blog_comida;

SHOW TABLES;

DESCRIBE usuarios;

INSERT INTO usuarios (nome, email, senha, perfil)
VALUES
  ('Mariana', 'mariana123@email.com', 'Mari123', 'admin'),
  ('Lucas', 'lucassga@email.com', 'Laksys34', 'autor'),
  ('Fernanda', 'fefe@email.com', 'dsjygas', 'leitor');
  
  INSERT INTO categorias (nome)
VALUES ('Café da manhã'), ('Prato de Jantar');

SELECT * FROM usuarios;
SELECT * FROM categorias;
SELECT * FROM receitas;

INSERT INTO receitas (id_usuario, id_categoria, titulo, descricao, tp_prep, tp_cozi, rendimento, calorias, dificuldade)
VALUES
  (1, 6, 'Queijo minas grelhado', 'Como pode algo tão simples ser tão delicioso? É isso que você vai pensar desde a primeira garfada. Com goiabada, doce de leite, ou puro. Um sucesso sempre.', 2, 5, 2, 320, 'Facil'),
  (2, 3, 'Bolo de cenoura', 'Confira essa clássica receita de bolo de cenoura simples e fácil, nossa campeã de acessos!', 40, 40, 8, 239, 'Facil');
  
  INSERT INTO comentarios (id_receita, id_usuario, texto)
VALUES (1, 2, 'Muito bom recomendo vou fazer de novo');

INSERT INTO avaliacoes (id_receita, id_usuario, nota)
VALUES (1, 3, 5);
INSERT INTO avaliacoes (id_receita, id_usuario, nota)
VALUES (1, 4, 1);
INSERT INTO avaliacoes (id_receita, id_usuario, nota)
VALUES (1, 6, 3);

INSERT INTO favoritos (id_receita, id_usuario)
VALUES (2, 3);

INSERT INTO ingredientes (nome)
VALUES
  ('Queijo minas'),
  ('Azeite'),
  ('Orégano'),
  ('Sal'),
  ('Cenoura'),
  ('Ovo'),
  ('Óleo'),
  ('Açúcar'),
  ('Farinha de trigo'),
  ('Fermento em pó');
  
  INSERT INTO receita_ingredientes (id_receita, id_ingredientes, quantidade, un_medida)
VALUES
  (1, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Queijo minas'), 400,  'g'),
  (1, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Azeite'),       1,    'colher de sopa'),
  (1, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Orégano'),      0.5,  'colher de chá'),
  (1, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Sal'),          1,    'pitada');
  
  INSERT INTO receita_ingredientes (id_receita, id_ingredientes, quantidade, un_medida)
VALUES
  (2, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Cenoura'),          3,   'unidade'),
  (2, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Ovo'),              4,   'unidade'),
  (2, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Óleo'),             1,   'xícara'),
  (2, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Açúcar'),           2,   'xícara'),
  (2, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Farinha de trigo'), 2.5, 'xícara'),
  (2, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Fermento em pó'),   1,   'colher de sopa'),
  (2, (SELECT id_ingredientes FROM ingredientes WHERE nome = 'Sal'),              1,   'pitada');
  
  SELECT r.titulo, i.nome AS ingrediente, ri.quantidade, ri.un_medida
FROM receitas r
JOIN receita_ingredientes ri ON ri.id_receita = r.id_receita
JOIN ingredientes i ON i.id_ingredientes = ri.id_ingredientes
ORDER BY r.id_receita;

