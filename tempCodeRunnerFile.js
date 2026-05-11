const fs = require('fs');
const path = require('path');
const readline = require('readline');

const interface_usuario = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Funções de carregamento com caminhos seguros
function carregar_livros() {
    try {
        const caminho = path.join(__dirname, 'livros.json');
        const conteudo = fs.readFileSync(caminho, 'utf-8');
        return JSON.parse(conteudo);
    } catch (e) {
        console.error(" Erro: Verifique se o arquivo livros.json existe.");
        return { livros: [] };
    }
}

function carregar_usuarios() {
    try {
        const caminho = path.join(__dirname, 'login.json');
        const conteudo = fs.readFileSync(caminho, 'utf-8');
        return JSON.parse(conteudo);
    } catch (e) {
        console.error(" Erro: Verifique se o arquivo login.json existe.");
        return { usuarios: [] };
    }
}

// Início do Fluxo
function iniciar_sistema() {
    const dados_usuarios = carregar_usuarios();

    console.log("\n===============================");
    console.log("   SISTEMA GESTÃO DE LEITURA   ");
    console.log("===============================\n");

    interface_usuario.question("Digite seu usuário: ", (nome_digitado) => {
        interface_usuario.question("Digite sua senha: ", (senha_digitada) => {
            
            const usuario_logado = dados_usuarios.usuarios.find(u => 
                u.username === nome_digitado && u.senha === senha_digitada
            );

            if (usuario_logado) {
                console.log(`\n✅ Acesso concedido! Bem-vindo, ${usuario_logado.username}.`);
                exibir_menu_principal(usuario_logado);
            } else {
                console.log("\n❌ Erro: Usuário ou senha incorretos.");
                interface_usuario.close();
            }
        });
    });
}

function exibir_menu_principal(usuario) {
    console.log("\n--- MENU PRINCIPAL ---");
    console.log("1. Ver Catálogo");
    console.log("2. Sair");

    interface_usuario.question("\nEscolha uma opção: ", (opcao) => {
        if (opcao === "1") {
            const dados_livros = carregar_livros();
            console.log("\n--- LIVROS DISPONÍVEIS ---");
            dados_livros.livros.forEach(l => {
                console.log(`${l.id} | ${l.titulo} (${l.paginas} págs)`);
            });
            exibir_menu_principal(usuario); // Volta para o menu
        } else {
            console.log("Saindo do sistema...");
            interface_usuario.close();
        }
    });
}

// CHAMADA ESSENCIAL: Sem isso o script não faz nada
iniciar_sistema();