
const lista = document.getElementById("lista-minhas-receitas");

async function carregarMinhasReceitas() {
    const token = localStorage.getItem("token");

    if (!token) {
        lista.textContent = "Faça login para ver suas receitas.";
        return;
    }

    try {
        const resposta = await fetch(
            "http://localhost:3000/api/minhas-receitas",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar receitas.");
        }

        const receitas = await resposta.json();
        lista.innerHTML = "";

        if (receitas.length === 0) {
            lista.textContent = "Você ainda não publicou receitas.";
            return;
        }

        receitas.forEach(function (receita) {
            const card = document.createElement("article");
            card.className = "card-receita";

            const titulo = document.createElement("h2");
            titulo.textContent = receita.titulo;

            const descricao = document.createElement("p");
            descricao.textContent = receita.descricao || "";

            const link = document.createElement("a");
            link.href = `receita.html?id=${receita.id_receita}`;
            link.textContent = "Ver receita";

            if (receita.imagem_capa) {
                const imagem = document.createElement("img");
                imagem.src = receita.imagem_capa;
                imagem.alt = receita.titulo;
                imagem.style.maxWidth = "250px";
                card.appendChild(imagem);
            }

            const botaoEditar = document.createElement("a");
botaoEditar.textContent = "✏️ Editar";
botaoEditar.href = `editar-receita.html?id=${receita.id_receita}`;

const botaoExcluir = document.createElement("button");
botaoExcluir.type = "button";
botaoExcluir.textContent = "🗑️ Excluir";

botaoExcluir.addEventListener("click", async function () {
    const confirmar = confirm(
        `Tem certeza que deseja excluir a receita "${receita.titulo}"?`
    );

    if (!confirmar) return;

    const token = localStorage.getItem("token");

    try {
        const resposta = await fetch(
            `http://localhost:3000/api/receitas/${receita.id_receita}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível excluir a receita.");
        }

        alert("Receita excluída com sucesso!");
        carregarMinhasReceitas();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao excluir a receita.");
    }
});



card.append(titulo, descricao, link, botaoEditar, botaoExcluir);
lista.appendChild(card);
        });

    } catch (erro) {
        console.error(erro);
        lista.textContent = "Não foi possível carregar suas receitas.";
    }
}

carregarMinhasReceitas();
