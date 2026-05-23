// calcular o total de palavras lidas por um usuário
function calcular_palavras_lidas(usuario) {
    let total_palavras = 0;
    if (!usuario || !usuario.livros) return total_palavras;
    for (let livro of usuario.livros) {
        total_palavras += livro.palavras;
    }
    return total_palavras;
}

// login
function validar_login(lista_usuarios, nome_usuario, senha_digitada) {
    if (!lista_usuarios || !nome_usuario || !senha_digitada) return false;
    const usuario_encontrado = lista_usuarios.find(u => 
        u.username === nome_usuario && u.senha === senha_digitada
    );
    
    if (usuario_encontrado) {
        return true;
    }
    return false;
}

// cadastrar novo usuario
function cadastrar_usuario(banco_usuarios, nome_usuario, senha, senha_encerramento) {
    if (!banco_usuarios || !banco_usuarios.usuarios) return "erro_banco";
    
    const usuario_existe = banco_usuarios.usuarios.some(u => 
        u.username && u.username.toLowerCase().trim() === nome_usuario.toLowerCase().trim()
    );

    if (usuario_existe) {
        return "usuario_ja_existe";
    }

    banco_usuarios.usuarios.push({
        username: nome_usuario.trim(),
        senha: senha.trim(),
        senha_recording: senha.trim(),
        senha_encerramento: senha_encerramento.trim(),
        livros_selecionados: []
    });

    return "sucesso";
}

// excluir conta do usuario 
function excluir_conta(banco_usuarios, usuario_ativo, senha_login, senha_encerramento) {
    if (!banco_usuarios || !banco_usuarios.usuarios || !usuario_ativo) return "erro_banco";

    // Validar as duas senhas dadas
    const senha_login_correta = usuario_ativo.senha.toString().trim() === senha_login.trim();
    const senha_enc_correta = usuario_ativo.senha_encerramento.toString().trim() === senha_encerramento.trim();

    if (!senha_login_correta || !senha_enc_correta) {
        return "senhas_incorretas";
    }

    // Encontrar o índice do usuário para removê-lo
    const indice = banco_usuarios.usuarios.findIndex(u => u.username === usuario_ativo.username);
    
    if (indice !== -1) {
        banco_usuarios.usuarios.splice(indice, 1);
        return "sucesso";
    }

    return "usuario_nao_encontrado";
}

// selecionar livro 
function selecionar_livro(id_livro) {
    let usuario_logado = JSON.parse(localStorage.getItem("usuario_logado"));
    
    const ja_existe = usuario_logado.livros_selecionados.some(l => l.id_livro === id_livro);
    
    if (!ja_existe) {
        usuario_logado.livros_selecionados.push({
            id_livro: id_livro,
            lido: false,
            comentario: "",
            nota: 0,
            data_leitura: ""
        });
        localStorage.setItem("usuario_logado", JSON.stringify(usuario_logado));
        return "livro_adicionado";
    }
    return "livro_ja_selecionado";
}

// remover livro da lista do usuario
function remover_livro(usuario, id_livro) {
    if (!usuario || !usuario.livros_selecionados) return false;
    
    const indice = usuario.livros_selecionados.findIndex(l => l.id_livro === id_livro);
    if (indice !== -1) {
        usuario.livros_selecionados.splice(indice, 1);
        return true;
    }
    return false;
}

// remover apenas o comentario e a nota de um livro
function remover_comentario(usuario, id_livro) {
    if (!usuario || !usuario.livros_selecionados) return false;
    
    const livro = usuario.livros_selecionados.find(l => l.id_livro === id_livro);
    if (livro && livro.comentario && livro.comentario.trim() !== "") {
        livro.comentario = "";
        livro.nota = 0;
        return true;
    }
    return false;
}

// validar senha de encerramento do sistema
function validar_encerramento(usuario, senha_digitada) {
    if (!usuario || !usuario.senha_encerramento || !senha_digitada) return false;
    return usuario.senha_encerramento.toString().trim() === senha_digitada.trim();
}

// relatorio de leitura
function calcular_relatorio(usuario, catalogo_completo) {
    let stats = {
        paginas_totais: 0,
        palavras_totais: 0,
        livros_lidos: 0
    };

    if (!usuario || !usuario.livros_selecionados || !catalogo_completo) {
        return stats;
    }

    usuario.livros_selecionados.forEach(item => {
        if (item.lido) {
            const info_tecnica = catalogo_completo.find(l => l.id === item.id_livro);
            
            if (info_tecnica) {
                stats.paginas_totais += info_tecnica.paginas || 0;
                stats.palavras_totais += ((info_tecnica.paginas || 0) * (info_tecnica.palavras_por_pagina || 0));
                stats.livros_lidos++;
            }
        }
    });

    return stats;
}

module.exports = {
    calcular_palavras_lidas,
    validar_login,
    cadastrar_usuario,
    excluir_conta,
    selecionar_livro,
    remover_livro,
    remover_comentario,
    validar_encerramento,
    calcular_relatorio
};