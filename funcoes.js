// todas as funcoes que utilizaremos

// função para calcular o total de palavras lidas por um usuário
function calcular_palavras_lidas(usuario) {
    let total_palavras = 0;
    for (let livro of usuario.livros) {
        total_palavras += livro.palavras;
    }
    return total_palavras;
}

//função login

function validar_login(lista_usuarios, nome_usuario, senha_digitada) {
    const usuario_encontrado = lista_usuarios.find(u => 
        u.username === nome_usuario && u.senha === senha_digitada
    );
    
    if (usuario_encontrado) {
        localStorage.setItem("usuario_logado", JSON.stringify(usuario_encontrado));
        return true;
    }
    return false;
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

//relatorio de leitura
function calcular_relatorio(usuario, catalogo_completo) {
    let stats = {
        paginas_totais: 0,
        palavras_totais: 0,
        livros_lidos: 0
    };

    usuario.livros_selecionados.forEach(item => {
        if (item.lido) {
            const info_tecnica = catalogo_completo.find(l => l.id === item.id_livro);
            
            if (info_tecnica) {
                stats.paginas_totais += info_tecnica.paginas;
                stats.palavras_totais += (info_tecnica.paginas * info_tecnica.palavras_por_pagina);
                stats.livros_lidos++;
            }
        }
    });

    return stats;
}

//feedback do livro

function salvar_feedback(id_livro, comentario, nota) {
    let usuario_logado = JSON.parse(localStorage.getItem("usuario_logado"));
    
    const index = usuario_logado.livros_selecionados.findIndex(l => l.id_livro === id_livro);
    
    if (index !== -1) {
        usuario_logado.livros_selecionados[index].lido = true;
        usuario_logado.livros_selecionados[index].comentario = comentario;
        usuario_logado.livros_selecionados[index].nota = nota;
        usuario_logado.livros_selecionados[index].data_leitura = new Date().toLocaleDateString();
        
        localStorage.setItem("usuario_logado", JSON.stringify(usuario_logado));
    }
}
    

  


