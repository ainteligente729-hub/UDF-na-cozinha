# 🍳 UDF na Cozinha

Projeto acadêmico e prático desenvolvido para compartilhamento, gestão e publicação de receitas culinárias, integrando front-end intuitivo com um back-end robusto e banco de dados relacional.

📖 O que é o UDF na Cozinha

O UDF na Cozinha é uma plataforma/blog interativo voltado para a comunidade culinária. O sistema permite cadastrar, editar, favoritar e gerenciar receitas, além de interagir com a comunidade através de comentários, mídias, sistema de afiliados e geração de PDF de receitas.

🚀 Tecnologias Utilizadas

Front-end: HTML5, CSS3, JavaScript (ES6+)

Back-end: Node.js, Express.js

Banco de Dados: MySQL

Outras Dependências:

dotenv (gestão de variáveis de ambiente)

cors (liberação de requisições)

multer (upload e manipulação de arquivos/imagens)

jsonwebtoken / bcryptjs (autenticação e segurança)

# 🛠️ Processo de Criação do Blog

🗄️ Banco de Dados

Iniciando com o banco de dados, que foi feito como base para o projeto: inicialmente foi modelado com 8 tabelas e posteriormente alterado e atualizado. Atualmente conta com 11 tabelas com o sistema totalmente integrado e funcional. Os scripts SQL estão localizados na pasta /SQL (BD_BLOGCOMIDA.sql e addDoBlogcomida.sql).

Última atualização por Ana Beatriz.

⚙️ Back-end

Desenvolvido em Node.js utilizando o framework Express. A arquitetura foi organizada em rotas modulares (/routes), serviços (/services), utilitários (/utils) e middlewares (auth.js, upload.js, erro.js) para tratamento centralizado de erros e controle de acesso.

🎨 Front-end

Construído utilizando HTML5 estruturado, folhas de estilo CSS personalizadas (estilos.css) e scripts JavaScript modulares (/js) responsáveis por realizar a integração com as APIs REST do servidor.

🔗 Processo de Integração

A integração entre front-end e back-end ocorre através de chamadas HTTP (Fetch API) consumindo as rotas REST parametrizadas do Express, com envio de dados JSON e suporte a formulários multipart (Multipart/form-data) para envio de mídias.

🤖 Utilização de IA no Projeto

Nossa equipe utilizou ferramentas de Inteligência Artificial ao longo do desenvolvimento para otimização de código, refatoração e resolução de erros:

Claude: Utilizado durante o processo de integração para diagnóstico de erros de compilação, ajuste de rotas e padronização das respostas HTTP.

ChatGPT: Utilizado no suporte à estruturação inicial das regras de negócio e geração de dados para testes.

Gemini: Utilizado na estruturação, organização, validação técnica e formatação final da documentação completa deste arquivo README.md, incluindo a padronização das orientações de instalação, dependências e execução do projeto Node.js/Express.

# 📦 Instalação e Configuração

Pré-requisitos

Node.js (Versão 16.x ou superior recomendada)

MySQL Server ativo

1️⃣ Configuração do Banco de Dados

Abra o seu gerenciador MySQL (ex: MySQL Workbench ou phpMyAdmin).

Execute o script contido em SQL/BD_BLOGCOMIDA.sql para criar o banco de dados e as 11 tabelas.

(Opcional) Execute o script SQL/addDoBlogcomida.sql caso deseje popular a base com dados iniciais de teste.

2️⃣ Configuração do Back-end

Navegue até a pasta do back-end pelo terminal:

cd back-end


Instale as dependências do projeto Node.js:

npm install


Configure as variáveis de ambiente:

Duplique o arquivo .env.example para .env (ou crie um arquivo .env na raiz da pasta back-end).

Ajuste os parâmetros de conexão com o banco de dados e chave secreta:

PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=blogcomida
JWT_SECRET=sua_chave_secreta


▶️ Execução da Aplicação

Iniciar o servidor Back-end

Na pasta back-end, execute o comando:

npm start


(ou node server.js / npx nodemon server.js se disponível).

O servidor iniciará por padrão em http://localhost:3000.

Acessar o Front-end

Abra a pasta htmls/ no seu navegador ou utilize a extensão Live Server (no VS Code) a partir do arquivo htmls/index.html.

Certifique-se de que o back-end está rodando para que as requisições de cadastro, login e listagem de receitas funcionem corretamente.

 Processo de Criação do Blog

🗄️ Banco de Dados

Iniciando com o banco de dados, que foi feito como base para o projeto: inicialmente foi modelado com 8 tabelas e posteriormente alterado e atualizado. Atualmente conta com 11 tabelas com o sistema totalmente integrado e funcional. Os scripts SQL estão localizados na pasta /SQL (BD_BLOGCOMIDA.sql e addDoBlogcomida.sql).

