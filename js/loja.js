// Loja Kabom: vitrine com busca, filtro e ordenação, carrinho e finalização de compra.
// Os produtos vêm de js/dados.js (os mesmos da área administrativa); o pedido finalizado aparece lá.

const CHAVE_CARRINHO = 'kabom:carrinho:v1';
const QUANTIDADE_MAXIMA = 10;
const TODAS_CATEGORIAS = '';

const filtros = { busca: '', categoria: TODAS_CATEGORIAS, ordem: 'relevancia' };

let carrinho = carregarCarrinho();

// ---------- Carrinho (lista de { produtoId, quantidade }) ----------

function carregarCarrinho() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
        return Array.isArray(salvo) ? salvo : [];
    } catch {
        return [];
    }
}

function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function buscarProduto(id) {
    return dados.produtos.find((produto) => produto.id === id);
}

/** Itens do carrinho com os dados atuais do produto (descarta produtos removidos pelo admin). */
function itensDoCarrinho() {
    return carrinho
        .map((item) => ({ ...item, produto: buscarProduto(item.produtoId) }))
        .filter((item) => item.produto);
}

function totalDeUnidades() {
    return itensDoCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
}

function subtotalCarrinho() {
    return itensDoCarrinho().reduce((soma, item) => soma + item.produto.preco * item.quantidade, 0);
}

function adicionarAoCarrinho(produtoId) {
    const item = carrinho.find((registro) => registro.produtoId === produtoId);
    if (item) {
        item.quantidade = Math.min(QUANTIDADE_MAXIMA, item.quantidade + 1);
    } else {
        carrinho.push({ produtoId, quantidade: 1 });
    }
    salvarCarrinho();
    atualizarCarrinho();
}

function mudarQuantidade(produtoId, diferenca) {
    const item = carrinho.find((registro) => registro.produtoId === produtoId);
    if (!item) {
        return;
    }
    item.quantidade += diferenca;
    if (item.quantidade < 1) {
        removerDoCarrinho(produtoId);
        return;
    }
    item.quantidade = Math.min(QUANTIDADE_MAXIMA, item.quantidade);
    salvarCarrinho();
    atualizarCarrinho();
}

function removerDoCarrinho(produtoId) {
    carrinho = carrinho.filter((item) => item.produtoId !== produtoId);
    salvarCarrinho();
    atualizarCarrinho();
}

// ---------- Vitrine ----------

