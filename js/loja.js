// Loja Kabom: vitrine com busca, filtros, ofertas e favoritos, detalhes do produto, carrinho,
// finalização de compra e consulta de pedidos.
// Os produtos vêm de js/dados.js (os mesmos da área administrativa); o pedido finalizado aparece lá.

const CHAVE_CARRINHO = 'kabom:carrinho:v1';
const CHAVE_FAVORITOS = 'kabom:favoritos:v1';
const CHAVE_EMAIL = 'kabom:email:v1';
const QUANTIDADE_MAXIMA = 10;

// Além das categorias dos produtos, a vitrine tem dois filtros especiais (o ":" evita conflito com nomes reais).
const TODAS_CATEGORIAS = '';
const CATEGORIA_OFERTAS = ':ofertas';
const CATEGORIA_FAVORITOS = ':favoritos';

const filtros = { busca: '', categoria: TODAS_CATEGORIAS, ordem: 'relevancia' };

let carrinho = lerLista(CHAVE_CARRINHO);
let favoritos = lerLista(CHAVE_FAVORITOS);

function lerLista(chave) {
    try {
        const salvo = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(salvo) ? salvo : [];
    } catch {
        return [];
    }
}

function buscarProduto(id) {
    return dados.produtos.find((produto) => produto.id === id);
}

// ---------- Carrinho (lista de { produtoId, quantidade }) ----------

function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
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

