
const parametros = new URLSearchParams(window.location.search);
const idReceita = parametros.get("id");

const formulario = document.getElementById("form-editar-receita");
const mensagem = document.getElementById("mensagem");
const token = localStorage.getItem("token");

// Buscar os dados atuais da receita
async function carregarReceita() {
    if (!idReceita || !token) {
        mensagem.textContent = "Faça login e selecione uma receita.";
        return;
    }

    try {
        const resposta = await fetch(
            `http://localhost:3000/api/receitas/${encodeURIComponent(idReceita)}`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar a receita.");
        }

        const receita = await resposta.json();

        document.getElementById("titulo").value = receita.titulo || "";
        document.getElementById("descricao").value = receita.descricao || "";
        document.getElementById("dificuldade").value = receita.dificuldade || "facil";

        
listaIngredientes.innerHTML = "";
listaPassos.innerHTML = "";


 // Carregar ingredientes já cadastrados
if (Array.isArray(receita.ingredientes)) {
    receita.ingredientes.forEach(function (ingrediente) {
        adicionarCampoIngrediente(
            ingrediente.nome || "",
            ingrediente.quantidade ?? "",
            ingrediente.un_medida || ""
        );

        const ultimoIngrediente = listaIngredientes.lastElementChild;

        ultimoIngrediente.querySelector(".btn-confirmar").click();
    });
}

// Carregar passos já cadastrados

// Carregar passos já cadastrados
if (Array.isArray(receita.passos)) {
    receita.passos.forEach(function (passo) {
        adicionarCampoPasso(
            typeof passo === "string" ? passo : passo.desc_passo || ""
        );

        const ultimoPasso = listaPassos.lastElementChild;

        const botaoConfirmar = Array.from(
            ultimoPasso.querySelectorAll("button")
        ).find(function (botao) {
            return botao.textContent.includes("Confirmar");
        });

        if (botaoConfirmar) {
            botaoConfirmar.click();
        }
    });
}



        mensagem.hidden = true;
        formulario.hidden = false;

    } catch (erro) {
        console.error(erro);
        mensagem.textContent = "Erro ao carregar a receita.";
    }
}

// Salvar as alterações
formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

  
const ingredientes = Array.from(
    document.querySelectorAll("#lista-ingredientes .item-ingrediente")
).map(function (item) {
    return {
        nome: item.querySelector(".ing-nome").value.trim(),
        quantidade: item.querySelector(".ing-quantidade").value.trim(),
        un_medida: item.querySelector(".ing-unidade").value.trim()
    };
});

const passos = Array.from(
    document.querySelectorAll("#lista-passos .passo-descricao")
).map(function (campo) {
    return campo.value.trim();
});

const dados = {
    titulo: document.getElementById("titulo").value.trim(),
    descricao: document.getElementById("descricao").value.trim(),
    dificuldade: document.getElementById("dificuldade").value
};

// Por enquanto, só enviamos as listas quando houver itens.
// Isso evita apagar ingredientes e passos antigos que
// ainda não estamos carregando no formulário.
dados.ingredientes = ingredientes;
dados.passos = passos;


    try {
        const resposta = await fetch(
            `http://localhost:3000/api/receitas/${encodeURIComponent(idReceita)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(dados)
            }
        );

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || "Não foi possível salvar.");
        }

        alert("Receita atualizada com sucesso!");
        window.location.href = "minhas-receitas.html";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao atualizar receita: " + erro.message);
    }
});

carregarReceita();


const listaIngredientes = document.getElementById("lista-ingredientes");
const botaoAdicionarIngrediente = document.getElementById("adicionar-ingrediente");



function adicionarCampoIngrediente(nome = "", quantidade = "", unidade = "") {
    const div = document.createElement("div");
    div.className = "item-ingrediente";

    div.innerHTML = `
        <input type="text" class="ing-nome" placeholder="Ingrediente" required>
        <input type="text" class="ing-quantidade" placeholder="Quantidade" required>
        <input type="text" class="ing-unidade" placeholder="Unidade (g, ml, xícara...)" required>

        <button type="button" class="btn-confirmar">✓ Confirmar</button>
        <button type="button" class="btn-remover">🗑️ Remover</button>
    `;

    const campoNome = div.querySelector(".ing-nome");
    const campoQuantidade = div.querySelector(".ing-quantidade");
    const campoUnidade = div.querySelector(".ing-unidade");

    campoNome.value = nome;
    campoQuantidade.value = quantidade;
    campoUnidade.value = unidade;

    const botaoConfirmar = div.querySelector(".btn-confirmar");
    const botaoRemover = div.querySelector(".btn-remover");

    // Antes de confirmar, o botão Remover fica escondido
    botaoRemover.hidden = true;

    botaoConfirmar.addEventListener("click", function () {
        const nome = campoNome.value.trim();
        const quantidade = campoQuantidade.value.trim();
        const unidade = campoUnidade.value.trim();

        if (!nome || !quantidade || !unidade) {
            alert("Preencha todos os campos do ingrediente.");
            return;
        }

        // Esconde os campos, mas mantém seus valores
        campoNome.hidden = true;
        campoQuantidade.hidden = true;
        campoUnidade.hidden = true;
        botaoConfirmar.hidden = true;

        // Mostra o ingrediente confirmado
        const texto = document.createElement("span");
        texto.textContent = `${quantidade} ${unidade} de ${nome}`;
        div.insertBefore(texto, botaoRemover);

        botaoRemover.hidden = false;
    });

    botaoRemover.addEventListener("click", function () {
        div.remove();
    });

    listaIngredientes.appendChild(div);
}


botaoAdicionarIngrediente.addEventListener("click", function () {
    adicionarCampoIngrediente();
});


const listaPassos = document.getElementById("lista-passos");
const botaoAdicionarPasso = document.getElementById("adicionar-passo");


function adicionarCampoPasso(texto = "") {
    const div = document.createElement("div");
    div.className = "item-passo";

    // Campo para escrever o passo
    const campo = document.createElement("textarea");
    campo.className = "passo-descricao";
    campo.placeholder = "Descreva o passo de preparo...";
    campo.value = texto;
    campo.required = true;

    // Botão confirmar
    const botaoConfirmar = document.createElement("button");
    botaoConfirmar.type = "button";
    botaoConfirmar.textContent = "✓ Confirmar";

    // Botão remover
    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.textContent = "🗑️ Remover";
    botaoRemover.hidden = true;

    // Texto que aparece após confirmar
    const textoConfirmado = document.createElement("p");
    textoConfirmado.hidden = true;

    botaoConfirmar.addEventListener("click", function () {
        const descricao = campo.value.trim();

        if (!descricao) {
            alert("Escreva o passo de preparo antes de confirmar.");
            return;
        }

        // Esconde o campo de digitação
        campo.hidden = true;
        botaoConfirmar.hidden = true;

        // Mostra o passo confirmado
        textoConfirmado.textContent = descricao;
        textoConfirmado.hidden = false;

        // Mostra o botão remover
        botaoRemover.hidden = false;
    });

    botaoRemover.addEventListener("click", function () {
        div.remove();
    });

    div.append(
        campo,
        textoConfirmado,
        botaoConfirmar,
        botaoRemover
    );

    listaPassos.appendChild(div);
}

botaoAdicionarPasso.addEventListener("click", function () {
    adicionarCampoPasso();
});
