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

// ---------- Máscaras e validação ----------

function soDigitos(texto) {
    return String(texto ?? '').replace(/\D/g, '');
}

/** "52998224725" vira "529.982.247-25" (formata enquanto digita). */
function mascaraCpf(texto) {
    return soDigitos(texto).slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** "31987654321" vira "(31) 98765-4321"; fixo com 10 dígitos vira "(11) 1234-5678". */
function mascaraTelefone(texto) {
    const digitos = soDigitos(texto).slice(0, 11);
    if (digitos.length <= 2) {
        return digitos.length ? `(${digitos}` : '';
    }
    const meio = digitos.length === 11 ? 5 : 4;
    const ddd = `(${digitos.slice(0, 2)}) `;
    const resto = digitos.slice(2);
    return resto.length > meio ? `${ddd}${resto.slice(0, meio)}-${resto.slice(meio)}` : ddd + resto;
}

/** Confere os dois dígitos verificadores do CPF. */
function cpfValido(texto) {
    const digitos = soDigitos(texto);
    if (digitos.length !== 11 || /^(\d)\1+$/.test(digitos)) {
        return false;
    }
    const verificador = (tamanho) => {
        let soma = 0;
        for (let indice = 0; indice < tamanho; indice += 1) {
            soma += Number(digitos[indice]) * (tamanho + 1 - indice);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
    return verificador(9) === Number(digitos[9]) && verificador(10) === Number(digitos[10]);
}

/** Aplica a máscara enquanto a pessoa digita no campo. */
function aplicarMascara(campo, mascara) {
    campo.addEventListener('input', () => {
        campo.value = mascara(campo.value);
    });
}
