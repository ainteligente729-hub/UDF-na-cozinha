// ======================================================
// CADASTRO DE RECEITA
// ======================================================

// Arrays que vão guardar os ingredientes e os passos
const ingredientes = [];
const passos = [];


// ======================================================
// INGREDIENTES
// ======================================================

const botaoIngrediente = document.getElementById("adicionar-ingrediente");
const listaIngredientes = document.getElementById("lista-ingredientes");

botaoIngrediente.addEventListener("click", function () {

    const nome = document.getElementById("nome-ingrediente").value.trim();
    const quantidade = document.getElementById("quantidade-ingrediente").value;
    const unidade = document.getElementById("unidade-ingrediente").value.trim();

    // Verifica se todos os campos foram preenchidos
    if (nome === "" || quantidade === "" || unidade === "") {
        alert("Preencha todos os campos do ingrediente.");
        return;
    }

    // Cria o objeto do ingrediente
    const ingrediente = {
        nome: nome,
        quantidade: Number(quantidade),
        un_medida: unidade
    };

    // Adiciona o ingrediente ao array
    ingredientes.push(ingrediente);

    // Cria o elemento visual
    const item = document.createElement("div");
    item.classList.add("item-ingrediente");

    const texto = document.createElement("span");

    texto.textContent =
        nome + " - " + quantidade + " " + unidade;

    // Botão remover
 botaoRemover.addEventListener("click", function () {

    const indice = Array.from(
        listaPassos.children
    ).indexOf(item);

    if (indice !== -1) {
        passos.splice(indice, 1);
    }

    item.remove();

    atualizarNumeracaoPassos();
});

        // Descobre a posição do ingrediente no array
        const indice = ingredientes.indexOf(ingrediente);

        // Remove do array
        if (indice !== -1) {
            ingredientes.splice(indice, 1);
        }

        // Remove da tela
        item.remove();
    });

    item.appendChild(texto);
    item.appendChild(botaoRemover);

    listaIngredientes.appendChild(item);

    // Limpa os campos
    document.getElementById("nome-ingrediente").value = "";
    document.getElementById("quantidade-ingrediente").value = "";
    document.getElementById("unidade-ingrediente").value = "";
});


// ======================================================
// PASSOS DO MODO DE PREPARO
// ======================================================

const botaoPasso = document.getElementById("adicionar-passo");
const listaPassos = document.getElementById("lista-passos");

botaoPasso.addEventListener("click", function () {

    const descricao =
        document.getElementById("descricao-passo").value.trim();

    // Verifica se o passo foi preenchido
    if (descricao === "") {
        alert("Digite a descrição do passo.");
        return;
    }

    // Adiciona o passo ao array
    passos.push(descricao);

    // Cria o elemento visual
    const item = document.createElement("div");
    item.classList.add("item-passo");

    const textoPasso = document.createElement("span");

    textoPasso.textContent =
        "Passo " + passos.length + ": " + descricao;

    // Botão remover
    const botaoRemover = document.createElement("button");

    botaoRemover.type = "button";
    botaoRemover.textContent = "Remover";

    botaoRemover.addEventListener("click", function () {

        // Descobre o passo dentro do array
        const indice = passos.indexOf(descricao);

        // Remove do array
        if (indice !== -1) {
            passos.splice(indice, 1);
        }

        // Remove da tela
        item.remove();

        // Atualiza a numeração dos passos
        atualizarNumeracaoPassos();
    });

    item.appendChild(textoPasso);
    item.appendChild(botaoRemover);

    listaPassos.appendChild(item);

    // Limpa o campo
    document.getElementById("descricao-passo").value = "";
});


// ======================================================
// ATUALIZAR NUMERAÇÃO DOS PASSOS
// ======================================================

function atualizarNumeracaoPassos() {

    const itens = listaPassos.querySelectorAll(".item-passo");

    itens.forEach(function (item, indice) {

        const texto = item.querySelector("span");

        const descricao = passos[indice];

        texto.textContent =
            "Passo " + (indice + 1) + ": " + descricao;
    });
}


// ======================================================
// ENVIO DO FORMULÁRIO
// ======================================================

const formulario = document.getElementById("formulario-receita");

