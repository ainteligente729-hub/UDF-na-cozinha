
const API_URL = "http://localhost:3000/api/receitas";

const lista = document.getElementById("lista-receitas");
const formularioBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");

// Cria os cards das receitas na página
function exibirReceitas(receitas) {
    lista.innerHTML = "";

    if (receitas.length === 0) {
        lista.innerHTML = "<p>Nenhuma receita encontrada.</p>";
        return;
    }

    receitas.forEach((receita) => {
        const card = document.createElement("article");
        card.className = "card-receita";

     const imagem = document.createElement("img");

if (receita.imagem_capa) {
    imagem.src = receita.imagem_capa;
    imagem.alt = receita.titulo || "Receita";
} else {
    imagem.src = "";
    imagem.alt = "Imagem não disponível";
    imagem.style.display = "none";
}
const avisoImagem = document.createElement("p");

avisoImagem.textContent = "📷 Imagem não disponível";
avisoImagem.style.textAlign = "center";
avisoImagem.style.padding = "50px 10px";
avisoImagem.style.color = "#777";

if (receita.imagem_capa) {
    avisoImagem.style.display = "none";
}

        const titulo = document.createElement("h3");
        titulo.textContent = receita.titulo || "Sem título";

        const descricao = document.createElement("p");
        descricao.textContent = receita.descricao || "Sem descrição.";

        const dificuldade = document.createElement("p");
        dificuldade.textContent =
            "Dificuldade: " + (receita.dificuldade || "Não informada");

        const link = document.createElement("a");
        link.href = `htmls/receita.html?id=${receita.id_receita}`;
        link.textContent = "Ver receita";

        card.append(
    receita.imagem_capa ? imagem : avisoImagem,
    titulo,
    descricao,
    dificuldade,
    link
);
        lista.appendChild(card);
    });
}

// Consulta a API e exibe os resultados
async function buscarReceitas(url) {
    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar receitas");
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados.resultados)) {
            throw new Error("Formato de resposta inesperado");
        }

        exibirReceitas(dados.resultados);

    } catch (erro) {
        console.error("Erro ao buscar receitas:", erro);
        lista.innerHTML = "<p>Não foi possível carregar as receitas.</p>";
    }
}

// Carrega todas as receitas ao abrir a página
function carregarReceitas() {
    buscarReceitas(API_URL);
}

// Pesquisa quando o usuário clica em Buscar
if (formularioBusca && campoBusca) {
    formularioBusca.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const pesquisa = campoBusca.value.trim();

        if (pesquisa === "") {
            carregarReceitas();
            return;
        }

        const urlBusca =
            `${API_URL}/busca?q=${encodeURIComponent(pesquisa)}`;

        buscarReceitas(urlBusca);
    });
}

carregarReceitas();
