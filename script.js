const fs = require('fs');
const path = require('path');
const readline = require('readline');
const funcoes = require('./funcoes');

// Codigos de escape ANSI
const RESET = "\x1b[0m";
const NEGRITO = "\x1b[1m";
const ITALICO = "\x1b[3m";
const ITALICO_NEGRITO = "\x1b[1;3m";

// Cores
const COR_TITULO = "\x1b[36m";   // Ciano
const COR_MENU = "\x1b[34m";     // Azul
const COR_SUCESSO = "\x1b[32m";  // Verde
const COR_ALERTA = "\x1b[31m";   // Vermelho
const COR_TEXTO = "\x1b[37m";    // Branco
const COR_DESTAQUE = "\x1b[33m"; // Amarelo

const interface_usuario = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const perguntar = (texto) => new Promise((resolve) => interface_usuario.question(texto, resolve));

function carregar_usuarios() {
    try {
        const caminho = path.join(__dirname, 'login.json'); 
        return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    } catch (erro) {
        console.log(COR_ALERTA + "Erro ao ler login.json" + RESET);
        return null;
    }
}

function carregar_livros() { 
    try {
        const caminho = path.join(__dirname, 'livros.json');
        return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
    } catch (erro) { 
        console.log(COR_ALERTA + "Erro ao ler livros.json" + RESET);
        return null;
    }
}

