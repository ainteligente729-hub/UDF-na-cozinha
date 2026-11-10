
document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");
    const nome = localStorage.getItem("nomeUsuario");

    const nomePerfil = document.getElementById("nome-perfil");
    const lista = document.getElementById("lista-receitas-perfil");

    // Verifica se o usuário está logado
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Mostra o nome do usuário logado
    nomePerfil.textContent =
        nome && nome !== "undefined" && nome !== "null"
            ? nome
            : "Usuário";

    // FOTO DE PERFIL
    const inputFoto = document.getElementById("input-foto");
    const fotoPerfil = document.getElementById("foto-perfil");
    const avatarPadrao = document.getElementById("avatar-padrao");

    const chaveFoto = "fotoPerfil:" + nome;

    function mostrarFoto(foto) {
        fotoPerfil.src = foto;
        fotoPerfil.hidden = false;
        avatarPadrao.hidden = true;
    }

    // Recupera a foto salva
    const fotoSalva = localStorage.getItem(chaveFoto);

    if (fotoSalva) {
        mostrarFoto(fotoSalva);
    }

    // Permite escolher ou trocar a foto
    inputFoto.addEventListener("change", function () {

        const arquivo = inputFoto.files[0];

        if (!arquivo) return;

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {
            alert("Escolha uma imagem JPG, PNG ou WEBP.");
            return;
        }

        if (arquivo.size > 1024 * 1024) {
            alert("A imagem deve ter no máximo 1 MB.");
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function () {
            try {
                localStorage.setItem(chaveFoto, leitor.result);
                mostrarFoto(leitor.result);
            } catch (erro) {
                console.error(erro);
                alert("Não foi possível salvar a foto.");
            }
        };

        leitor.readAsDataURL(arquivo);
    });

    // CARREGA AS RECEITAS DO USUÁRIO
    async function carregarReceitasPerfil() {

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
                throw new Error("Erro ao carregar receitas.");
            }

            const receitas = await resposta.json();

            lista.innerHTML = "";

            if (receitas.length === 0) {
                lista.textContent =
                    "Você ainda não publicou nenhuma receita.";
                return;
            }

            receitas.forEach(function (receita) {

                const card = document.createElement("article");
                card.className = "card-receita";

                if (receita.imagem_capa) {
                    const imagem = document.createElement("img");

                    imagem.src = receita.imagem_capa.startsWith("/")
                        ? "http://localhost:3000" + receita.imagem_capa
                        : receita.imagem_capa;

                    imagem.alt = receita.titulo;
                    card.appendChild(imagem);
                }

                const titulo = document.createElement("h3");
                titulo.textContent = receita.titulo;

                const descricao = document.createElement("p");
                descricao.textContent = receita.descricao || "";

                const link = document.createElement("a");
                link.href =
                    `receita.html?id=${receita.id_receita}`;
                link.textContent = "Ver receita";

                const editar = document.createElement("a");
                editar.href =
                    `editar-receita.html?id=${receita.id_receita}`;
                editar.textContent = "✏️ Editar";
                editar.className = "botao-editar-perfil";

                card.append(titulo, descricao, link, editar);

                lista.appendChild(card);
            });

        } catch (erro) {
            console.error(erro);
            lista.textContent =
                "Não foi possível carregar suas receitas.";
        }
    }

    carregarReceitasPerfil();

});