/** Texto em minúsculas e sem acentos, para a busca achar "nintendinho" digitando "NINTENDÍNHO". */
function normalizar(texto) {
    return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function parcelamento(preco) {
    return `ou ${moeda(preco)} em até ${PARCELAS_MAXIMAS}x de ${moeda(preco / PARCELAS_MAXIMAS)} sem juros`;
}

const ORDENACOES = {
    relevancia: (a, b) => a.id - b.id,
    'menor-preco': (a, b) => a.preco - b.preco,
    'maior-preco': (a, b) => b.preco - a.preco,
    nome: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
};

function produtosFiltrados() {
    const termos = normalizar(filtros.busca).split(/\s+/).filter(Boolean);
    return dados.produtos
        .filter((produto) => filtros.categoria === TODAS_CATEGORIAS || produto.categoria === filtros.categoria)
        .filter((produto) => {
            const texto = normalizar(`${produto.nome} ${produto.categoria} ${produto.descricao}`);
            return termos.every((termo) => texto.includes(termo));
        })
        .sort(ORDENACOES[filtros.ordem] ?? ORDENACOES.relevancia);
}

function imagemProduto(produto, classe) {
    const imagem = criar('img', { src: produto.imagem, alt: produto.nome, loading: 'lazy', className: classe });
    imagem.addEventListener('error', () => {
        imagem.replaceWith(criar('span', { className: `${classe} sem-imagem` }, 'sem foto'));
    }, { once: true });
    return imagem;
}

function cartaoProduto(produto) {
    return criar('li', { className: 'cartao-produto' },
        criar('div', { className: 'cartao-foto' }, imagemProduto(produto, 'foto-produto')),
        criar('p', { className: 'cartao-categoria' }, produto.categoria),
        criar('h3', { className: 'cartao-nome' }, produto.nome),
        criar('p', { className: 'cartao-descricao' }, produto.descricao ?? ''),
        criar('div', { className: 'cartao-precos' },
            criar('p', { className: 'preco-pix' }, moeda(precoPix(produto.preco)), criar('span', {}, ' no PIX')),
            criar('p', { className: 'preco-parcelado' }, parcelamento(produto.preco)),
        ),
        criar('button', {
            type: 'button',
            className: 'botao botao-comprar',
            'data-acao': 'adicionar',
            'data-id': produto.id,
            'aria-label': `Adicionar ${produto.nome} ao carrinho`,
        }, 'Comprar'),
    );
}

function renderizarCategorias() {
    const categorias = [...new Set(dados.produtos.map((produto) => produto.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (filtros.categoria !== TODAS_CATEGORIAS && !categorias.includes(filtros.categoria)) {
        filtros.categoria = TODAS_CATEGORIAS;
    }
    const opcoes = [{ valor: TODAS_CATEGORIAS, texto: 'Todos' }, ...categorias.map((nome) => ({ valor: nome, texto: nome }))];
    document.getElementById('lista-categorias').replaceChildren(...opcoes.map(({ valor, texto }) => criar('button', {
        type: 'button',
        className: 'chip',
        'data-categoria': valor,
        'aria-pressed': String(valor === filtros.categoria),
    }, texto)));
}

function renderizarVitrine() {
    const produtos = produtosFiltrados();
    document.getElementById('lista-produtos').replaceChildren(...produtos.map(cartaoProduto));
    document.getElementById('vitrine-vazia').hidden = produtos.length > 0;
    document.getElementById('titulo-vitrine').textContent = filtros.categoria || 'Todos os produtos';

    const quantidade = produtos.length === 1 ? '1 produto' : `${produtos.length} produtos`;
    document.getElementById('resultado').textContent = filtros.busca
        ? `${quantidade} para "${filtros.busca}"`
        : quantidade;
}

function configurarVitrine() {
    const formularioBusca = document.getElementById('form-busca');
    const campoBusca = document.getElementById('busca');

    // A busca filtra enquanto digita; o Enter só leva até os resultados.
    campoBusca.addEventListener('input', () => {
        filtros.busca = campoBusca.value.trim();
        renderizarVitrine();
    });
    formularioBusca.addEventListener('submit', (evento) => {
        evento.preventDefault();
        document.getElementById('vitrine').scrollIntoView();
    });

    document.getElementById('lista-categorias').addEventListener('click', (evento) => {
        const chip = evento.target.closest('[data-categoria]');
        if (chip) {
            filtros.categoria = chip.dataset.categoria;
            renderizarCategorias();
            renderizarVitrine();
        }
    });

    document.getElementById('ordenar').addEventListener('change', (evento) => {
        filtros.ordem = evento.target.value;
        renderizarVitrine();
    });

    document.getElementById('limpar-filtros').addEventListener('click', () => {
        filtros.busca = '';
        filtros.categoria = TODAS_CATEGORIAS;
        campoBusca.value = '';
        renderizarCategorias();
        renderizarVitrine();
    });

    document.getElementById('lista-produtos').addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-acao="adicionar"]');
        const produto = botao && buscarProduto(Number(botao.dataset.id));
        if (produto) {
            adicionarAoCarrinho(produto.id);
            mostrarAviso(`${produto.nome} foi para o carrinho.`);
        }
    });
}

// ---------- Aviso flutuante ----------

let temporizadorAviso;

function mostrarAviso(texto) {
    const aviso = document.getElementById('aviso');
    aviso.textContent = texto;
    aviso.classList.add('visivel');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove('visivel'), 2500);
}

// ---------- Gaveta do carrinho ----------

const gaveta = () => document.getElementById('carrinho');