function salvar_usuarios(dados) {
    const caminho = path.join(__dirname, 'login.json');
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

function formatar_texto_justificado(texto, largura_maxima = 60) {
    const palavras = texto.replace(/\n/g, ' ').split(' ');
    let linhas = [];
    let linha_atual = "";

    palavras.forEach(palavra => {
        if ((linha_atual + palavra).length > largura_maxima) {
            linhas.push(linha_atual.trim());
            linha_atual = palavra + " ";
        } else {
            linha_atual += palavra + " ";
        }
    });
    if (linha_atual.trim() !== "") {
        linhas.push(linha_atual.trim());
    }
    return linhas.join('\n');
}

// Funcao padronizar e validar respostas de Sim/Nao
function normalizar_resposta(resposta) {
    return resposta.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function iniciar_sistema() {
    let sistema_rodando = true;

    while (sistema_rodando) {
        const banco_usuarios = carregar_usuarios();
        if (!banco_usuarios || !banco_usuarios.usuarios) {
            console.log(COR_ALERTA + "Erro na base de dados dos usuarios" + RESET);
            interface_usuario.close();
            break;
        }

        console.log("\n" + COR_TITULO + NEGRITO + " SISTEMA GESTAO DE LEITURA " + RESET);
        console.log(COR_MENU + "1." + COR_TEXTO + " Entrar " + RESET);
        console.log(COR_MENU + "2." + COR_TEXTO + " Criar Conta " + RESET);
        
        const opcao_inicial = await perguntar(COR_DESTAQUE + "Opcao: " + RESET);

        if (opcao_inicial.trim() === "1") {
            const nome_digitado = await perguntar(COR_TEXTO + "Usuario: " + RESET);
            const senha_digitada = await perguntar(COR_TEXTO + "Senha: " + RESET);

            if (!nome_digitado.trim() || !senha_digitada.trim()) {
                console.log(COR_ALERTA + "Dados incorretos." + RESET);
                continue;
            }

            const login_valido = funcoes.validar_login(banco_usuarios.usuarios, nome_digitado.trim(), senha_digitada.trim());

            if (login_valido) {
                const usuario_ativo = banco_usuarios.usuarios.find(u => u.username.trim() === nome_digitado.trim());
                console.log(COR_SUCESSO + "Login confirmado. Bem-vinda(o), " + usuario_ativo.username + RESET);
                
                const acao_menu = await exibir_menu(usuario_ativo, banco_usuarios);
                
                if (acao_menu === "ENCERRAR_TOTAL") {
                    sistema_rodando = false;
                    interface_usuario.close();
                    console.log("\n" + COR_SUCESSO + NEGRITO + "Programa encerrado de forma segura." + RESET);
                } else if (acao_menu === "CONTA_EXCLUIDA") {
                    console.log("\n" + COR_ALERTA + "Sessao encerrada devido a exclusao da conta." + RESET);
                } else {
                    console.log("\n" + COR_MENU + "Logout efetuado com sucesso." + RESET);
                }
            } else {
                console.log(COR_ALERTA + "Dados incorretos." + RESET);
            }

        } else if (opcao_inicial.trim() === "2") {
            console.log("\n" + COR_TITULO + "NOVO CADASTRO " + RESET);
            const novo_nome = await perguntar(COR_TEXTO + "Digite o nome de usuario: " + RESET);
            const nova_senha = await perguntar(COR_TEXTO + "Digite a senha de acesso: " + RESET);
            const nova_senha_encerramento = await perguntar(COR_TEXTO + "Digite a senha de encerramento do sistema: " + RESET);

            if (!novo_nome.trim() || !nova_senha.trim() || !nova_senha_encerramento.trim()) {
                console.log(COR_ALERTA + "Todos os campos devem ser preenchidos para efetuar o cadastro" + RESET);
                await perguntar("\nPressione Enter para continuar");
                continue;
            }

            const resultado_cadastro = funcoes.cadastrar_usuario(banco_usuarios, novo_nome, nova_senha, nova_senha_encerramento);

            if (resultado_cadastro === "sucesso") {
                salvar_usuarios(banco_usuarios);
                console.log(COR_SUCESSO + "Usuario cadastrado com sucesso! Agora voce ja pode fazer login" + RESET);
            } else if (resultado_cadastro === "usuario_ja_existe") {
                console.log(COR_ALERTA + "Erro: Esse nome de usuario ja esta em uso." + RESET);
            } else {
                console.log(COR_ALERTA + "Erro ao processar base de dados." + RESET);
            }

            await perguntar("\nPressione Enter para continuar");
        } else {
            console.log(COR_ALERTA + "Opção inválida." + RESET);
            await perguntar("\nPressione Enter para continuar");
        }
    }
}

async function exibir_menu(usuario, banco_usuarios) { 
    let continuar = true;

    while (continuar) {
        console.log("\n" + COR_MENU + NEGRITO + "PAINEL PRINCIPAL " + RESET);
        console.log(COR_MENU + "1." + COR_TEXTO + " Ver Catalogo" + RESET);
        console.log(COR_MENU + "2." + COR_TEXTO + " Meus Livros" + RESET);
        console.log(COR_MENU + "3." + COR_TEXTO + " Ver Meus Comentarios" + RESET);
        console.log(COR_MENU + "4." + COR_TEXTO + " Ver Meu Relatorio de Leitura" + RESET);
        console.log(COR_MENU + "5." + COR_TEXTO + " Sair " + RESET);
        console.log(COR_ALERTA + "6. Excluir Minha Conta" + RESET);
        console.log(COR_ALERTA + "7. Encerrar Programa" + RESET);

        const opcao = await perguntar(COR_DESTAQUE + "Opcao: " + RESET);

        if (opcao === "1") {
            let continuar_no_catalogo = true;

            while (continuar_no_catalogo) {
                const banco_livros = carregar_livros();
                if (!banco_livros || (!banco_livros.catalogo && !banco_livros.livros)) {
                    console.log(COR_ALERTA + "Erro ao carregar o catalogo." + RESET);
                    continuar_no_catalogo = false;
                    continue;
                }
                const lista = banco_livros.catalogo || banco_livros.livros;
                
                console.log("\n" + COR_TITULO + " CATALOGO DE LIVROS " + RESET);
                lista.forEach(l => console.log(` [ID: ${l.id}] | Titulo: ${l.titulo}`));

                const id_escolhido = await perguntar("\nDigite o ID para ver detalhes (ou 0 para voltar ao menu): ");

                if (id_escolhido.trim() === "0" || id_escolhido.trim() === "") {
                    continuar_no_catalogo = false;
                    continue; 
                }

                const livro_encontrado = lista.find(l => l.id.toString() === id_escolhido.trim());

                if (livro_encontrado) {
                    console.log("\n" + COR_TITULO + "------------------------------------------------------------" + RESET);
                    console.log(`${COR_DESTAQUE}Titulo:${RESET} ${livro_encontrado.titulo}`);
                    console.log(`${COR_DESTAQUE}Autor:${RESET}  ${livro_encontrado.autor}`);
                    console.log(`${COR_DESTAQUE}Paginas:${RESET} ${livro_encontrado.paginas} | ${COR_DESTAQUE}Palavras por pagina:${RESET} ${livro_encontrado.palavras_por_pagina}`);
                    console.log(`${COR_DESTAQUE}Resumo do livro:${RESET}`);
                    console.log(formatar_texto_justificado(livro_encontrado.resumo));
                    console.log(COR_TITULO + "------------------------------------------------------------" + RESET);

                    const confirmacao = await perguntar("Deseja adicionar este livro a sua lista? ");
                    const resposta_confirmacao = normalizar_resposta(confirmacao);

                    // Aceita 's' ou 'sim'
                    if (['s', 'sim'].includes(resposta_confirmacao)) {
                        if (!usuario.livros_selecionados) {
                            usuario.livros_selecionados = [];
                        }
                        const ja_selecionado = usuario.livros_selecionados.some(l => l.id_livro.toString() === id_escolhido.trim());
                        
                        if (!ja_selecionado) {
                            usuario.livros_selecionados.push({
                                id_livro: parseInt(id_escolhido.trim()),
                                lido: false,
                                comentario: "",
                                nota: 0
                            });
                            salvar_usuarios(banco_usuarios);
                            console.log(COR_SUCESSO + "Livro adicionado!" + RESET);
                        } else {
                            console.log(COR_ALERTA + "Voce ja possui este livro." + RESET);
                        }
                    }
                } else {
                    console.log(COR_ALERTA + "ID nao encontrado." + RESET);
                }

                const tecla_retorno = await perguntar("\nPressione TAB e Enter para voltar ao catalogo (ou apenas Enter para o menu): ");
                
                if (tecla_retorno !== "\t") {
                    continuar_no_catalogo = false;
                }
            }

        } else if (opcao === "2") {
            if (!usuario.livros_selecionados || usuario.livros_selecionados.length === 0) {
                console.log(COR_ALERTA + "Sua lista de livros esta vazia." + RESET);
                await perguntar("\nPressione Enter para voltar ao menu");
                continue;
            }

            const banco_livros = carregar_livros();
            const lista = banco_livros.catalogo || banco_livros.livros;

            console.log("\n" + COR_TITULO + " MEUS LIVROS ");
            usuario.livros_selecionados.forEach(item => {
                const info = lista.find(l => l.id === item.id_livro);
                const status = item.lido ? COR_SUCESSO + "Lido" : COR_ALERTA + "Nao lido";
                if (info) {
                    console.log(` ID: ${item.id_livro} | ${info.titulo} [Status: ${status}${RESET}]`);
                }
            });
            console.log(COR_TITULO + "-------------------" + RESET);

            console.log(COR_MENU + "1." + COR_TEXTO + " Marcar livro como lido" + RESET);
            console.log(COR_MENU + "2." + COR_TEXTO + " Remover livro da lista" + RESET);
            console.log(COR_MENU + "3." + COR_TEXTO + " Voltar ao menu" + RESET);

            const opcao_meus_livros = await perguntar(COR_DESTAQUE + "Opcao: " + RESET);

            if (opcao_meus_livros === "1") {
                const acao_id = await perguntar("Digite o ID do livro que deseja marcar como lido: ");
                const livro_lista = usuario.livros_selecionados.find(l => l.id_livro.toString() === acao_id.trim());

                if (livro_lista) {
                    livro_lista.lido = true;
                    
                    const nota_digitada = await perguntar("De uma nota para o livro (1 a 5): ");
                    const nota_num = parseInt(nota_digitada.trim());
                    livro_lista.nota = (!isNaN(nota_num) && nota_num >= 1 && nota_num <= 5) ? nota_num : 0;

                    const coment = await perguntar("Deixe um comentario: ");
                    livro_lista.comentario = coment.trim();

                    salvar_usuarios(banco_usuarios);
                    console.log(COR_SUCESSO + "Livro atualizado com sucesso!" + RESET);
                } else {
                    console.log(COR_ALERTA + "Livro nao encontrado na sua lista." + RESET);
                }
            } else if (opcao_meus_livros === "2") {
                const acao_id = await perguntar("Digite o ID do livro que deseja remover: ");
                const id_num = parseInt(acao_id.trim());

                if (!isNaN(id_num)) {
                    const removido = funcoes.remover_livro(usuario, id_num);
                    if (removido) {
                        salvar_usuarios(banco_usuarios);
                        console.log(COR_SUCESSO + "Livro removido da sua lista com sucesso." + RESET);
                    } else {
                        console.log(COR_ALERTA + "Livro nao encontrado na sua lista." + RESET);
                    }
                } else {
                    console.log(COR_ALERTA + "ID invalido." + RESET);
                }
            }

            await perguntar("\nPressione Enter para voltar ao menu");

        } else if (opcao === "3") {
            if (!usuario.livros_selecionados || usuario.livros_selecionados.length === 0) {
                console.log(COR_ALERTA + "Voce nao possui livros na sua lista." + RESET);
                await perguntar("\nPressione Enter para voltar ao menu");
                continue;
            }

            const banco_livros = carregar_livros();
            const lista = banco_livros.catalogo || banco_livros.livros;
            let possui_comentarios = false;

            console.log("\n" + COR_TITULO + "MEUS COMENTARIOS ");
            usuario.livros_selecionados.forEach(item => {
                if (item.comentario && item.comentario.trim() !== "") {
                    possui_comentarios = true;
                    const info = lista.find(l => l.id === item.id_livro);
                    const titulo_livro = info ? info.titulo : "Titulo Desconhecido";
                    console.log(`${COR_DESTAQUE}ID Livro:${RESET} ${item.id_livro} | ${COR_DESTAQUE}Livro:${RESET} ${titulo_livro}`);
                    console.log(` Nota: ${item.nota}/5`);
                    console.log(` Comentario: ${ITALICO_NEGRITO}${item.comentario}${RESET}`);
                    console.log(COR_TITULO + "--------------------------------------------------------------------------------------" + RESET);
                }
            });

            if (!possui_comentarios) {
                console.log(COR_ALERTA + "Voce ainda nao deixou nenhum comentario nos seus livros." + RESET);
                await perguntar("\nPressione Enter para voltar ao menu");
                continue;
            }

            console.log(COR_MENU + "1." + COR_TEXTO + " Remover um comentario" + RESET);
            console.log(COR_MENU + "2." + COR_TEXTO + " Voltar ao menu" + RESET);
            
            const sub_opcao_comentario = await perguntar(COR_DESTAQUE + "Opcao: " + RESET);

            if (sub_opcao_comentario === "1") {
                const id_remover = await perguntar("Digite o ID do livro para remover o comentario: ");
                const id_num = parseInt(id_remover.trim());

                if (!isNaN(id_num)) {
                    const status_remocao = funcoes.remover_comentario(usuario, id_num);
                    if (status_remocao) {
                        salvar_usuarios(banco_usuarios);
                        console.log(COR_SUCESSO + "Comentario removido com sucesso" + RESET);
                    } else {
                        console.log(COR_ALERTA + "Nao foi encontrado comentario ativo para o ID informado." + RESET);
                    }
                } else {
                    console.log(COR_ALERTA + "ID invalido." + RESET);
                }
            }

            await perguntar("\nPressione Enter para voltar ao menu");

        } else if (opcao === "4") {
            const banco_livros = carregar_livros();
            const lista = banco_livros.catalogo || banco_livros.livros;

            const relatorio = funcoes.calcular_relatorio(usuario, lista);

            console.log("\n" + COR_TITULO + " MEU RELATORIO DE LEITURA");
            console.log(`Livros Lidos: ${COR_DESTAQUE}${relatorio.livros_lidos}${RESET}`);
            console.log(`Total de Paginas Lidas: ${COR_DESTAQUE}${relatorio.paginas_totais}${RESET}`);
            console.log(`Total de Palavras Lidas: ${COR_DESTAQUE}${relatorio.palavras_totais}${RESET}`);
            console.log(COR_TITULO + "-------------------------------------------------------------------------" + RESET);

            await perguntar("\nPressione Enter para voltar ao menu");

        } else if (opcao === "5") {
            continuar = false; 
            return "Você saiu";
        } else if (opcao === "6") {
            console.log("\n" + COR_ALERTA + NEGRITO + "!!! EXCLUSAO DE CONTA !!!" + RESET);
            const confirmar_exclusao = await perguntar("Tem certeza ABSOLUTA que deseja deletar sua conta? : ");
            const resposta_exclusao = normalizar_resposta(confirmar_exclusao);

            // Aceita 's' ou 'sim'
            if (['s', 'sim'].includes(resposta_exclusao)) {
                const conf_senha_login = await perguntar("Digite sua senha de entrada : ");
                const conf_senha_encerrar = await perguntar("Digite sua senha de encerramento do sistema: ");

                const resultado_exclusao = funcoes.excluir_conta(banco_usuarios, usuario, conf_senha_login, conf_senha_encerrar);

                if (resultado_exclusao === "sucesso") {
                    salvar_usuarios(banco_usuarios);
                    console.log("\n" + COR_SUCESSO + "Sua conta foi excluida permanentemente." + RESET);
                    await perguntar("\nPressione Enter para sair");
                    continuar = false;
                    return "CONTA_EXCLUIDA";
                } else {
                    console.log("\n" + COR_ALERTA + "Erro: Credenciais invalidas. A conta nao foi excluida." + RESET);
                    await perguntar("\nPressione Enter para voltar ao menu");
                }
            } else {
                console.log("\nOperacao cancelada pelo usuario.");
                await perguntar("\nPressione Enter para voltar ao menu");
            }
        } else if (opcao === "7") {
            const senha_encerrar = await perguntar(COR_ALERTA + "Digite a senha de encerramento do sistema: " + RESET);
            const fechamento_autorizado = funcoes.validar_encerramento(usuario, senha_encerrar);

            if (fechamento_autorizado) {
                continuar = false;
                return "ENCERRAR_TOTAL";
            } else {
                console.log(COR_ALERTA + "Senha de encerramento incorreta. Operacao cancelada." + RESET);
                await perguntar("\nPressione Enter para voltar ao menu");
            }
        } else {
            console.log(COR_ALERTA + "Opção inválida." + RESET);
            await perguntar("\nPressione Enter para voltar ao menu");
        }
    }
}

iniciar_sistema();