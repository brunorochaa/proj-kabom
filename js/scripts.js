let clientes = [
    { id: 1, nome: 'João Silva', telefone: '1112345678', email: 'joao@example.com', identificador: '123.456.789-00', enderecoCliente: 'Rua das Flores, 123, São Paulo - SP' }
];

let produtos = [
    { 
        id: 1, nome: "Xbox", categoria: "Consoles", preco: 500.00, imagem: "https://www.lukiegames.com/cdn-cgi/image/quality%3D85/assets/images/xbox/xbox_sys_orig_reg-449890.jpg" 
    },
    { 
        id: 2, nome: "Xbox 360", categoria: "Consoles", preco: 800.00, imagem: "https://eldorado.hubsell.com.br/media/catalog/product/2/9/2952590_console-2694-1_1.png" },
    { id: 3, nome: "Xbox One", categoria: "Consoles", preco: 2700.00, imagem: "https://cdn.awsli.com.br/600x1000/1417/1417526/produto/56092654/4037a32fe7.jpg" 

    },
    { 
        id: 4, nome: "Xbox Series X", categoria: "Consoles", preco: 3700.00, imagem: "https://m.media-amazon.com/images/I/41wbBaMnh2L._AC_UF1000,1000_QL80_.jpg" 
    },
    { 
        id: 5, nome: "Nintendinho", categoria: "Consoles", preco: 150.00, imagem: "https://s2-techtudo.glbimg.com/LZP3fcnQYZKdsSO2T1yWGwFI2g4=/0x0:695x377/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2021/R/r/LJ2A33SxSosCTl5ku3Xw/2015-10-19-splash.png" 
    },
    { 
        id: 6, nome: "Super Nintendo", categoria: "Consoles", preco: 250.00, imagem: "https://upload.wikimedia.org/wikipedia/commons/3/31/SNES-Mod1-Console-Set.jpg" 
    },
    { 
        id: 7, nome: "Nintendo 64", categoria: "Consoles", preco: 300.00, imagem: "https://upload.wikimedia.org/wikipedia/commons/0/02/N64-Console-Set.png" 
    },
    { 
        id: 8, nome: "Game Cube", categoria: "Consoles", preco: 700.00, imagem: "https://upload.wikimedia.org/wikipedia/commons/2/2b/GameCube-Console-Set.png" 
    },
    { 
        id: 9, nome: "Nintendo Wii", categoria: "Consoles", preco: 800.00, imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Wii-Console.png/1200px-Wii-Console.png" 
    },
    { 
        id: 10, nome: "Nintendo Wii U", categoria: "Consoles", preco: 1800.00, imagem: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Wii_U_Console_and_Gamepad.png/800px-Wii_U_Console_and_Gamepad.png" 
    },
    { 
        id: 11, nome: "Nintendo Switch", categoria: "Consoles", preco: 2000.00, imagem: "https://d1sfzvg6s5tf2e.cloudfront.net/Custom/Content/Products/15/18/1518_video-game-nintendo-switch-neon-blue-red_l2_637825151608992253.jpg" 
    },
    { 
        id: 12, nome: "Playstation", categoria: "Consoles", preco: 350.00, imagem: "https://upload.wikimedia.org/wikipedia/commons/9/95/PSX-Console-wController.png" 
    },
    { 
        id: 13, nome: "Playstation 2", categoria: "Consoles", preco: 500.00, imagem: "https://s2-techtudo.glbimg.com/bcd8YktSmrlHsQ2lnZ8ogWgaGqo=/0x0:620x388/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2021/Q/U/cto0uQR4mFcnvOxI7oyw/glbimg.com-po-tt-f-620x388-2010-11-29-ps2slim-01.jpg" 
    },
    { 
        id: 14, nome: "Playstation 3", categoria: "Consoles", preco: 1300.00, imagem: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Sony-PlayStation-3-2001A-wController-L.jpg" 
    },
    { 
        id: 15, nome: "Playstation 4", categoria: "Consoles", preco: 2500.00, imagem: "https://gmedia.playstation.com/is/image/SIEPDC/ps4-pro-product-thumbnail-01-en-14sep21?$facebook$" 
    },
    { 
        id: 16, nome: "Playstation 5", categoria: "Consoles", preco: 5000.00, imagem: "https://m.media-amazon.com/images/I/51VZErxKwkL._AC_UF1000,1000_QL80_.jpg" 
    }
];