Última atualização por Ana Beatriz, 09/11/2026.

⚙️ Back-end

O servidor foi construído em Node.js utilizando a estrutura do framework Express.js. A arquitetura foi estruturada de forma modular para garantir manutenibilidade e escalabilidade:

Servidor e Configuração: Desenvolvido no arquivo principal server.js com gerenciamento de conexões assíncronas ao banco MySQL via config/db.js.

Rotas Modulares (/routes): Separação das regras de negócio por entidade (auth.js, receitas.js, comunidade.js, afiliados.js, compras.js, midia.js, pdf.js e seo.js).

Middlewares (/middlewares):

auth.js: Verificação e controle de autenticação via tokens JWT.

upload.js: Gerenciamento e armazenamento seguro de arquivos de imagem enviados pelos usuários via multer.

erro.js: Captura e padronização global de erros das requisições HTTP.

Serviços e Utilidades (/services e /utils): Funções especializadas para formatação de slugs, unidades de medida, SEO dinâmico, geração de HTML para exportação em PDF e validação de regras de receitas.

🎨 Front-end

O front-end foi construído focando na usabilidade da comunidade culinária:

Interface e Estilização: Estruturado em páginas HTML5 semanticamente organizadas (/htmls) e estilizadas via estilos.css, oferecendo layout responsivo e limpo.

Módulos de Script (/js): Desenvolvimento de scripts client-side dedicados para cada tela (login.js, cadastro.js, receitas-home.js, detalhes-receita.js, cadastro-receita.js, editar-receita.js, minhas-receitas.js, favoritos.js e menu.js).

Experiência do Usuário (UX): Telas dinâmicas para busca e filtragem de pratos, visualização detalhada com ingredientes e modo de preparo, e painel exclusivo do usuário para gerenciamento de suas próprias receitas.

🔗 Processo de Integração

A integração entre a interface do usuário (Front-end) e a API (Back-end) foi realizada através da Fetch API assíncrona (async/await):

Autenticação: O cliente consome /routes/auth.js enviando credenciais e armazenando o token JWT gerado (no localStorage ou cookies) para autenticar requisições subsequentes no cabeçalho Authorization: Bearer <token>.

Envio de Dados e Imagens: Os formulários de receitas utilizam FormData para integrar o envio simultâneo de dados da receita (JSON) e imagens de pratos via requisições multipart/form-data.

Respostas Dinâmicas: Tratamento de status HTTP no front-end para exibição de feedbacks em tempo real (sucesso no cadastro, erros de validação ou redirecionamentos de acesso).

🤖 Utilização de IA no Projeto

Nossa equipe utilizou ferramentas de Inteligência Artificial ao longo do desenvolvimento para otimização de código, refatoração e resolução de erros:

🟣 Claude

O Claude foi utilizado ativamente durante a fase de integração front-end/back-end para diagnosticar e solucionar os seguintes erros de compilação e execução:

Erro de Política de CORS (Access-Control-Allow-Origin): Bloqueio de requisições do front-end ao tentar consumir rotas do Express localmente. Solucionado com a configuração adequada do middleware cors().

Falha na Captura de Formulários Multipart (Multer Error / Unsupported Media Type): Erro ao enviar imagens de receitas junto a dados de texto. Solucionado ajustando a ordem dos campos no upload.single('imagem') dentro das rotas de receita.

Erros de Sintaxe SQL em Joins Complexos: Exceções de sintaxe na consulta MySQL ao tentar listar receitas juntamente com seus autores e categorias. Solucionado com a reestruturação e parametrização das queries SQL.

Tratamento de Tokens Inválidos/Expirados (JWT Auth): Exceções não capturadas quando o token do usuário expirava, quebrando o fluxo do front-end. Solucionado adicionando tratamento com try/catch centralizado no middleware auth.js.

🟢 ChatGPT

Utilizado no suporte à modelagem conceitual das regras de negócio do banco de dados e na criação dos dados fictícios iniciais para os testes unitários e de integração (addDoBlogcomida.sql).

🔵 Gemini

O Gemini atuou como copiloto na estruturação, validação técnica e documentação do projeto:

Organização e escrita completa deste arquivo README.md.

Padronização do passo a passo de instalação das dependências Node.js e execução da API Express.

Formatação estruturada em Markdown de todas as rotas, regras de integração e histórico de correções da aplicação.

# 📄 Licença

Este projeto é de cunho acadêmico e está sob a licença descrita no arquivo LICENSE.