function mostrarEtapa(nome) {
    gaveta().querySelectorAll('[data-etapa]').forEach((etapa) => {
        etapa.hidden = etapa.dataset.etapa !== nome;
    });
    const titulos = { itens: 'Meu carrinho', checkout: 'Finalizar compra', confirmacao: 'Pedido realizado' };
    document.getElementById('titulo-carrinho').textContent = titulos[nome];
}

function abrirCarrinho() {
    mostrarEtapa('itens');
    atualizarCarrinho();
    gaveta().showModal();
}

function linhaCarrinho({ produto, quantidade }) {
    const id = produto.id;
    return criar('li', { className: 'item-carrinho' },
        imagemProduto(produto, 'item-foto'),
        criar('div', { className: 'item-info' },
            criar('p', { className: 'item-nome' }, produto.nome),
            criar('p', { className: 'item-preco' }, `${moeda(precoPix(produto.preco))} no PIX`),
            criar('div', { className: 'quantidade' },
                criar('button', { type: 'button', 'data-acao': 'diminuir', 'data-id': id, 'aria-label': `Diminuir quantidade de ${produto.nome}` }, '−'),
                criar('span', { 'aria-label': `Quantidade: ${quantidade}` }, quantidade),
                criar('button', {
                    type: 'button',
                    'data-acao': 'aumentar',
                    'data-id': id,
                    disabled: quantidade >= QUANTIDADE_MAXIMA,
                    'aria-label': `Aumentar quantidade de ${produto.nome}`,
                }, '+'),
            ),
        ),
        criar('button', { type: 'button', className: 'item-remover', 'data-acao': 'remover', 'data-id': id, 'aria-label': `Remover ${produto.nome}` }, 'Remover'),
    );
}

function atualizarCarrinho() {
    const itens = itensDoCarrinho();
    const unidades = totalDeUnidades();
    const subtotal = subtotalCarrinho();

    const contador = document.getElementById('contador-carrinho');
    contador.textContent = unidades;
    contador.setAttribute('aria-label', unidades === 1 ? '1 item' : `${unidades} itens`);
    contador.classList.toggle('vazio', unidades === 0);

    document.getElementById('itens-carrinho').replaceChildren(...itens.map(linhaCarrinho));
    document.getElementById('carrinho-vazio').hidden = itens.length > 0;
    document.getElementById('resumo-carrinho').hidden = itens.length === 0;
    document.getElementById('carrinho-subtotal').textContent = moeda(subtotal);
    document.getElementById('carrinho-pix').textContent = moeda(precoPix(subtotal));
    document.getElementById('carrinho-parcelado').textContent = parcelamento(subtotal);
}

// ---------- Finalização da compra ----------

function preencherPagamento() {
    document.getElementById('opcoes-pagamento').replaceChildren(...Object.entries(FORMAS_PAGAMENTO).map(([valor, texto], indice) => {
        const detalhe = valor === 'pix' ? `${DESCONTO_PIX}% off` : valor === 'cartaoCredito' ? `até ${PARCELAS_MAXIMAS}x` : '';
        return criar('label', { className: 'opcao-pagamento' },
            criar('input', { type: 'radio', name: 'formaPagamento', value: valor, checked: indice === 0, required: true }),
            criar('span', {}, texto),
            detalhe ? criar('small', {}, detalhe) : '',
        );
    }));
}

function preencherParcelas() {
    const subtotal = subtotalCarrinho();
    const select = document.getElementById('checkout-parcelas');
    const escolhida = select.value || '1';
    select.replaceChildren(...Array.from({ length: PARCELAS_MAXIMAS }, (_, indice) => {
        const parcelas = indice + 1;
        const texto = parcelas === 1 ? `1x de ${moeda(subtotal)} (à vista)` : `${parcelas}x de ${moeda(subtotal / parcelas)} sem juros`;
        return criar('option', { value: parcelas }, texto);
    }));
    select.value = escolhida;
}

function formaEscolhida() {
    return document.getElementById('form-checkout').elements.formaPagamento.value;
}

function atualizarTotalCheckout() {
    const forma = formaEscolhida();
    const subtotal = subtotalCarrinho();
    document.getElementById('campo-parcelas').hidden = forma !== 'cartaoCredito';
    document.getElementById('checkout-total').textContent = moeda(forma === 'pix' ? precoPix(subtotal) : subtotal);
}

