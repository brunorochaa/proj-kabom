// Área administrativa da Kabom: cadastro de clientes, produtos e pedidos (dados em js/dados.js).

function atualizarTudo() {
    salvarDados();
    renderizarTela();
}

function renderizarTela() {
    renderizarClientes();
    renderizarProdutos();
    renderizarPedidos();
    atualizarOpcoesPedido();
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

    function sairDaEdicao() {
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
            Object.entries(item).forEach(([campo, valor]) => {
                if (formulario.elements[campo]) {
                    formulario.elements[campo].value = valor;
                }
            });
            botaoSalvar.textContent = 'Salvar alterações';
            botaoCancelar.hidden = false;
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
            celula(moeda(produto.preco)),
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
            imagem: valores.imagem.trim(),
        }),
    });

    configurarPedidos();

    document.getElementById('restaurar-exemplo').addEventListener('click', () => {
        if (confirm('Apagar os dados atuais e voltar aos dados de exemplo?')) {
            dados = copiaExemplo();
            atualizarTudo();
        }
    });

    acompanharOutrasAbas(renderizarTela);
    atualizarTudo();
});