let pedidos = [
    { 
        id: 1,
        cliente: 'João Silva',
        produtos: [
            { id: 1, nome: "Xbox", quantidade: 1, desconto: 0 }
        ],
        data: new Date('2024-06-27T15:30:00'), // Example: use Date object for accurate date handling
        formaPagamento: 'Boleto',
        enderecoEntrega: 'Rua das Flores, 123, São Paulo - SP',
        estado: 'Quitado'
    },
]

// adicionarCliente
function adicionarCliente(event) {
    event.preventDefault();
    let nome = document.getElementById('nomeCliente').value;
    let telefone = document.getElementById('telefoneCliente').value;
    let email = document.getElementById('emailCliente').value;
    let identificador = document.getElementById('identificadorCliente').value;
    let enderecoCliente = document.getElementById('enderecoCliente').value;

    let novoCliente = {
        id: clientes.length +1,
        nome: nome,
        telefone: telefone,
        email: email,
        identificador: identificador,
        enderecoCliente: enderecoCliente,
    };

    clientes.push(novoCliente);
    
    limparFormularioCliente();
    atualizarTabelaClientes();
    atualizarSelectClientes();
}


// exibirClientes
function exibirClientes() {
    let tabelaClientes = document.getElementById('tabelaClientes');
    clientes.forEach(cliente => {
        let row = tabelaClientes.insertRow();
        row.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.email}</td>
            <td>${cliente.identificador}</td>
            <td>${cliente.enderecoCliente}</td>
            <td><button onclick="editarCliente(${cliente.id})">Editar</button></td>
            <td><button onclick="removerCliente(${cliente.id})">Remover</button></td>
        `
    });
}

// editarCliente
function editarCliente(id) {
    let cliente = clientes.find(cliente => cliente.id === id);
    if (cliente) {
        document.getElementById('nomeCliente').value = cliente.nome;
        document.getElementById('nomeCliente').value = cliente.nome;
        document.getElementById('telefoneCliente').value = cliente.telefone;
        document.getElementById('emailCliente').value = cliente.email;
        document.getElementById('identificadorCliente').value = cliente.identificador;
        document.getElementById('enderecoCliente').value = cliente.enderecoCliente;
        removerCliente(id);
    }
}

// removerCliente
function removerCliente(id) {
    clientes = clientes.filter(cliente => cliente.id !== id);
    // Remover pedidos associados ao cliente
    pedidos = pedidos.filter(pedido => pedido.cliente.id !== id);

    atualizarTabelaClientes();
    atualizarTabelaPedidos();
}

// limparFormularioCliente
function limparFormularioCliente() {
    document.getElementById('nomeCliente').value = '';
    document.getElementById('telefoneCliente').value = '';
    document.getElementById('emailCliente').value = '';
    document.getElementById('identificadorCliente').value = '';
    document.getElementById('enderecoCliente').value = '';
}

// atualizarTabelaClientes
function atualizarTabelaClientes() {
    let tabelaClientes = document.getElementById('tabelaClientes');
    tabelaClientes.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>CPF/CNPJ</th>
            <th>Endereço</th>
            <th>Editar</th>
            <th>Remover</th>
        </tr>
    `;
    exibirClientes();
}

// atualizarSelectClientes
function atualizarSelectClientes() {
    let selectClientes = document.getElementById('clientePedido');
    selectClientes.innerHTML = '<option value="">Selecione o cliente</option>';

    // Preenche select de clientes
    clientes.forEach(cliente => {
        let option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nome;
        selectClientes.appendChild(option);
    });
}

// exibirFormularioCliente
function exibirFormularioCliente () {
    let formCliente = document.getElementById('formCliente');
    formCliente.style.display = formCliente.style.display === 'none' ? 'block' : 'none';
}

// adicionarProduto
function adicionarProduto(event) {
    event.preventDefault();
    let nome = document.getElementById('nomeProduto').value;
    let categoria = document.getElementById('categoriaProduto').value;
    let preco = parseFloat(document.getElementById('precoProduto').value);
    let imagem = document.getElementById('imagemProduto').value;

    let novoProduto = {
        id: produtos.length +1,
        nome: nome,
        categoria: categoria,
        preco: preco,
        imagem: imagem,
    };

    produtos.push(novoProduto);

    limparFormularioProduto();
    atualizarTabelaProdutos();
}

// exibirProdutos
function exibirProdutos() {
    let tabelaProdutos = document.getElementById('tabelaProdutos');
    produtos.forEach(produto => {
        let row = tabelaProdutos.insertRow();
        row.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.categoria}</td>
            <td>${produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td><img src="${produto.imagem}" alt="${produto.nome}" width="50"></td>
            <td><button onclick="editarProduto(${produto.id})">Editar</button></td>
            <td><button onclick="removerProduto(${produto.id})">Remover</button></td>
        `
    });
}

// editarProduto
function editarProduto(id) {
    let produto = produtos.find(produto => produto.id === id);
    if (produto) {
        document.getElementById('nomeProduto').value = produto.nome;
        document.getElementById('categoriaProduto').value = produto.categoria;
        document.getElementById('precoProduto').value = produto.preco;
        document.getElementById('imagemProduto').value = produto.imagem;
        
        removerProduto(id);
    }
}

// removerProduto
function removerProduto(id) {
    produtos = produtos.filter(produto => produto.id !== id);
    // Remover produtos associados aos pedidos
    pedidos.forEach(pedido => {
        pedido.produtos = pedido.produtos.filter(produto => produto.id !== id);
    });

    atualizarTabelaProdutos();
    atualizarTabelaPedidos();
}

// limparFormularioProduto
function limparFormularioProduto() {
    document.getElementById('nomeProduto').value = '';
    document.getElementById('categoriaProduto').value = '';
    document.getElementById('precoProduto').value = '';
    document.getElementById('imagemProduto').value = '';
}

// atualizarTabelaProdutos
function atualizarTabelaProdutos() {
    let tabelaProdutos = document.getElementById('tabelaProdutos');
    tabelaProdutos.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Imagem</th>
            <th>Editar</th>
            <th>Remover</th>
        </tr>
    `
    exibirProdutos();
}

// exibirFormularioProduto
function exibirFormularioProduto() {
    let formProduto = document.getElementById('formProduto');
    formProduto.style.display = formProduto.style.display === 'none' ? 'block' : 'none';
}

// realizarPedido
function realizarPedido(event) {
    event.preventDefault();
    let clienteId = parseInt(document.getElementById('clientePedido').value);
    let produtoId = parseInt(document.getElementById('produtosPedido').value);
    let quantidade = parseInt(document.getElementById('quantidadeProduto').value);
    let desconto = parseInt(document.getElementById('descontoProduto').value);
    let enderecoEntrega = document.getElementById('enderecoEntrega').value;
    let formaPagamento = document.getElementById('formaPagamento').value;

    if (!clienteId || !produtoId || !quantidade || !enderecoEntrega || !formaPagamento) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Encontrar o cliente pelo ID
    let cliente = clientes.find(cliente => cliente.id === clienteId);
    if (!cliente) {
        alert('Cliente não encontrado.');
        return;
    }

    // Encontrar o produto pelo ID
    let produto = produtos.find(produto => produto.id === produtoId);
    if (!produto) {
        alert('Produto não encontrado.');
        return;
    }

    // Capturar o número de parcelas, se for Cartão de Crédito
    let parcelas = null;
    if (formaPagamento === 'cartaoCredito') {
        parcelas = parseInt(document.getElementById('parcelas').value);
        if (!parcelas || parcelas < 1 || parcelas > 12) {
            alert('Por favor, selecione um número válido de parcelas (de 1 a 12).');
            return;
        }
    }

    let novoPedido = {
        id: pedidos.length + 1,
        cliente: cliente.nome,
        produtos: [
            {
                id: produto.id,
                nome: produto.nome,
                quantidade: quantidade,
                desconto: desconto
            }
        ],
        data: new Date(),
        enderecoEntrega: enderecoEntrega,
        estado: 'Pendente',
        formaPagamento: formaPagamento,
        parcelas: parcelas // Adiciona parcelas ao pedido, se houver
    };

    pedidos.push(novoPedido);

    limparFormularioPedido();
    atualizarTabelaPedidos();
}

// Adicionar um evento change para o select de forma de pagamento
document.getElementById('formaPagamento').addEventListener('change', function() {
    let formaPagamento = this.value;
    let parcelasLabel = document.getElementById('parcelasLabel');
    let parcelasInput = document.getElementById('parcelas');

    if (formaPagamento === 'cartaoCredito') {
        parcelasLabel.style.display = 'inline-block';
        parcelasInput.style.display = 'inline-block';
    } else {
        parcelasLabel.style.display = 'none';
        parcelasInput.style.display = 'none';
    }
});

// exibirPedidos
function exibirPedidos() {
    let tabelaPedidos = document.getElementById('tabelaPedidos');
    // limpa o conteúdo anterior da tabela
    tabelaPedidos.innerHTML = '';

    // adiciona o cabeçalho da tabela
    let headerRow = tabelaPedidos.insertRow();
    headerRow.innerHTML = `
        <th>ID</th>
        <th>Cliente</th>
        <th>Produtos</th>
        <th>Quantidade</th>
        <th>Desconto</th>
        <th>Data</th>
        <th>Forma de Pagamento</th>
        <th>Endereço de Entrega</th>
        <th>Estado do Pedido</th>
        <th>Status do Pedido</th>
        <th></th>
    `;

    // adiciona cada pedido como uma nova linha na tabela
    pedidos.forEach(pedido => {
        let produtosPedido = pedido.produtos.map(produto => `${produto.quantidade}x ${produto.nome}`).join(', ');
        let row = tabelaPedidos.insertRow();
        row.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.cliente}</td>
            <td>${produtosPedido}</td>
            <td>${pedido.produtos.reduce((total, produto) => total + produto.quantidade, 0)}</td>
            <td>${pedido.produtos.reduce((total, produto) => total + produto.desconto, 0)}</td>
            <td>${pedido.data.toLocaleString()}</td>
            <td>${pedido.formaPagamento}</td>
            <td>${pedido.enderecoEntrega}</td>
            <td>${pedido.estado}</td>
            <td>
                <button onclick="alternarEstadoPedido(${pedido.id})">${pedido.estado}</button>
            </td>
        `;
    });
}

// TODO: atualizarPedido

// TODO: removerPedido

// limparFormularioCliente
function limparFormularioPedido() {
    document.getElementById('clientePedido').value = '';
    document.getElementById('produtosPedido').value = '';
    document.getElementById('quantidadeProduto').value = '1';
    document.getElementById('descontoProduto').value = '0';
    document.getElementById('enderecoEntrega').value = '';
}

// atualizarTabelaClientes
function atualizarTabelaPedidos() {
    let tabelaPedidos = document.getElementById('tabelaPedidos');
    tabelaPedidos.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Produtos</th>
            <th>Quantidade</th>
            <th>Desconto (%)</th>
            <th>Data</th>
            <th>Endereço de Entrega</th>
            <th>Estado do Pedido</th>
            <th>Status do Pedido</th>
        </tr>
    `;
    exibirPedidos();
}

// exibirFormularioPedido
function exibirFormularioPedido() {
    let formPedido = document.getElementById('formPedido');
    let selectClientes = document.getElementById('clientePedido');
    let selectProdutos = document.getElementById('produtosPedido');

    // Limpa opções existentes nos selects
    selectClientes.innerHTML = '<option value="">Selecione o cliente</option>';
    selectProdutos.innerHTML = '';

    // Preenche select de clientes
    clientes.forEach(cliente => {
        let option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nome;
        selectClientes.appendChild(option);
    });

    // Preenche select de produtos
    produtos.forEach(produto => {
        let option = document.createElement('option');
        option.value = produto.id;
        option.textContent = `${produto.nome} - ${produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
        selectProdutos.appendChild(option);
    });

    formPedido.style.display = formPedido.style.display === 'none' ? 'block' : 'none';
}

// alternarEstadoPedido
function alternarEstadoPedido(pedidoId) {
    let pedido = pedidos.find(pedido => pedido.id === pedidoId);

    switch (pedido.estado) {
        case 'Pendente':
            pedido.estado = 'Cancelado';
            break;
        case 'Cancelado':
            pedido.estado = 'Quitado';
            break;
        case 'Quitado':
            pedido.estado = 'Pendente';
            break;
        default:
            pedido.estado = 'Pendente'; // Defina um estado padrão caso necessário
            break;
    }

    // Após alterar o estado, atualize a tabela de pedidos
    atualizarTabelaPedidos();
}

// Inicialização das funções para exibir dados na página
document.addEventListener('DOMContentLoaded', () => {
    exibirFormularioCliente();
    exibirFormularioProduto();
    exibirFormularioPedido();
    exibirClientes();
    exibirProdutos();
    exibirPedidos();
});