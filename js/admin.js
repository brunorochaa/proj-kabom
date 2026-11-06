// Área administrativa da Kabom: cadastro de clientes, produtos e pedidos (dados em js/dados.js).

function atualizarTudo() {
    salvarDados();
    renderizarTela();
}

function renderizarTela() {
    renderizarResumo();
    renderizarClientes();
    renderizarProdutos();
    renderizarPedidos();
    atualizarOpcoesPedido();
    aplicarFiltros();
}

// ---------- Abas (uma seção por vez, escolhida pelo # do endereço) ----------

const ABAS = ['resumo', 'clientes', 'produtos', 'pedidos'];

function mostrarAba() {
    const escolhida = ABAS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'resumo';
    document.querySelectorAll('main [data-aba]').forEach((secao) => {
        secao.hidden = secao.dataset.aba !== escolhida;
    });
    document.querySelectorAll('.menu-admin a[data-aba]').forEach((link) => {
        if (link.dataset.aba === escolhida) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// ---------- Busca e filtro das tabelas ----------

function normalizarTexto(texto) {
    return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Esconde as linhas que não combinam com a busca (e com a situação, nos pedidos). */
function aplicarFiltros() {
    const situacao = document.getElementById('filtro-situacao').value;
    document.querySelectorAll('input[data-busca]').forEach((campo) => {
        const termo = normalizarTexto(campo.value.trim());
        document.getElementById(campo.dataset.busca).querySelectorAll('tr').forEach((linha) => {
            if (linha.querySelector('td.vazio')) {
                return;
            }
            const combinaTexto = normalizarTexto(linha.textContent).includes(termo);
            const combinaSituacao = campo.dataset.busca !== 'lista-pedidos' || !situacao
                || linha.classList.contains('pedido-' + normalizarTexto(situacao));
            linha.hidden = !(combinaTexto && combinaSituacao);
        });
    });
}

// ---------- Resumo ----------

function renderizarResumo() {
    const somaPor = (situacao) => dados.pedidos
        .filter((pedido) => pedido.situacao === situacao)
        .reduce((soma, pedido) => soma + totalPedido(pedido), 0);
    const pendentes = dados.pedidos.filter((pedido) => pedido.situacao === 'Pendente').length;
    const emOferta = dados.produtos.filter((produto) => percentualOferta(produto) > 0).length;
    const indicadores = [
        { rotulo: 'Recebido', valor: moeda(somaPor('Quitado')), nota: 'pedidos quitados', destaque: true },
        { rotulo: 'A receber', valor: moeda(somaPor('Pendente')), nota: pendentes + ' pedido(s) pendente(s)' },
        { rotulo: 'Pedidos', valor: dados.pedidos.length, nota: 'no total' },
        { rotulo: 'Clientes', valor: dados.clientes.length, nota: 'cadastrados' },
        { rotulo: 'Produtos', valor: dados.produtos.length, nota: emOferta + ' em oferta' },
    ];
    document.getElementById('indicadores').replaceChildren(...indicadores.map(({ rotulo, valor, nota, destaque }) => criar('li', { className: destaque ? 'indicador destaque' : 'indicador' },
        criar('span', { className: 'indicador-rotulo' }, rotulo),
        criar('strong', {}, valor),
        criar('small', {}, nota),
    )));

    const recentes = [...dados.pedidos].reverse().slice(0, 5);
    document.getElementById('lista-resumo-pedidos').replaceChildren(...(recentes.length === 0
        ? [linhaVazia(5, 'Nenhum pedido realizado.')]
        : recentes.map((pedido) => criar('tr', {},
            celula(pedido.id),
            celula(dataHora(pedido.data)),
            celula(pedido.clienteNome),
            celula(moeda(totalPedido(pedido))),
            celula(criar('span', { className: 'etiqueta etiqueta-' + normalizarTexto(pedido.situacao) }, pedido.situacao)),
        ))));
}

// ---------- Cadastros (clientes e produtos) ----------

/**
 * Liga um formulário de cadastro à sua lista: adicionar, editar (mantendo o id) e remover.
 * @param {object} config
 * @param {string} config.colecao 'clientes' ou 'produtos'
 * @param {HTMLFormElement} config.formulario
 * @param {HTMLElement} config.lista tbody da tabela
 * @param {(valores: object) => object} config.montar converte os campos do formulário no registro
 * @param {string} config.nomeItem usado na confirmação de remoção
 */
function configurarCadastro({ colecao, formulario, lista, montar, nomeItem }) {
    const botaoSalvar = formulario.querySelector('button[type="submit"]');
    const botaoCancelar = formulario.querySelector('[data-acao="cancelar"]');
    const recolhivel = formulario.closest('details');

    function sairDaEdicao() {
        recolhivel.open = false;
        formulario.reset();
        formulario.elements.id.value = '';
        botaoSalvar.textContent = 'Adicionar';
        botaoCancelar.hidden = true;
    }

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const valores = lerFormulario(formulario);
        const id = Number(valores.id) || proximoId(colecao);
        const registro = { id, ...montar(valores) };
        const indice = dados[colecao].findIndex((item) => item.id === id);
        if (indice === -1) {
            dados[colecao].push(registro);
        } else {
            dados[colecao][indice] = registro;
        }
        sairDaEdicao();
        atualizarTudo();
    });

    botaoCancelar.addEventListener('click', sairDaEdicao);

    lista.addEventListener('click', (evento) => {
        const botao = evento.target.closest('button[data-acao]');
        if (!botao) {
            return;
        }
        const id = Number(botao.dataset.id);
        const item = dados[colecao].find((registro) => registro.id === id);
        if (!item) {
            return;
        }
        if (botao.dataset.acao === 'editar') {
            formulario.reset();
            Object.entries(item).forEach(([campo, valor]) => {
                if (formulario.elements[campo]) {
                    formulario.elements[campo].value = valor;
                }
            });
            botaoSalvar.textContent = 'Salvar alterações';
            botaoCancelar.hidden = false;
            recolhivel.open = true;
            recolhivel.scrollIntoView({ block: 'start' });
            formulario.elements[1].focus();
        } else if (botao.dataset.acao === 'remover' && confirm(`Remover ${nomeItem} "${item.nome}"?`)) {
            // Os pedidos guardam uma cópia do nome e do preço, então o histórico continua igual.
            dados[colecao] = dados[colecao].filter((registro) => registro.id !== id);
            if (Number(formulario.elements.id.value) === id) {
                sairDaEdicao();
            }
            atualizarTudo();
        }
    });
}

function acoesLinha(id) {
    return celula(
        criar('div', { className: 'acoes-linha' },
            botaoAcao('Editar', 'editar', id),
            botaoAcao('Remover', 'remover', id, 'perigo'),
        ),
    );
}

function linhaVazia(colunas, texto) {
    return criar('tr', {}, criar('td', { colSpan: colunas, className: 'vazio' }, texto));
}

function renderizarClientes() {
    const lista = document.getElementById('lista-clientes');
    if (dados.clientes.length === 0) {
        lista.replaceChildren(linhaVazia(7, 'Nenhum cliente cadastrado.'));
        return;
    }
    lista.replaceChildren(...dados.clientes.map((cliente) => criar('tr', {},
        celula(cliente.id),
        celula(cliente.nome),
        celula(cliente.telefone),
        celula(cliente.email),
        celula(cliente.documento),
        celula(cliente.endereco),
        acoesLinha(cliente.id),
    )));
}

function renderizarProdutos() {
    const lista = document.getElementById('lista-produtos');
    if (dados.produtos.length === 0) {
        lista.replaceChildren(linhaVazia(6, 'Nenhum produto cadastrado.'));
        return;
    }
    lista.replaceChildren(...dados.produtos.map((produto) => {
        const imagem = criar('img', { src: produto.imagem, alt: produto.nome, loading: 'lazy', className: 'miniatura' });
        imagem.addEventListener('error', () => imagem.replaceWith(criar('span', { className: 'sem-imagem' }, 'sem imagem')), { once: true });
        return criar('tr', {},
            celula(produto.id),
            celula(imagem),
            celula(produto.nome),
            celula(produto.categoria),
            celula(moeda(produto.preco), percentualOferta(produto) ? criar('small', { className: 'tag-oferta' }, ' -' + percentualOferta(produto) + '%') : ''),
            acoesLinha(produto.id),
        );
    }));
}

// ---------- Pedidos ----------

function renderizarPedidos() {
    const lista = document.getElementById('lista-pedidos');
    if (dados.pedidos.length === 0) {
        lista.replaceChildren(linhaVazia(9, 'Nenhum pedido realizado.'));
        return;
    }
    lista.replaceChildren(...[...dados.pedidos].reverse().map((pedido) => {
        const situacao = criar('select', { className: 'situacao', 'data-id': pedido.id, 'aria-label': 'Situação do pedido' },
            ...SITUACOES_PEDIDO.map((opcao) => criar('option', { value: opcao, selected: opcao === pedido.situacao }, opcao)),
        );
        return criar('tr', { className: `pedido-${pedido.situacao.toLowerCase()}` },
            celula(pedido.id),
            celula(dataHora(pedido.data)),
            celula(pedido.clienteNome),
            celula(descricaoItens(pedido.itens)),
            celula(`${pedido.desconto}%`),
            celula(moeda(totalPedido(pedido))),
            celula(descricaoPagamento(pedido)),
            celula(pedido.endereco),
            celula(situacao),
        );
    }));
}

function atualizarOpcoesPedido() {
    preencherSelect(
        document.getElementById('pedido-cliente'),
        dados.clientes.map((cliente) => ({ valor: cliente.id, texto: cliente.nome })),
        'Selecione o cliente',
    );
    preencherSelect(
        document.getElementById('pedido-produto'),
        dados.produtos.map((produto) => ({ valor: produto.id, texto: `${produto.nome} - ${moeda(produto.preco)}` })),
        'Selecione o produto',
    );
    atualizarTotalPrevisto();
}

function atualizarTotalPrevisto() {
    const formulario = document.getElementById('form-pedido');
    const produto = dados.produtos.find((item) => item.id === Number(formulario.elements.produtoId.value));
    const quantidade = Math.max(1, Number(formulario.elements.quantidade.value) || 1);
    const desconto = Math.min(100, Math.max(0, Number(formulario.elements.desconto.value) || 0));
    const itens = produto ? [{ precoUnitario: produto.preco, quantidade }] : [];
    document.getElementById('pedido-total').textContent = moeda(totalPedido({ itens, desconto }));
}

function configurarPedidos() {
    const formulario = document.getElementById('form-pedido');
    const campoParcelas = document.getElementById('campo-parcelas');

    preencherSelect(
        formulario.elements.formaPagamento,
        Object.entries(FORMAS_PAGAMENTO).map(([valor, texto]) => ({ valor, texto })),
        'Selecione a forma de pagamento',
    );

    // Ao escolher o cliente, sugere o endereço dele para a entrega.
    formulario.elements.clienteId.addEventListener('change', () => {
        const cliente = dados.clientes.find((item) => item.id === Number(formulario.elements.clienteId.value));
        if (cliente && !formulario.elements.endereco.value) {
            formulario.elements.endereco.value = cliente.endereco;
        }
    });

    formulario.elements.formaPagamento.addEventListener('change', () => {
        campoParcelas.hidden = formulario.elements.formaPagamento.value !== 'cartaoCredito';
    });

    formulario.addEventListener('input', atualizarTotalPrevisto);

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const valores = lerFormulario(formulario);
        const cliente = dados.clientes.find((item) => item.id === Number(valores.clienteId));
        const produto = dados.produtos.find((item) => item.id === Number(valores.produtoId));
        if (!cliente || !produto) {
            alert('Selecione um cliente e um produto.');
            return;
        }
        const credito = valores.formaPagamento === 'cartaoCredito';
        registrarPedido({
            clienteId: cliente.id,
            clienteNome: cliente.nome,
            itens: [
                { produtoId: produto.id, produtoNome: produto.nome, precoUnitario: produto.preco, quantidade: Number(valores.quantidade) },
            ],
            desconto: Number(valores.desconto),
            formaPagamento: valores.formaPagamento,
            parcelas: credito ? Number(valores.parcelas) : null,
            endereco: valores.endereco.trim(),
        });
        formulario.reset();
        campoParcelas.hidden = true;
        atualizarTudo();
    });

    document.getElementById('lista-pedidos').addEventListener('change', (evento) => {
        const select = evento.target.closest('select.situacao');
        const pedido = select && dados.pedidos.find((item) => item.id === Number(select.dataset.id));
        if (pedido) {
            pedido.situacao = select.value;
            atualizarTudo();
        }
    });
}

