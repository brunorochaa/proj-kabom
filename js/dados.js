// Camada de dados compartilhada pela loja (index.html) e pela área administrativa (admin.html).
// Tudo fica no localStorage do navegador, então as duas páginas enxergam os mesmos clientes, produtos e pedidos.

const CHAVE_ARMAZENAMENTO = 'kabom:dados:v4';

const FORMAS_PAGAMENTO = {
    pix: 'PIX',
    boleto: 'Boleto',
    cartaoCredito: 'Cartão de crédito',
    cartaoDebito: 'Cartão de débito',
};

const SITUACOES_PEDIDO = ['Pendente', 'Quitado', 'Cancelado'];

/** Desconto (%) da loja para pagamento no PIX. */
const DESCONTO_PIX = 10;

/** Máximo de parcelas sem juros no cartão de crédito. */
const PARCELAS_MAXIMAS = 10;

let dados = carregarDados();

function copiaExemplo() {
    return comSequencias(structuredClone(DADOS_EXEMPLO));
}

/** Garante o contador de ids de cada coleção (ids nunca são reaproveitados, nem depois de remover). */
function comSequencias(conjunto) {
    conjunto.sequencias ??= {};
    ['clientes', 'produtos', 'pedidos'].forEach((colecao) => {
        conjunto.sequencias[colecao] = Math.max(conjunto.sequencias[colecao] ?? 0, maiorId(conjunto[colecao]));
    });
    return conjunto;
}

function proximoId(colecao) {
    dados.sequencias[colecao] += 1;
    return dados.sequencias[colecao];
}

function carregarDados() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO));
        if (salvo && Array.isArray(salvo.clientes) && Array.isArray(salvo.produtos) && Array.isArray(salvo.pedidos)) {
            return comSequencias(salvo);
        }
    } catch {
        // Dado corrompido: volta para o exemplo.
    }
    return copiaExemplo();
}

function salvarDados() {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(dados));
}

/** Chama `aoMudar` quando a outra página (em outra aba) altera os dados. */
function acompanharOutrasAbas(aoMudar) {
    window.addEventListener('storage', (evento) => {
        if (evento.key === CHAVE_ARMAZENAMENTO) {
            dados = carregarDados();
            aoMudar();
        }
    });
}

// ---------- Preços e pedidos ----------

function precoPix(preco) {
    return preco * (1 - DESCONTO_PIX / 100);
}

function subtotalItens(itens) {
    return itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
}

function totalPedido(pedido) {
    return subtotalItens(pedido.itens) * (1 - pedido.desconto / 100);
}

function descricaoItens(itens) {
    return itens.map((item) => `${item.quantidade}x ${item.produtoNome}`).join(', ');
}

function descricaoPagamento(pedido) {
    const forma = FORMAS_PAGAMENTO[pedido.formaPagamento] ?? pedido.formaPagamento;
    return pedido.parcelas > 1 ? `${forma} (${pedido.parcelas}x)` : forma;
}

/**
 * Registra um pedido novo (situação "Pendente") e salva.
 * @param {object} pedido sem id, data e situação
 * @returns {object} o pedido gravado
 */
function registrarPedido(pedido) {
    const registro = {
        id: proximoId('pedidos'),
        data: new Date().toISOString(),
        ...pedido,
        situacao: 'Pendente',
    };
    dados.pedidos.push(registro);
    salvarDados();
    return registro;
}
