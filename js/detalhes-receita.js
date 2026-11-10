
const parametros = new URLSearchParams(window.location.search);
const idReceita = parametros.get("id");

const mensagem = document.getElementById("mensagem");
const conteudo = document.getElementById("conteudo-receita");

function preencherTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
    }
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

    preencherTexto(
    "autor-receita",
    receita.autor || "Não informado"
);

        preencherTexto(
            "categoria-receita",
            "Categoria: " + (receita.categoria || "Não informada")
        );

        preencherTexto(
            "dificuldade-receita",
            "Dificuldade: " + (receita.dificuldade || "Não informada")
        );

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

        if (imagem) {
            if (receita.imagem_capa) {
                imagem.src = receita.imagem_capa.startsWith("/")
                    ? "http://localhost:3000" + receita.imagem_capa
                    : receita.imagem_capa;

                imagem.alt = receita.titulo;
                imagem.hidden = false;
            } else {
                imagem.hidden = true;
            }
        }

        const listaIngredientes =
            document.getElementById("ingredientes-receita");

        if (listaIngredientes) {
            listaIngredientes.innerHTML = "";

            (receita.ingredientes || []).forEach(ingrediente => {
                const item = document.createElement("li");

                item.textContent = [
                    ingrediente.quantidade,
                    ingrediente.un_medida,
                    ingrediente.nome
                ].filter(valor =>
                    valor !== null &&
                    valor !== undefined &&
                    valor !== ""
                ).join(" ");

                listaIngredientes.appendChild(item);
            });
        }

        const listaPassos =
            document.getElementById("passos-receita");

        if (listaPassos) {
            listaPassos.innerHTML = "";

            (receita.passos || []).forEach(passo => {
                const item = document.createElement("li");
                item.textContent = passo.desc_passo;
                listaPassos.appendChild(item);
            });
        }

        mensagem.hidden = true;
        conteudo.hidden = false;

    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
        mensagem.textContent = "Erro ao carregar a receita.";
    }
}

carregarDetalhes();

// FAVORITAR RECEITA

const botaoFavoritar = document.getElementById("btn-favoritar");

let estaFavoritada = false;

if (botaoFavoritar) {
    botaoFavoritar.addEventListener("click", async function () {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Você precisa fazer login.");
            return;
        }

        if (!idReceita) return;

        const estavaFavoritada = estaFavoritada;
        botaoFavoritar.disabled = true;

        try {
            const resposta = await fetch(
                `http://localhost:3000/api/receitas/${encodeURIComponent(idReceita)}/favorito`,
                {
                    method: estavaFavoritada ? "DELETE" : "POST",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            if (!resposta.ok) {
                throw new Error("Erro ao atualizar favorito.");
            }

            estaFavoritada = !estavaFavoritada;

            botaoFavoritar.textContent = estaFavoritada
                ? "♥ Receita favoritada"
                : "♡ Favoritar receita";

        } catch (erro) {
            console.error("Erro ao atualizar favorito:", erro);
            alert("Não foi possível atualizar o favorito.");
        } finally {
            botaoFavoritar.disabled = false;
        }
    });
}

async function verificarFavorito() {
    const token = localStorage.getItem("token");

    if (!token || !idReceita || !botaoFavoritar) return;

    try {
        const resposta = await fetch(
            "http://localhost:3000/api/favoritos",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        if (!resposta.ok) {
            throw new Error("Erro ao verificar favoritos.");
        }

        const favoritos = await resposta.json();

        estaFavoritada = favoritos.some(receita =>
            String(receita.id_receita) === String(idReceita)
        );

        botaoFavoritar.textContent = estaFavoritada
            ? "♥ Receita favoritada"
            : "♡ Favoritar receita";

    } catch (erro) {
        console.error("Erro ao verificar favorito:", erro);
    }
}

verificarFavorito();
