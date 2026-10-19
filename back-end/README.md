# UDF na Cozinha: Backend 

Stack: Node.js + Express 5 + MySQL (mysql2), a mesma do projeto. Todas as rotas foram testadas
de ponta a ponta (`npm test`) contra o bd da helena  + a migração abaixo.

| Parte | Arquivo | O que faz |
|---|---|---|
| 2 | `routes/receitas.js` | Busca avançada, conversor de porções, criar/editar/excluir receitas |
| 3 | `routes/midia.js`, `services/imagem.js`, `services/storage.js` | Upload, otimização (WebP, 3 tamanhos), Cloudinary ou disco |
| 6 | `routes/seo.js`, `utils/seo.js` | JSON-LD (Recipe), página HTML com SEO, `sitemap.xml`, `robots.txt` |
| 7 | `routes/compras.js`, `routes/afiliados.js`, `routes/pdf.js` | Lista de compras, afiliados com contagem de cliques, PDF |

## Como rodar

1. Banco (nesta ordem). **Use `--default-character-set=utf8mb4`**:
   ```bash
   mysql -u root -p --default-character-set=utf8mb4 < sql/01_BD_BLOGCOMIDA_colega.sql
   mysql -u root -p --default-character-set=utf8mb4 < sql/02_migracao_parte2.sql
   ```
   (No Workbench, abra e execute os arquivos; o 01 é o original da colega, sem alterações.)
2. `cp .env.example .env` e preencha `DB_PASSWORD` e `JWT_SECRET` (**o mesmo segredo do login da colega**).
3. `npm install` e depois `npm run dev`.
4. `npm test` roda o teste de ponta a ponta (apaga os dados das tabelas; use banco de desenvolvimento).

## O que a migração (`02`) 

- **AUTO_INCREMENT** nos ids. No script original eles são `int` simples; sem isso nenhum INSERT funciona.
- `receitas`: colunas `slug`, `imagem_capa`, `video_url`, `dt_atualizacao`.
- `receita_ingredientes`: coluna `ordem`. `ingredientes.nome` e `tags.nome` passam a ser únicos.
- Tabelas novas: `receita_imagens` e `afiliados`.

## Integração com a partes da Helena 

- **Auth (parte 4):** `middlewares/auth.js` é uma versão mínima (valida JWT e RBAC). O token precisa ter
  `{ id_usuario, perfil }` no payload (`id` também é aceito). Se ela já tem um middleware, é só trocar o `require`
  nas rotas; o importante é preencher `req.usuario = { id_usuario, perfil }`.
- **Comunidade (parte 5):** a busca por `nota_min`, a nota média no JSON-LD e a lista de compras leem as tabelas
  `avaliacoes` e `favoritos` dela. Não escrevo nelas.
- Em `server.js` já deixei comentados os `app.use` das rotas dela.
- Se ela já tem `db.js`/`server.js`, reaproveitem um só; `config/db.js` exporta `pool` e `comTransacao`.

## Endpoints

`[auth]` = precisa de `Authorization: Bearer <token>`. Criar/editar/excluir: perfil `autor` (só as próprias) ou `admin` (todas).

**Parte 2**
- `GET /api/filtros`: categorias, tags e dificuldades (para montar os filtros no front)
- `GET /api/receitas/busca` (ou `/api/receitas`). Parâmetros:
  `q`, `categoria` (id ou nome), `tag=vegano,rapido` (todas), `tempo_max` (min, preparo+cozimento),
  `dificuldade=facil|medio|dificil`, `nota_min=1..5`, `ingredientes=frango,batata` com `modo=todos|qualquer`,
  `sem_ingredientes=leite` (restrições), `ordem=recentes|antigas|nota|tempo|titulo`, `pagina`, `limite` (máx. 50)
- `GET /api/receitas/:idOuSlug`: detalhe completo; `?porcoes=8` ou `?multiplicador=2` recalcula os ingredientes (1000 g viram 1 kg)
- `GET /api/receitas/:idOuSlug/porcoes?porcoes=8`: só o conversor
- `POST /api/receitas` `[auth]`, `PUT /api/receitas/:id` `[auth]` (parcial; ingredientes/passos/tags substituem a lista), `DELETE /api/receitas/:id` `[auth]`

```json
{
  "titulo": "Frango com Batata Rústica", "id_categoria": 1, "dificuldade": "facil",
  "descricao": "Clássico de forno.", "tp_prep": 15, "tp_cozi": 45, "rendimento": 4, "calorias": 520,
  "video_url": "https://youtube.com/watch?v=...",
  "ingredientes": [{ "nome": "Frango", "quantidade": 1, "un_medida": "kg" }],
  "passos": ["Tempere o frango.", "Asse por 45 minutos."],
  "tags": ["Rápido", "Sem Glúten"]
}
```

**Parte 3**
- `POST /api/receitas/:id/imagens` `[auth]`: `multipart/form-data`, campo `imagens` (até 10, 8 MB cada, JPG/PNG/WebP/AVIF), campos opcionais `alt`, `principal=true`.
  Gera WebP em 1600/800/400 px, remove EXIF/GPS e corrige a rotação. A primeira imagem vira capa automaticamente.
- `GET /api/receitas/:id/imagens` · `PATCH /api/imagens/:id/principal` `[auth]` · `PATCH /api/imagens/:id` (`{alt}`) `[auth]` · `DELETE /api/imagens/:id` `[auth]`
- **Cloudinary:** `STORAGE_DRIVER=cloudinary` e `CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD` no `.env`. Padrão: disco local (`/uploads`).
  A API do Cloudinary **não foi testada aqui** (sem credenciais); o fluxo local foi.

**Parte 6**
- `GET /receita/:slug`: HTML com `<title>`, meta description, canonical, Open Graph e **JSON-LD** (Recipe com imagem, tempos ISO 8601, ingredientes, passos, calorias, nota/avaliações e vídeo)
- `GET /api/receitas/:idOuSlug/schema`: só o JSON-LD
- `GET /sitemap.xml` (cache de 10 min, com imagens) · `GET /robots.txt`
- Defina `SITE_URL` com o domínio real; ele entra no sitemap, canonical e JSON-LD. Valide em https://search.google.com/test/rich-results

**Parte 7**
- `GET /api/lista-compras` `[auth]`: consolida os ingredientes dos **favoritos** do usuário. Soma por ingrediente e unidade (kg+g, l+ml). `?receitas=1,2` restringe, `?formato=texto` devolve texto para copiar
- `POST /api/lista-compras` `[auth]`: `{ "receitas": [{ "id_receita": 3, "porcoes": 8 }] }`
- Afiliados: `GET /api/receitas/:id/afiliados`, `POST/PUT/DELETE /api/afiliados` `[auth]`, `GET /api/receitas/:id/afiliados/estatisticas` `[auth]`.
  Os links públicos saem como `/go/:id` (redireciona, conta o clique, `noindex`); na página use `rel="sponsored nofollow"`.
  Só aceita URLs `http(s)`. Link global (sem receita): só admin.
- `GET /api/receitas/:idOuSlug/pdf` (`?porcoes=8`, `?download=1`): PDF A4 limpo, sem imagens (economiza tinta)

## Observações

- Os testes rodaram em **MariaDB 10.11**; a sintaxe usada é compatível com MySQL 8.
- O `slug` não muda ao editar o título (para não quebrar links e SEO).
- `calorias` é guardada como um valor da receita e **não** escala com as porções.
