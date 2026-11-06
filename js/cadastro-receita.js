// ==========================================
// INGREDIENTES
// ==========================================

const botaoIngrediente =
    document.getElementById("adicionar-ingrediente");

const listaIngredientes =
    document.getElementById("lista-ingredientes");

const ingredientes = [];


// Quando clicar no botão "Adicionar" ingrediente
botaoIngrediente.addEventListener("click", function() {

    const nome =
        document.getElementById("nome-ingrediente").value;

    const quantidade =
        document.getElementById("quantidade-ingrediente").value;

    const unidade =
        document.getElementById("unidade-ingrediente").value;


    // Verifica se os campos foram preenchidos
    if (nome === "" || quantidade === "" || unidade === "") {

        alert("Preencha todos os campos do ingrediente.");

        return;
    }


    // Cria o objeto do ingrediente
    const novoIngrediente = {

        nome: nome,

        quantidade: Number(quantidade),

        un_medida: unidade

    };


    // Guarda o ingrediente no array
    ingredientes.push(novoIngrediente);


    // Cria a div que vai aparecer na tela
    const ingrediente = document.createElement("div");

    ingrediente.classList.add("item-ingrediente");


    // Cria o texto que será mostrado
    const texto = document.createElement("span");

    texto.textContent =
        nome + " - " + quantidade + " " + unidade;


    // Cria o botão Remover
    const botaoRemover =
        document.createElement("button");

    botaoRemover.type = "button";

    botaoRemover.textContent = "Remover";


    // Remove o ingrediente quando clicar
    botaoRemover.addEventListener("click", function() {

        const indice =
            ingredientes.indexOf(novoIngrediente);

        if (indice !== -1) {

            ingredientes.splice(indice, 1);

        }

        ingrediente.remove();

    });


    // Coloca o texto dentro da div
    ingrediente.appendChild(texto);


    // Coloca o botão dentro da div
    ingrediente.appendChild(botaoRemover);


    // Coloca a div na lista de ingredientes
    listaIngredientes.appendChild(ingrediente);


    // Limpa os campos
    document.getElementById("nome-ingrediente").value = "";

    document.getElementById("quantidade-ingrediente").value = "";

    document.getElementById("unidade-ingrediente").value = "";

});



// ==========================================
// PASSOS DO MODO DE PREPARO
// ==========================================

const botaoPasso =
    document.getElementById("adicionar-passo");

const listaPassos =
    document.getElementById("lista-passos");

const passos = [];

let numeroPasso = 1;


// Quando clicar no botão "Adicionar passo"
botaoPasso.addEventListener("click", function() {

    const descricao =
        document.getElementById("descricao-passo").value;


    // Verifica se o campo foi preenchido
    if (descricao === "") {

        alert("Digite a descrição do passo.");

        return;
    }


    // Guarda somente a descrição
    // O número do passo será controlado pelo backend
    passos.push(descricao);


    // Cria a div do passo
    const passo =
        document.createElement("div");

    passo.classList.add("item-passo");


    // Cria o texto que aparece na tela
    const textoPasso =
        document.createElement("span");

    textoPasso.textContent =
        "Passo " + numeroPasso + ": " + descricao;


    // Cria o botão Remover
    const botaoRemover =
        document.createElement("button");

    botaoRemover.type = "button";

    botaoRemover.textContent = "Remover";


    // Remove o passo
    botaoRemover.addEventListener("click", function() {

        const indice =
            passos.indexOf(descricao);

        if (indice !== -1) {

            passos.splice(indice, 1);

        }

        passo.remove();

    });


    // Coloca o texto dentro da div
    passo.appendChild(textoPasso);


    // Coloca o botão dentro da div
    passo.appendChild(botaoRemover);


    // Coloca o passo na lista
    listaPassos.appendChild(passo);


    // Aumenta o número do próximo passo
    numeroPasso++;


    // Limpa o campo
    document.getElementById("descricao-passo").value = "";

});



// ==========================================
// ENVIO DO FORMULÁRIO
// ==========================================

const formulario =
    document.getElementById("formulario-receita");


formulario.addEventListener("submit", function(event) {

    // Impede o comportamento padrão do formulário
    // e evita que a página seja recarregada
    event.preventDefault();


    // ==========================================
    // PEGANDO OS DADOS DA RECEITA
    // ==========================================

    const titulo =
        document.getElementById("titulo").value;

    const descricao =
        document.getElementById("descricao").value;

    const tempoPreparo =
        Number(
            document.getElementById("tempo-preparo").value
        );

    const tempoCozimento =
        Number(
            document.getElementById("tempo-cozimento").value
        );

    const rendimento =
        Number(
            document.getElementById("rendimento").value
        );

    const calorias =
        Number(
            document.getElementById("calorias").value
        );

    const dificuldade =
        document.getElementById("dificuldade").value;

    const categoria =
        Number(
            document.getElementById("categoria").value
        );


    // ==========================================
    // CRIANDO O OBJETO DA RECEITA
    // ==========================================

    const receita = {

        titulo: titulo,

        descricao: descricao,

        tp_prep: tempoPreparo,

        tp_cozi: tempoCozimento,

        rendimento: rendimento,

        calorias: calorias,

        dificuldade: dificuldade,

        id_categoria: categoria,

        ingredientes: ingredientes,

        passos: passos

    };


    // ==========================================
    // MOSTRAR A RECEITA NO CONSOLE
    // ==========================================

    console.log("Receita pronta para ser enviada:");

    console.log(receita);

});