// ---------- Início ----------

document.addEventListener('DOMContentLoaded', () => {
    configurarCadastro({
        colecao: 'clientes',
        formulario: document.getElementById('form-cliente'),
        lista: document.getElementById('lista-clientes'),
        nomeItem: 'o cliente',
        montar: (valores) => ({
            nome: valores.nome.trim(),
            telefone: valores.telefone.trim(),
            email: valores.email.trim(),
            documento: valores.documento.trim(),
            endereco: valores.endereco.trim(),
        }),
    });

    configurarCadastro({
        colecao: 'produtos',
        formulario: document.getElementById('form-produto'),
        lista: document.getElementById('lista-produtos'),
        nomeItem: 'o produto',
        montar: (valores) => ({
            nome: valores.nome.trim(),
            categoria: valores.categoria.trim(),
            descricao: valores.descricao.trim(),
            preco: Number(valores.preco),
            // Só vira oferta se o preço antigo for maior que o atual.
            ...(Number(valores.precoAntigo) > Number(valores.preco) ? { precoAntigo: Number(valores.precoAntigo) } : {}),
            imagem: valores.imagem.trim(),
        }),
    });

    configurarPedidos();

    aplicarMascara(document.getElementById('cliente-telefone'), mascaraTelefone);

    const filtroSituacao = document.getElementById('filtro-situacao');
    SITUACOES_PEDIDO.forEach((situacao) => filtroSituacao.append(criar('option', { value: situacao }, situacao)));
    filtroSituacao.addEventListener('change', aplicarFiltros);
    document.querySelectorAll('input[data-busca]').forEach((campo) => campo.addEventListener('input', aplicarFiltros));

    window.addEventListener('hashchange', mostrarAba);
    mostrarAba();

    document.getElementById('restaurar-exemplo').addEventListener('click', () => {
        if (confirm('Apagar os dados atuais e voltar aos dados de exemplo?')) {
            dados = copiaExemplo();
            atualizarTudo();
        }
    });

    acompanharOutrasAbas(renderizarTela);
    atualizarTudo();
});
