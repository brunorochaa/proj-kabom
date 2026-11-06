# Kabom: loja de videogames

Loja online de videogames feita para a A3 da disciplina Modelos, Métodos e Técnicas de Engenharia de Software (2024) e refeita em 2026 no estilo das grandes lojas de tecnologia: vitrine, carrinho e finalização de compra, mais uma área administrativa. Roda direto no navegador, sem servidor nem instalação. É um projeto de estudo: nada é cobrado.

## O que faz

**Loja (`index.html`)**

- Vitrine com 16 consoles, busca (ignora acentos e maiúsculas), filtro por categoria (PlayStation, Xbox, Nintendo) e ordenação por preço, nome ou maior desconto.
- Ofertas: produtos com preço antigo mostram a etiqueta de desconto e entram no filtro **Ofertas**.
- Favoritos (coração no cartão), guardados no navegador, com atalho no topo.
- Página de detalhes do produto (clique no cartão): preço, tabela de parcelas e escolha de quantidade.
- Cada produto mostra o preço no PIX (10% de desconto) e o parcelamento em até 10x sem juros.
- Carrinho lateral: aumentar, diminuir e remover itens, com subtotal e total no PIX.
- Finalização de compra: dados do cliente, forma de pagamento (PIX, boleto, crédito com parcelas ou débito) e confirmação com o número do pedido.
- Telefone e CPF com máscara; o CPF é conferido pelos dígitos verificadores.
- Quem compra de novo com o mesmo e-mail tem o cadastro atualizado, sem duplicar, e os dados são preenchidos sozinhos.
- **Meus pedidos**: consulta os pedidos e a situação deles pelo e-mail.

**Área administrativa (`admin.html`)**

- Uma seção por vez, em abas: **Resumo**, **Clientes**, **Produtos** e **Pedidos**.
- Resumo: valores recebidos e a receber, contagens e os últimos pedidos, com o botão **Restaurar dados de exemplo**.
- Clientes e produtos: busca na lista e formulário recolhido (abre em "Novo..." ou em "Editar"). Produto aceita preço antigo (vira oferta).
- Pedidos: busca, filtro por situação, pedidos manuais e mudança de situação (Pendente, Quitado, Cancelado). Os pedidos feitos na loja aparecem aqui.

As duas páginas usam os mesmos dados, salvos no navegador (`localStorage`). O pedido guarda uma cópia do nome e do preço, então editar ou remover um produto não altera pedidos antigos.

## Como usar

Abra o `index.html` no navegador (a loja). O link **Admin** no topo leva à área administrativa. Não precisa de servidor.

## Estrutura

```text
index.html             # loja: vitrine, detalhes, carrinho, finalização e meus pedidos
admin.html             # área administrativa: clientes, produtos e pedidos
css/loja.css           # visual da loja (mobile first)
css/admin.css          # complementos da área administrativa (usa a base da loja)
js/dados-exemplo.js    # dados iniciais
js/util.js             # formatação, máscaras (CPF, telefone), validação de CPF e criação de elementos sem innerHTML
js/dados.js            # dados compartilhados: localStorage, ids, preços e pedidos
js/loja.js             # vitrine, favoritos, detalhes, carrinho, finalização e consulta de pedidos
js/admin.js            # cadastros e pedidos da área administrativa
img/logo.png           # o ninja da Kabom
img/produtos/          # fotos dos consoles (créditos em img/produtos/CREDITOS.md)
```

## Tecnologias

HTML, CSS e JavaScript puros, sem bibliotecas.

## Créditos

As fotos dos produtos são, em sua maioria, do Wikimedia Commons, em domínio público ou CC BY-SA; autores e licenças em [`img/produtos/CREDITOS.md`](img/produtos/CREDITOS.md). Nome, logo e visual da Kabom são do projeto. As marcas dos consoles pertencem aos seus donos.

## Licença

Código sob [MIT](LICENSE). As fotos seguem as licenças indicadas nos créditos.
