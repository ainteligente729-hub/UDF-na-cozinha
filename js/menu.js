document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const perfil = localStorage.getItem("perfilUsuario");

    // Controla quais links aparecem no menu
    document.querySelectorAll("[data-visivel]").forEach(function (elemento) {
        const permissoes = elemento.dataset.visivel.split(" ");

        let mostrar = false;

        if (permissoes.includes("visitante")) {
            mostrar = !token;
        }

        if (permissoes.includes("logado")) {
            mostrar = !!token;
        }

        if (token && permissoes.includes(perfil)) {
            mostrar = true;
        }

        elemento.hidden = !mostrar;
        elemento.style.display = mostrar ? "" : "none";
    });

    // Faz o botão Sair funcionar
    const botaoSair = document.getElementById("btn-sair");

    if (botaoSair) {
        botaoSair.addEventListener("click", function () {
            localStorage.removeItem("token");
            localStorage.removeItem("nomeUsuario");
            localStorage.removeItem("perfilUsuario");

            window.location.href = "index.html";
        });
    }
});