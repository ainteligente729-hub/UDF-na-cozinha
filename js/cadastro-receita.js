const botaoIngrediente = document.getElementById("adicionar-ingrediente");

const listaIngredientes = document.getElementById("lista-ingredientes");


botaoIngrediente.addEventListener("click", function() {

    const nome = document.getElementById("nome-ingrediente").value;

    const quantidade =
        document.getElementById("quantidade-ingrediente").value;

    const unidade =
        document.getElementById("unidade-ingrediente").value;


    if (nome === "" || quantidade === "" || unidade === "") {

        alert("Preencha todos os campos do ingrediente.");

        return;
    }


    const ingrediente = document.createElement("div");

    ingrediente.classList.add("item-ingrediente");


    const texto = document.createElement("span");

    texto.textContent =
        nome + " - " + quantidade + " " + unidade;


    const botaoRemover = document.createElement("button");

    botaoRemover.type = "button";

    botaoRemover.textContent = "Remover";


    botaoRemover.addEventListener("click", function() {

        ingrediente.remove();

    });


    ingrediente.appendChild(texto);

    ingrediente.appendChild(botaoRemover);

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


    const passo = document.createElement("div");

    passo.classList.add("item-passo");


    const textoPasso = document.createElement("span");

    textoPasso.textContent =
        "Passo " + numeroPasso + ": " + descricao;


    const botaoRemover = document.createElement("button");

    botaoRemover.type = "button";

    botaoRemover.textContent = "Remover";


    botaoRemover.addEventListener("click", function() {

        passo.remove();

    });


    passo.appendChild(textoPasso);

    passo.appendChild(botaoRemover);

    listaPassos.appendChild(passo);


    numeroPasso++;


    document.getElementById("descricao-passo").value = "";

});



const formulario =
    document.getElementById("formulario-receita");


formulario.addEventListener("submit", function(event) {

    event.preventDefault();


    const titulo =
        document.getElementById("titulo").value;

    const descricao =
        document.getElementById("descricao").value;

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



    const ingredientes = [];

    const elementosIngredientes =
        document.querySelectorAll(".item-ingrediente");


    elementosIngredientes.forEach(function(elemento) {

        const texto =
            elemento.querySelector("span").textContent;

        ingredientes.push(texto);

    });



    const passos = [];

    const elementosPassos =
        document.querySelectorAll(".item-passo");


    elementosPassos.forEach(function(elemento) {

        const texto =
            elemento.querySelector("span").textContent;

        passos.push(texto);

    });



    const receita = {

        titulo: titulo,

        descricao: descricao,

        tempoPreparo: tempoPreparo,

        tempoCozimento: tempoCozimento,

        rendimento: rendimento,

        calorias: calorias,

        dificuldade: dificuldade,

        categoria: categoria,

        ingredientes: ingredientes,

        passos: passos

    };


    console.log(receita);

});