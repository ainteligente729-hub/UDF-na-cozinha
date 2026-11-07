const formulario = document.getElementById("form-cadastro");


formulario.addEventListener("submit", async function(event) {

    event.preventDefault();


    const nome = document.getElementById("nome").value;

    const email = document.getElementById("email").value;

    const senha = document.getElementById("senha").value;

    const confirmarSenha =
        document.getElementById("confirmar-senha").value;


    if (senha !== confirmarSenha) {

        alert("As senhas não são iguais.");

        return;
    }
    
    if (senha.length < 8) {

        alert("A senha precisa ter pelo menos 8 caracteres.");

        return;
    }

    try {

        const resposta = await fetch(
            "http://localhost:3000/api/auth/cadastro",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha
                })
            }
        );


        const dados = await resposta.json();


        if (!resposta.ok) {

            alert(dados.erro || "Erro ao realizar cadastro.");

            return;
        }


        alert("Cadastro realizado com sucesso!");

        window.location.href = "login.html";


    } catch (erro) {

        console.error("Erro:", erro);

        alert("Não foi possível conectar ao servidor.");

    }

});