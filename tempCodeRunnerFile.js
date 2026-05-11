const fs = require('fs');
const path = require('path');
const readline = require('readline');

const interface_usuario = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// --- FUNÇÕES DE PERSISTÊNCIA (BANCO DE DADOS) ---

function carregar_livros() {
    try {
        const caminho = path.join(__dirname, 'livros.json');
        return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    } catch (e) {
        return { livros: [] };
    }
}

function carregar_usuarios() {
    try {
        const caminho = path.join(__dirname, 'login.json');
        return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    } catch (e) {
        return { usuarios: [] };
    }
}

function salvar_dados_usuarios(dados) {
    const caminho = path.join(__dirname, 'login.json');
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

// --- LÓGICA DO SISTEMA (SNAKE_CASE) ---

function selecionar_livro(usuario, id_livro, banco_usuarios) {
    // Verifica se o livro já está na lista do usuário
    const ja_existe = usuario.livros_selecionados.some(l => l.id_livro === id_livro);
    
    if (!ja_existe) {
        usuario.livros_selecionados.push({
            id_livro: id_livro,
            lido: false,
            comentario: "",
            nota: 0,
            data_leitura: ""
        });
        
        // Salva a alteração no arquivo login.json
        salvar_dados_usuarios(banco_usuarios);
        return true;
    }
    return false;
}

function calcular_relatorio(usuario, catalogo_completo) {
    let stats = { paginas_totais: 0, palavras_totais: 0, livros_lidos: 0 };

    usuario.livros_selecionados.forEach(item => {
        const info = catalogo_completo.find(l => l.id === item.id_livro);
        if (info && item.lido) {
            stats.paginas_totais += info.paginas;
            stats.palavras_totais += (info.paginas * info.palavras_por_pagina);
            stats.livros_lidos++;
        }
    });
    return stats;
}

// --- INTERFACE DE TERMINAL ---

function iniciar_sistema() {
    const banco_usuarios = carregar_usuarios();

    console.log("\n===============================");
    console.log("   SISTEMA GESTÃO DE LEITURA   ");
    console.log("===============================\n");

    interface_usuario.question("Usuário: ", (nome_digitado) => {
        interface_usuario.question("Senha: ", (senha_digitada) => {
            const usuario = banco_usuarios.usuarios.find(u => u.username === nome_digitado && u.senha === senha_digitada);

            if (usuario) {
                console.log(`\nBem-vindo, ${usuario.username}!`);
                exibir_menu_principal(usuario, banco_usuarios);
            } else {
                console.log("\n Usuário ou senha incorretos.");
                interface_usuario.close();
            }
        });
    });
}

function exibir_menu_principal(usuario, banco_usuarios) {
    console.log("\n--- MENU PRINCIPAL ---");
    console.log("1. Ver Catálogo e Selecionar Livro");
    console.log("2. Meu Relatório de Leitura");
    console.log("3. Sair");

    interface_usuario.question("\nEscolha uma opção: ", (opcao) => {
        if (opcao === "1") {
            const dados_livros = carregar_livros();
            console.log("\n--- CATÁLOGO ---");
            dados_livros.livros.forEach(l => console.log(`${l.id} | ${l.titulo}`));

            interface_usuario.question("\nDigite o ID do livro para adicionar à sua lista: ", (id) => {
                const sucesso = selecionar_livro(usuario, parseInt(id), banco_usuarios);
                console.log(sucesso ? "✅ Livro adicionado!" : "⚠️ Você já tem esse livro.");
                exibir_menu_principal(usuario, banco_usuarios);
            });

        } else if (opcao === "2") {
            const dados_livros = carregar_livros();
            const relatorio = calcular_relatorio(usuario, dados_livros.livros);
            
            console.log("\n--- SEU RELATÓRIO ---");
            console.log(`Livros lidos: ${relatorio.livros_lidos}`);
            console.log(`Páginas lidas: ${relatorio.paginas_totais}`);
            console.log(`Palavras estimadas: ${relatorio.palavras_totais}`);
            
            exibir_menu_principal(usuario, banco_usuarios);
        } else {
            console.log("Saindo...");
            interface_usuario.close();
        }
    });
}

iniciar_sistema();