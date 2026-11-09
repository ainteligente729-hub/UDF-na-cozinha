
const parametros = new URLSearchParams(window.location.search);
const idReceita = parametros.get("id");

const mensagem = document.getElementById("mensagem");
const conteudo = document.getElementById("conteudo-receita");

function preencherTexto(id, texto) {
    document.getElementById(id).textContent = texto;
}

async function carregarDetalhes() {
    if (!idReceita) {
        mensagem.textContent = "Nenhuma receita selecionada.";
        return;
    }

    try {
        const resposta = await fetch(
            `http://localhost:3000/api/receitas/${encodeURIComponent(idReceita)}`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível encontrar a receita.");
        }

        const receita = await resposta.json();

        preencherTexto("titulo-receita", receita.titulo);
        preencherTexto("descricao-receita", receita.descricao || "");
        preencherTexto("autor-receita", "Autor: " + (receita.autor || "Não informado"));
        preencherTexto("categoria-receita", "Categoria: " + (receita.categoria || "Não informada"));
        preencherTexto("dificuldade-receita", "Dificuldade: " + (receita.dificuldade || "Não informada"));

        const preparo = Number(receita.tp_prep) || 0;
        const cozimento = Number(receita.tp_cozi) || 0;

        preencherTexto(
            "tempo-receita",
            preparo + cozimento > 0
                ? `Tempo total: ${preparo + cozimento} minutos`
                : "Tempo não informado"
        );

        preencherTexto(
            "rendimento-receita",
            receita.rendimento
                ? `Rendimento: ${receita.rendimento} porções`
                : "Rendimento não informado"
        );

        const imagem = document.getElementById("imagem-receita");

        if (receita.imagem_capa) {
            imagem.src = receita.imagem_capa.startsWith("/")
                ? "http://localhost:3000" + receita.imagem_capa
                : receita.imagem_capa;

            imagem.alt = receita.titulo;
        } else {
            imagem.hidden = true;
        }

        const listaIngredientes = document.getElementById("ingredientes-receita");
        listaIngredientes.innerHTML = "";

        (receita.ingredientes || []).forEach(ingrediente => {
            const item = document.createElement("li");

            item.textContent = [
                ingrediente.quantidade,
                ingrediente.un_medida,
                ingrediente.nome
            ].filter(valor => valor !== null && valor !== undefined && valor !== "").join(" ");

            listaIngredientes.appendChild(item);
        });

        const listaPassos = document.getElementById("passos-receita");
        listaPassos.innerHTML = "";

        (receita.passos || []).forEach(passo => {
            const item = document.createElement("li");
            item.textContent = passo.desc_passo;
            listaPassos.appendChild(item);
        });

        mensagem.hidden = true;
        conteudo.hidden = false;

    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
        mensagem.textContent = "Erro ao carregar a receita.";
    }
}

carregarDetalhes();
