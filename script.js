const fs = require('fs');
const path = require('path');
const readline = require('readline');

const interface_usuario = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function carregar_usuarios() {
    try {
        const caminho = path.join(__dirname, 'login.json'); 
        return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    } catch (erro) {
        console.log("Erro ao ler login.json");
        return null;
    }
}

function carregar_livros() { //
    try {
        const caminho = path.join(__dirname, 'livros.json');
        return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    } catch (erro) {
        console.log("Erro ao ler livros.json");
        return null;
    }
}

function salvar_usuarios(dados) {
    const caminho = path.join(__dirname, 'login.json');
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

function iniciar_sistema() {
    const banco_usuarios = carregar_usuarios();
    if (!banco_usuarios) return;

    console.log("\nSISTEMA GESTAO DE LEITURA");

    interface_usuario.question("Usuario: ", (nome_digitado) => { // interface serve p interagir com o usuario, question é a pergunta que vai ser feita, e a resposta é o que o usuario digitar
        interface_usuario.question("Senha: ", (senha_digitada) => {
            const usuario_ativo = banco_usuarios.usuarios.find(u => 
                u.username.trim() === nome_digitado.trim() && 
                u.senha.toString() === senha_digitada.trim()
            );

            if (usuario_ativo) {
                console.log("\nLogin confirmado. Bem-vinda,", usuario_ativo.username);
                exibir_menu(usuario_ativo, banco_usuarios);
            } else {
                console.log("\nDados incorretos.");
                interface_usuario.close();
            }
        });
    });
}

function exibir_menu(usuario, banco_usuarios) { // aqui é onde o usuario vai escolher o que fazer, tipo um menu de opções
    console.log("\n1. Ver Catalogo");
    console.log("2. Sair");

    interface_usuario.question("Opcao: ", (opcao) => {
        if (opcao === "1") {
            const banco_livros = carregar_livros();
            const lista = banco_livros.catalogo || banco_livros.livros;
            
            console.log("\n CATALOGO ");
            lista.forEach(l => console.log(`ID: ${l.id} | Titulo: ${l.titulo}`));

            interface_usuario.question("\nDigite o ID para ver detalhes (ou digite '0' para voltar): ", (id_escolhido) => {
                if (id_escolhido === "0") {
                    return exibir_menu(usuario, banco_usuarios);
                }

                const livro_encontrado = lista.find(l => l.id.toString() === id_escolhido);

                if (livro_encontrado) {
                    console.log("\n INFORMACOES DO LIVRO ");
                    console.log(`Titulo: ${livro_encontrado.titulo}`);
                    console.log(`Autor: ${livro_encontrado.autor}`);
                    console.log(`Paginas: ${livro_encontrado.paginas}`);
                    console.log(`Palavras por pagina: ${livro_encontrado.palavras_por_pagina}`);
                    console.log("----------------------------");

                    interface_usuario.question("\nDeseja adicionar este livro a sua lista? (s/n): ", (confirmacao) => {
                        if (confirmacao.toLowerCase() === 's') {
                            const ja_selecionado = usuario.livros_selecionados.some(l => l.id_livro.toString() === id_escolhido);
                            
                            if (!ja_selecionado) {
                                usuario.livros_selecionados.push({
                                    id_livro: parseInt(id_escolhido),
                                    lido: false,
                                    comentario: "",
                                    nota: 0
                                });
                                salvar_usuarios(banco_usuarios);
                                console.log("Livro adicionado!");
                            } else {
                                console.log("Voce ja possui este livro.");
                            }
                        }
                        exibir_menu(usuario, banco_usuarios);
                    });
                } else {
                    console.log("ID nao encontrado.");
                    exibir_menu(usuario, banco_usuarios);
                }
            });

        } else if (opcao === "2") {
            interface_usuario.close();
        } else {
            exibir_menu(usuario, banco_usuarios);
        }
    });
}

iniciar_sistema();
