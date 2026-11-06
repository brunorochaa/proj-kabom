// Funções genéricas de formatação e criação de elementos (sem innerHTML, para evitar XSS).

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoDataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

function moeda(valor) {
    return formatoMoeda.format(valor);
}

function dataHora(textoIso) {
    return formatoDataHora.format(new Date(textoIso));
}

/** Maior id de uma lista (0 se vazia). */
function maiorId(lista) {
    return lista.reduce((maior, item) => Math.max(maior, item.id), 0);
}

/** Cria um elemento com atributos e filhos. Texto é sempre inserido como texto, nunca como HTML. */
function criar(tag, atributos = {}, ...filhos) {
    const elemento = document.createElement(tag);
    Object.entries(atributos).forEach(([nome, valor]) => {
        if (nome.includes('-')) {
            elemento.setAttribute(nome, valor);
        } else {
            elemento[nome] = valor;
        }
    });
    elemento.append(...filhos.map((filho) => (filho instanceof Node ? filho : String(filho))));
    return elemento;
}

function celula(...conteudo) {
    return criar('td', {}, ...conteudo);
}

function botaoAcao(texto, acao, id, classe = '') {
    return criar('button', { type: 'button', className: classe, 'data-acao': acao, 'data-id': id }, texto);
}

/** Lê os campos de um formulário como objeto { nome: valor }. */
function lerFormulario(formulario) {
    return Object.fromEntries(new FormData(formulario));
}

function preencherSelect(select, opcoes, textoVazio) {
    const valorAtual = select.value;
    select.replaceChildren(
        criar('option', { value: '' }, textoVazio),
        ...opcoes.map(({ valor, texto }) => criar('option', { value: valor }, texto)),
    );
    select.value = opcoes.some((opcao) => String(opcao.valor) === valorAtual) ? valorAtual : '';
}
