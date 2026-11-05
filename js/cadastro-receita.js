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