const botaoIngrediente = document.getElementById("adicionar-ingrediente");

const listaIngredientes = document.getElementById("lista-ingredientes");

botaoIngrediente.addEventListener("click", function() {

    const nome = document.getElementById("nome-ingrediente").value;

    const quantidade = document.getElementById("quantidade-ingrediente").value;

    const unidade = document.getElementById("unidade-ingrediente").value;


    if (nome === "" || quantidade === "" || unidade === "") {

        alert("Preencha todos os campos do ingrediente.");

        return;
    }


    const ingrediente = document.createElement("p");

    ingrediente.textContent =
        nome + " - " + quantidade + " " + unidade;


    listaIngredientes.appendChild(ingrediente);


    document.getElementById("nome-ingrediente").value = "";

    document.getElementById("quantidade-ingrediente").value = "";

    document.getElementById("unidade-ingrediente").value = "";

});

const botaoPasso = document.getElementById("adicionar-passo");

const listaPassos = document.getElementById("lista-passos");

let numeroPasso = 1;


botaoPasso.addEventListener("click", function() {

    const descricao =
        document.getElementById("descricao-passo").value;


    if (descricao === "") {

        alert("Digite a descrição do passo.");

        return;
    }


    const passo = document.createElement("p");

    passo.textContent =
        "Passo " + numeroPasso + ": " + descricao;


    listaPassos.appendChild(passo);


    numeroPasso++;


    document.getElementById("descricao-passo").value = "";

});