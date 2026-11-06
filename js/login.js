const formulario = document.getElementById("form-login");


formulario.addEventListener("submit", async function(event) {

    // Impede o formulário de recarregar a página
    event.preventDefault();


    // Pega os valores digitados pelo usuário
    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;


    // Verifica se os campos estão preenchidos
    if (email === "" || senha === "") {

        alert("Preencha o e-mail e a senha.");

        return;
    }


    try {

        // Envia os dados para o backend
        const resposta = await fetch(
            "http://localhost:3000/api/auth/login",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    senha: senha
                })

            }
        );


        // Converte a resposta do servidor para objeto JavaScript
        const dados = await resposta.json();


        // Se o servidor retornar erro
        if (!resposta.ok) {

            console.error(
                "Erro retornado pelo servidor:",
                dados
            );

            alert(
                dados.erro ||
                dados.mensagem ||
                "E-mail ou senha incorretos."
            );

            return;
        }


        // Guarda o token no navegador
        localStorage.setItem(
            "token",
            dados.token
        );


        // Guarda também algumas informações do usuário
        localStorage.setItem(
            "nomeUsuario",
            dados.nome
        );

        localStorage.setItem(
            "perfilUsuario",
            dados.perfil
        );


        console.log("Login realizado com sucesso!");

        console.log(dados);


        alert(
            "Login realizado com sucesso!"
        );


        // Vai para a página inicial
        window.location.href = "index.html";

    }
    catch (erro) {

        console.error(
            "Erro ao conectar com o servidor:",
            erro
        );

        alert(
            "Não foi possível conectar ao servidor."
        );

    }

});