/** Atualiza o cadastro do cliente com o mesmo e-mail ou cria um novo. */
function salvarCliente(valores) {
    const email = valores.email.trim();
    const dadosCliente = {
        nome: valores.nome.trim(),
        telefone: valores.telefone.trim(),
        email,
        documento: valores.documento.trim(),
        endereco: valores.endereco.trim(),
    };
    const existente = dados.clientes.find((cliente) => cliente.email.toLowerCase() === email.toLowerCase());
    if (existente) {
        Object.assign(existente, dadosCliente);
        return existente;
    }
    const novo = { id: proximoId('clientes'), ...dadosCliente };
    dados.clientes.push(novo);
    return novo;
}

function finalizarCompra(formulario) {
    const itens = itensDoCarrinho();
    if (itens.length === 0) {
        mostrarEtapa('itens');
        return;
    }
    const valores = lerFormulario(formulario);
    const cliente = salvarCliente(valores);
    const credito = valores.formaPagamento === 'cartaoCredito';
    const pedido = registrarPedido({
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        itens: itens.map(({ produto, quantidade }) => ({
            produtoId: produto.id,
            produtoNome: produto.nome,
            precoUnitario: produto.preco,
            quantidade,
        })),
        desconto: valores.formaPagamento === 'pix' ? DESCONTO_PIX : 0,
        formaPagamento: valores.formaPagamento,
        parcelas: credito ? Number(valores.parcelas) : null,
        endereco: cliente.endereco,
    });

    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();

    document.getElementById('confirmacao-titulo').textContent = `Pedido nº ${pedido.id} recebido!`;
    document.getElementById('confirmacao-texto').textContent =
        `Obrigado, ${cliente.nome.split(' ')[0]}! Total de ${moeda(totalPedido(pedido))} no ${descricaoPagamento(pedido)}. `
        + `Entrega em ${pedido.endereco}.`;
    mostrarEtapa('confirmacao');
    document.getElementById('confirmacao-titulo').focus();
}

function configurarCarrinho() {
    const dialogo = gaveta();
    const formulario = document.getElementById('form-checkout');

    document.getElementById('abrir-carrinho').addEventListener('click', abrirCarrinho);

    dialogo.addEventListener('click', (evento) => {
        // Clique fora do painel (no fundo escurecido) fecha a gaveta.
        if (evento.target === dialogo) {
            dialogo.close();
            return;
        }
        const botao = evento.target.closest('button[data-acao]');
        if (!botao) {
            return;
        }
        const id = Number(botao.dataset.id);
        switch (botao.dataset.acao) {
            case 'fechar':
                dialogo.close();
                break;
            case 'aumentar':
                mudarQuantidade(id, 1);
                break;
            case 'diminuir':
                mudarQuantidade(id, -1);
                break;
            case 'remover':
                removerDoCarrinho(id);
                break;
            case 'finalizar':
                preencherParcelas();
                atualizarTotalCheckout();
                mostrarEtapa('checkout');
                formulario.elements.nome.focus();
                break;
            case 'voltar':
                mostrarEtapa('itens');
                break;
            default:
                break;
        }
    });

    formulario.addEventListener('change', atualizarTotalCheckout);
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        finalizarCompra(formulario);
    });

    preencherPagamento();
}

// ---------- Início ----------

function renderizarLoja() {
    renderizarCategorias();
    renderizarVitrine();
    atualizarCarrinho();
}

document.addEventListener('DOMContentLoaded', () => {
    configurarVitrine();
    configurarCarrinho();
    // Se o admin mudar um produto em outra aba, a vitrine e o carrinho se atualizam sozinhos.
    acompanharOutrasAbas(renderizarLoja);
    window.addEventListener('storage', (evento) => {
        if (evento.key === CHAVE_CARRINHO) {
            carrinho = carregarCarrinho();
            atualizarCarrinho();
        }
    });
    renderizarLoja();
});