formulario.addEventListener("submit", async function (event) {

    // Impede o HTML de recarregar a página
    event.preventDefault();


    // ==================================================
    // PEGANDO OS DADOS DO FORMULÁRIO
    // ==================================================

    const titulo =
        document.getElementById("titulo").value.trim();

    const descricao =
        document.getElementById("descricao").value.trim();

    const tempoPreparo =
        document.getElementById("tempo-preparo").value;

    const tempoCozimento =
        document.getElementById("tempo-cozimento").value;

    const rendimento =
        document.getElementById("rendimento").value;

    const calorias =
        document.getElementById("calorias").value;

    const dificuldade =
        document.getElementById("dificuldade").value;

    const categoria =
        document.getElementById("categoria").value;


    // ==================================================
    // VALIDAÇÕES
    // ==================================================

    if (titulo === "") {
        alert("Informe o nome da receita.");
        return;
    }

    if (categoria === "") {
        alert("Selecione uma categoria.");
        return;
    }

    if (dificuldade === "") {
        alert("Selecione a dificuldade.");
        return;
    }

    if (ingredientes.length === 0) {
        alert("Adicione pelo menos um ingrediente.");
        return;
    }

    if (passos.length === 0) {
        alert("Adicione pelo menos um passo no modo de preparo.");
        return;
    }


    // ==================================================
    // VERIFICAR TOKEN
    // ==================================================

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Você precisa estar logado para publicar uma receita.");
        window.location.href = "login.html";
        return;
    }


    // ==================================================
    // MONTANDO O OBJETO DA RECEITA
    // ==================================================

    const receita = {
        titulo: titulo,

        id_categoria: Number(categoria),

        dificuldade: dificuldade,

        descricao: descricao,

        tp_prep:
            tempoPreparo === ""
                ? null
                : Number(tempoPreparo),

        tp_cozi:
            tempoCozimento === ""
                ? null
                : Number(tempoCozimento),

        rendimento:
            rendimento === ""
                ? null
                : Number(rendimento),

        calorias:
            calorias === ""
                ? null
                : Number(calorias),

        ingredientes: ingredientes,

        passos: passos
    };


    // ==================================================
    // ENVIANDO PARA O BACKEND
    // ==================================================

    try {

        const resposta = await fetch(
            "http://localhost:3000/api/receitas",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify(receita)
            }
        );


        // Tenta transformar a resposta em JSON
        const dados = await resposta.json();


        // ==================================================
        // ERRO
        // ==================================================

        if (!resposta.ok) {

            console.error("Resposta do servidor:", dados);

            // Erro de autorização
            if (resposta.status === 401) {
                alert(
                    "Sua sessão expirou ou você não está autenticado."
                );

                localStorage.removeItem("token");

                window.location.href = "login.html";

                return;
            }


            // Usuário sem permissão
            if (resposta.status === 403) {
                alert(
                    "Você não tem permissão para publicar receitas. " +
                    "Sua conta precisa ter perfil de autor ou administrador."
                );

                return;
            }


            // Erro de validação do backend
            if (resposta.status === 400) {

                let mensagem = dados.erro || "Dados inválidos.";

                if (dados.detalhes && Array.isArray(dados.detalhes)) {

                    mensagem +=
                        "\n\n" +
                        dados.detalhes.join("\n");
                }

                alert(mensagem);

                return;
            }


            alert(
                dados.erro ||
                "Não foi possível cadastrar a receita."
            );

            return;
        }


        // ==================================================
        // SUCESSO
        // ==================================================

       console.log("Receita cadastrada:", dados);

// Pega a foto escolhida no formulário
const campoImagem = document.getElementById("imagem-receita");
const arquivoImagem = campoImagem.files[0];

// Se o usuário escolheu uma foto, envia para o backend
if (arquivoImagem) {

    const formData = new FormData();

    formData.append("imagens", arquivoImagem);
    formData.append("principal", "true");

    try {
        const respostaImagem = await fetch(
            `http://localhost:3000/api/receitas/${dados.id_receita}/imagens`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            }
        );

        if (!respostaImagem.ok) {
            const erroImagem = await respostaImagem.json();
            console.error("Erro ao enviar imagem:", erroImagem);

            alert("A receita foi publicada, mas não foi possível salvar a foto.");
            return;
        }

        console.log("Imagem enviada com sucesso!");

    } catch (erroImagem) {
        console.error("Erro no upload:", erroImagem);
        alert("A receita foi publicada, mas houve um erro ao enviar a foto.");
        return;
    }
}

alert("Receita publicada com sucesso!");
window.location.href = "index.html";


    } catch (erro) {

        console.error("Erro ao cadastrar receita:", erro);

        alert(
            "Não foi possível conectar ao servidor."
        );
    }
});