function adicionarAoCarrinho(produtoId, quantidade = 1) {
    const item = carrinho.find((registro) => registro.produtoId === produtoId);
    if (item) {
        item.quantidade = Math.min(QUANTIDADE_MAXIMA, item.quantidade + quantidade);
    } else {
        carrinho.push({ produtoId, quantidade: Math.min(QUANTIDADE_MAXIMA, quantidade) });
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

// ---------- Favoritos (lista de ids de produto) ----------

function ehFavorito(produtoId) {
    return favoritos.includes(produtoId);
}

function alternarFavorito(produtoId) {
    favoritos = ehFavorito(produtoId) ? favoritos.filter((id) => id !== produtoId) : [...favoritos, produtoId];
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
    return ehFavorito(produtoId);
}

function favoritosExistentes() {
    return favoritos.filter((id) => buscarProduto(id));
}

function atualizarContadorFavoritos() {
    const quantidade = favoritosExistentes().length;
    const contador = document.getElementById('contador-favoritos');
    contador.textContent = quantidade;
    contador.setAttribute('aria-label', quantidade === 1 ? '1 favorito' : `${quantidade} favoritos`);
    contador.classList.toggle('vazio', quantidade === 0);
    document.getElementById('ver-favoritos').setAttribute('aria-pressed', String(filtros.categoria === CATEGORIA_FAVORITOS));
}

function botaoFavorito(produto, classe) {
    const marcado = ehFavorito(produto.id);
    return criar('button', {
        type: 'button',
        className: classe,
        'data-acao': 'favoritar',
        'data-id': produto.id,
        'aria-pressed': String(marcado),
        'aria-label': `Favoritar ${produto.nome}`,
        title: marcado ? 'Tirar dos favoritos' : 'Adicionar aos favoritos',
    }, iconeCoracao());
}

function iconeCoracao() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const caminho = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    caminho.setAttribute('d', 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z');
    svg.append(caminho);
    return svg;
}

/** Favorita/desfavorita e atualiza a tela; devolve o texto do aviso. */
function trocarFavorito(produto) {
    const marcado = alternarFavorito(produto.id);
    renderizarVitrine();
    atualizarContadorFavoritos();
    return marcado ? `${produto.nome} foi para os favoritos.` : `${produto.nome} saiu dos favoritos.`;
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
    'maior-desconto': (a, b) => percentualOferta(b) - percentualOferta(a) || a.preco - b.preco,
    nome: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
};

function passaNaCategoria(produto) {
    switch (filtros.categoria) {
        case TODAS_CATEGORIAS:
            return true;
        case CATEGORIA_OFERTAS:
            return percentualOferta(produto) > 0;
        case CATEGORIA_FAVORITOS:
            return ehFavorito(produto.id);
        default:
            return produto.categoria === filtros.categoria;
    }
}

function produtosFiltrados() {
    const termos = normalizar(filtros.busca).split(/\s+/).filter(Boolean);
    return dados.produtos
        .filter(passaNaCategoria)
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

function seloOferta(produto) {
    const percentual = percentualOferta(produto);
    return percentual ? criar('span', { className: 'selo-oferta' }, `-${percentual}%`) : '';
}

function precoAntigo(produto) {
    return percentualOferta(produto)
        ? criar('p', { className: 'preco-antigo' }, 'de ', criar('s', {}, moeda(produto.precoAntigo)), ' por')
        : '';
}

function cartaoProduto(produto) {
    return criar('li', { className: 'cartao-produto' },
        criar('div', { className: 'cartao-foto' },
            imagemProduto(produto, 'foto-produto'),
            seloOferta(produto),
            botaoFavorito(produto, 'botao-favorito'),
        ),
        criar('p', { className: 'cartao-categoria' }, produto.categoria),
        // O botão do nome cobre o cartão todo (CSS), então clicar em qualquer parte abre os detalhes.
        criar('h3', { className: 'cartao-nome' },
            criar('button', { type: 'button', className: 'cartao-link', 'data-acao': 'detalhes', 'data-id': produto.id }, produto.nome),
        ),
        criar('p', { className: 'cartao-descricao' }, produto.descricao ?? ''),
        criar('div', { className: 'cartao-precos' },
            precoAntigo(produto),
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

function nomeDoFiltro(valor) {
    return { [TODAS_CATEGORIAS]: 'Todos os produtos', [CATEGORIA_OFERTAS]: 'Ofertas', [CATEGORIA_FAVORITOS]: 'Favoritos' }[valor] ?? valor;
}

function escolherCategoria(valor) {
    filtros.categoria = valor;
    renderizarCategorias();
    renderizarVitrine();
    atualizarContadorFavoritos();
}

function renderizarCategorias() {
    const categorias = [...new Set(dados.produtos.map((produto) => produto.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const especiais = [CATEGORIA_OFERTAS, CATEGORIA_FAVORITOS];
    if (![TODAS_CATEGORIAS, ...especiais, ...categorias].includes(filtros.categoria)) {
        filtros.categoria = TODAS_CATEGORIAS;
    }
    const opcoes = [
        { valor: TODAS_CATEGORIAS, texto: 'Todos' },
        { valor: CATEGORIA_OFERTAS, texto: 'Ofertas', classe: 'chip-oferta' },
        ...categorias.map((nome) => ({ valor: nome, texto: nome })),
    ];
    document.getElementById('lista-categorias').replaceChildren(...opcoes.map(({ valor, texto, classe }) => criar('button', {
        type: 'button',
        className: classe ? `chip ${classe}` : 'chip',
        'data-categoria': valor,
        'aria-pressed': String(valor === filtros.categoria),
    }, texto)));
}

function renderizarVitrine() {
    const produtos = produtosFiltrados();
    document.getElementById('lista-produtos').replaceChildren(...produtos.map(cartaoProduto));
    document.getElementById('vitrine-vazia').hidden = produtos.length > 0;
    document.getElementById('vitrine-vazia-texto').textContent = filtros.categoria === CATEGORIA_FAVORITOS && !filtros.busca
        ? 'Você ainda não tem favoritos. Toque no coração de um produto para guardá-lo aqui.'
        : 'Nenhum produto encontrado.';
    document.getElementById('titulo-vitrine').textContent = nomeDoFiltro(filtros.categoria);

    const quantidade = produtos.length === 1 ? '1 produto' : `${produtos.length} produtos`;
    document.getElementById('resultado').textContent = filtros.busca
        ? `${quantidade} para "${filtros.busca}"`
        : quantidade;
}

function irParaVitrine() {
    document.getElementById('vitrine').scrollIntoView();
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
        irParaVitrine();
    });

    document.getElementById('lista-categorias').addEventListener('click', (evento) => {
        const chip = evento.target.closest('[data-categoria]');
        if (chip) {
            escolherCategoria(chip.dataset.categoria);
        }
    });

    document.getElementById('ver-ofertas').addEventListener('click', () => {
        escolherCategoria(CATEGORIA_OFERTAS);
        irParaVitrine();
    });

    document.getElementById('ver-favoritos').addEventListener('click', () => {
        escolherCategoria(filtros.categoria === CATEGORIA_FAVORITOS ? TODAS_CATEGORIAS : CATEGORIA_FAVORITOS);
        irParaVitrine();
    });

    document.getElementById('ordenar').addEventListener('change', (evento) => {
        filtros.ordem = evento.target.value;
        renderizarVitrine();
    });

    document.getElementById('limpar-filtros').addEventListener('click', () => {
        filtros.busca = '';
        campoBusca.value = '';
        escolherCategoria(TODAS_CATEGORIAS);
    });

    document.getElementById('lista-produtos').addEventListener('click', (evento) => {
        const botao = evento.target.closest('button[data-acao]');
        const produto = botao && buscarProduto(Number(botao.dataset.id));
        if (!produto) {
            return;
        }
        if (botao.dataset.acao === 'adicionar') {
            adicionarAoCarrinho(produto.id);
            mostrarAviso(`${produto.nome} foi para o carrinho.`);
        } else if (botao.dataset.acao === 'favoritar') {
            mostrarAviso(trocarFavorito(produto));
            // A vitrine foi redesenhada: devolve o foco ao coração do mesmo produto.
            document.querySelector(`#lista-produtos [data-acao="favoritar"][data-id="${produto.id}"]`)?.focus();
        } else if (botao.dataset.acao === 'detalhes') {
            abrirDetalhes(produto.id);
        }
    });
}

// ---------- Detalhes do produto ----------

const detalhe = { produtoId: null, quantidade: 1 };

function abrirDetalhes(produtoId) {
    detalhe.produtoId = produtoId;
    detalhe.quantidade = 1;
    renderizarDetalhes();
    document.getElementById('detalhes').showModal();
}

function tabelaParcelas(preco) {
    return criar('details', { className: 'parcelas' },
        criar('summary', {}, 'Ver parcelamento no cartão'),
        criar('ul', {}, ...Array.from({ length: PARCELAS_MAXIMAS }, (_, indice) => {
            const parcelas = indice + 1;
            return criar('li', {}, criar('span', {}, `${parcelas}x`), criar('span', {}, `${moeda(preco / parcelas)} sem juros`));
        })),
    );
}

function renderizarDetalhes() {
    const janela = document.getElementById('detalhes');
    const produto = buscarProduto(detalhe.produtoId);
    if (!produto) {
        if (janela.open) {
            janela.close();
        }
        return;
    }
    const { quantidade } = detalhe;
    document.getElementById('detalhes-conteudo').replaceChildren(
        criar('div', { className: 'detalhes-foto' }, imagemProduto(produto, 'foto-produto'), seloOferta(produto)),
        criar('div', { className: 'detalhes-info' },
            criar('p', { className: 'cartao-categoria' }, produto.categoria),
            criar('h2', { id: 'detalhes-nome' }, produto.nome),
            criar('p', { className: 'detalhes-descricao' }, produto.descricao || 'Sem descrição.'),
            criar('div', { className: 'detalhes-precos' },
                precoAntigo(produto),
                criar('p', { className: 'preco-pix' }, moeda(precoPix(produto.preco)), criar('span', {}, ` no PIX (${DESCONTO_PIX}% off)`)),
                criar('p', { className: 'preco-parcelado' }, parcelamento(produto.preco)),
                tabelaParcelas(produto.preco),
            ),
            criar('div', { className: 'detalhes-compra' },
                criar('div', { className: 'quantidade' },
                    criar('button', { type: 'button', 'data-acao': 'diminuir', disabled: quantidade <= 1, 'aria-label': 'Diminuir quantidade' }, '−'),
                    criar('span', { 'aria-label': `Quantidade: ${quantidade}` }, quantidade),
                    criar('button', { type: 'button', 'data-acao': 'aumentar', disabled: quantidade >= QUANTIDADE_MAXIMA, 'aria-label': 'Aumentar quantidade' }, '+'),
                ),
                criar('button', { type: 'button', className: 'botao botao-grande', 'data-acao': 'adicionar' }, 'Adicionar ao carrinho'),
                botaoFavorito(produto, 'botao-favorito botao-favorito-grande'),
            ),
        ),
    );
}

function configurarDetalhes() {
    const janela = document.getElementById('detalhes');
    janela.addEventListener('click', (evento) => {
        if (evento.target === janela) {
            janela.close();
            return;
        }
        const botao = evento.target.closest('button[data-acao]');
        const produto = buscarProduto(detalhe.produtoId);
        if (!botao || !produto) {
            return;
        }
        switch (botao.dataset.acao) {
            case 'fechar':
                janela.close();
                break;
            case 'diminuir':
            case 'aumentar':
                detalhe.quantidade = Math.min(QUANTIDADE_MAXIMA, Math.max(1, detalhe.quantidade + (botao.dataset.acao === 'aumentar' ? 1 : -1)));
                renderizarDetalhes();
                janela.querySelector(`[data-acao="${botao.dataset.acao}"]:not(:disabled)`)?.focus();
                break;
            case 'adicionar':
                adicionarAoCarrinho(produto.id, detalhe.quantidade);
                janela.close();
                abrirCarrinho();
                break;
            case 'favoritar':
                mostrarAviso(trocarFavorito(produto));
                renderizarDetalhes();
                janela.querySelector('[data-acao="favoritar"]').focus();
                break;
            default:
                break;
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
        const detalheForma = valor === 'pix' ? `${DESCONTO_PIX}% off` : valor === 'cartaoCredito' ? `até ${PARCELAS_MAXIMAS}x` : '';
        return criar('label', { className: 'opcao-pagamento' },
            criar('input', { type: 'radio', name: 'formaPagamento', value: valor, checked: indice === 0, required: true }),
            criar('span', {}, texto),
            detalheForma ? criar('small', {}, detalheForma) : '',
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

function clientePorEmail(email) {
    const procurado = String(email ?? '').trim().toLowerCase();
    return procurado ? dados.clientes.find((cliente) => cliente.email.toLowerCase() === procurado) : undefined;
}

/** Preenche o checkout com o cadastro do cliente desse e-mail (só os campos vazios). */
function preencherComCliente(formulario, email) {
    const cliente = clientePorEmail(email);
    if (!cliente) {
        return;
    }
    const campos = formulario.elements;
    const valores = {
        nome: cliente.nome,
        email: cliente.email,
        telefone: mascaraTelefone(cliente.telefone),
        documento: mascaraCpf(cliente.documento),
        endereco: cliente.endereco,
    };
    Object.entries(valores).forEach(([campo, valor]) => {
        if (!campos[campo].value) {
            campos[campo].value = valor;
        }
    });
    validarCpf(campos.documento);
}

function validarCpf(campo) {
    campo.setCustomValidity(campo.value && !cpfValido(campo.value) ? 'Confira o CPF: os dígitos não batem.' : '');
}

/** Atualiza o cadastro do cliente com o mesmo e-mail ou cria um novo. */
function salvarCliente(valores) {
    const dadosCliente = {
        nome: valores.nome.trim(),
        telefone: valores.telefone.trim(),
        email: valores.email.trim(),
        documento: valores.documento.trim(),
        endereco: valores.endereco.trim(),
    };
    const existente = clientePorEmail(dadosCliente.email);
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

    localStorage.setItem(CHAVE_EMAIL, cliente.email);
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
    const campos = formulario.elements;

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
                preencherComCliente(formulario, localStorage.getItem(CHAVE_EMAIL));
                atualizarTotalCheckout();
                mostrarEtapa('checkout');
                campos.nome.focus();
                break;
            case 'voltar':
                mostrarEtapa('itens');
                break;
            default:
                break;
        }
    });

    aplicarMascara(campos.telefone, mascaraTelefone);
    aplicarMascara(campos.documento, mascaraCpf);
    campos.documento.addEventListener('input', () => validarCpf(campos.documento));
    campos.email.addEventListener('change', () => preencherComCliente(formulario, campos.email.value));

    formulario.addEventListener('change', atualizarTotalCheckout);
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        finalizarCompra(formulario);
    });

    preencherPagamento();
}

// ---------- Meus pedidos ----------

function cartaoPedido(pedido) {
    return criar('li', { className: 'pedido' },
        criar('div', { className: 'pedido-topo' },
            criar('strong', {}, `Pedido nº ${pedido.id}`),
            criar('span', { className: `etiqueta etiqueta-${normalizar(pedido.situacao)}` }, pedido.situacao),
        ),
        criar('p', { className: 'pedido-data' }, dataHora(pedido.data)),
        criar('ul', { className: 'pedido-itens' }, ...pedido.itens.map((item) => criar('li', {}, `${item.quantidade}x ${item.produtoNome}`))),
        criar('p', { className: 'linha-resumo' },
            criar('span', {}, descricaoPagamento(pedido)),
            criar('strong', {}, moeda(totalPedido(pedido))),
        ),
    );
}

function consultarPedidos(email) {
    const cliente = clientePorEmail(email);
    const pedidos = cliente
        ? dados.pedidos.filter((pedido) => pedido.clienteId === cliente.id).sort((a, b) => b.id - a.id)
        : [];
    document.getElementById('lista-meus-pedidos').replaceChildren(...pedidos.map(cartaoPedido));
    document.getElementById('pedidos-resultado').textContent = pedidos.length === 0
        ? 'Nenhum pedido encontrado para este e-mail.'
        : `${pedidos.length === 1 ? '1 pedido' : `${pedidos.length} pedidos`} de ${cliente.nome}.`;
}

function configurarPedidos() {
    const janela = document.getElementById('pedidos');
    const formulario = document.getElementById('form-pedidos');
    const campoEmail = formulario.elements.email;

    document.getElementById('abrir-pedidos').addEventListener('click', () => {
        const salvo = localStorage.getItem(CHAVE_EMAIL);
        document.getElementById('lista-meus-pedidos').replaceChildren();
        document.getElementById('pedidos-resultado').textContent = '';
        if (salvo) {
            campoEmail.value = salvo;
            consultarPedidos(salvo);
        }
        janela.showModal();
    });

    janela.addEventListener('click', (evento) => {
        if (evento.target === janela || evento.target.closest('[data-acao="fechar"]')) {
            janela.close();
        }
    });

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        localStorage.setItem(CHAVE_EMAIL, campoEmail.value.trim());
        consultarPedidos(campoEmail.value);
    });
}

// ---------- Início ----------

function renderizarLoja() {
    renderizarCategorias();
    renderizarVitrine();
    atualizarCarrinho();
    atualizarContadorFavoritos();
    if (document.getElementById('detalhes').open) {
        renderizarDetalhes();
    }
    const janelaPedidos = document.getElementById('pedidos');
    if (janelaPedidos.open && document.getElementById('form-pedidos').elements.email.value) {
        consultarPedidos(document.getElementById('form-pedidos').elements.email.value);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    configurarVitrine();
    configurarDetalhes();
    configurarCarrinho();
    configurarPedidos();
    // Se o admin mudar um produto em outra aba, a vitrine e o carrinho se atualizam sozinhos.
    acompanharOutrasAbas(renderizarLoja);
    window.addEventListener('storage', (evento) => {
        if (evento.key === CHAVE_CARRINHO) {
            carrinho = lerLista(CHAVE_CARRINHO);
            atualizarCarrinho();
        } else if (evento.key === CHAVE_FAVORITOS) {
            favoritos = lerLista(CHAVE_FAVORITOS);
            renderizarVitrine();
            atualizarContadorFavoritos();
        }
    });
    renderizarLoja();
});
