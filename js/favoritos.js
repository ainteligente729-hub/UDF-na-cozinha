document.addEventListener("DOMContentLoaded", async function () {
    const lista = document.getElementById("lista-favoritos");
    const token = localStorage.getItem("token");

    if (!token) {
        lista.textContent = "Faça login para ver seus favoritos.";
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/api/favoritos", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!resposta.ok) {
            throw new Error("Erro ao buscar favoritos");
        }

        const favoritos = await resposta.json();
        console.log("Dados dos favoritos:", favoritos);
        lista.innerHTML = "";

        if (favoritos.length === 0) {
            lista.textContent = "Você ainda não tem receitas favoritas. ❤️";
            return;
        }

        favoritos.forEach(function (receita) {
            const card = document.createElement("article");
            card.classList.add("card-favorito");

const imagem = document.createElement("img");

if (receita.imagem_capa) {
    imagem.src = receita.imagem_capa.startsWith("/")
        ? "http://localhost:3000" + receita.imagem_capa
        : receita.imagem_capa;
    imagem.alt = receita.titulo;
} else {
    imagem.alt = "Imagem não disponível";
    imagem.style.display = "none";
}
 

const botaoFavorito = document.createElement("button");

botaoFavorito.type = "button";
botaoFavorito.textContent = "❤️";
botaoFavorito.className = "botao-remover-favorito";
botaoFavorito.title = "Remover dos favoritos";
botaoFavorito.setAttribute("aria-label", "Remover dos favoritos");

botaoFavorito.addEventListener("click", async function () {
    botaoFavorito.disabled = true;

    try {
        const resposta = await fetch(
            `http://localhost:3000/api/receitas/${receita.id_receita}/favorito`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível remover o favorito.");
        }

        card.remove();

        if (lista.querySelectorAll(".card-favorito").length === 0) {
            lista.textContent = "Você ainda não tem receitas favoritas. ❤️";
        }

    } catch (erro) {
        console.error(erro);
        alert("Erro ao remover a receita dos favoritos.");
        botaoFavorito.disabled = false;
    }
});


            const titulo = document.createElement("h3");
            titulo.textContent = receita.titulo;

            const descricao = document.createElement("p");
            descricao.textContent = receita.descricao || "";

            const link = document.createElement("a");
            link.href = `receita.html?id=${receita.id_receita}`;
            link.textContent = "Ver receita";

          card.append(imagem, botaoFavorito, titulo, descricao, link);
            lista.appendChild(card);
        });

    } catch (erro) {
        console.error(erro);
        lista.textContent = "Não foi possível carregar seus favoritos.";
    }
});