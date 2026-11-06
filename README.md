# Kabom: loja de videogames

Loja online de videogames feita para a A3 da disciplina Modelos, Métodos e Técnicas de Engenharia de Software (2024) e refeita em 2026 no estilo das grandes lojas de tecnologia: vitrine, carrinho e finalização de compra, mais uma área administrativa. Roda direto no navegador, sem servidor nem instalação. É um projeto de estudo: nada é cobrado.

## O que faz

**Loja (`index.html`)**

- Vitrine com 16 consoles, busca (ignora acentos e maiúsculas), filtro por categoria (PlayStation, Xbox, Nintendo) e ordenação por preço ou nome.
- Cada produto mostra o preço no PIX (10% de desconto) e o parcelamento em até 10x sem juros.
- Carrinho lateral: aumentar, diminuir e remover itens, com subtotal e total no PIX.
- Finalização de compra: dados do cliente, forma de pagamento (PIX, boleto, crédito com parcelas ou débito) e confirmação com o número do pedido.
- Quem compra de novo com o mesmo e-mail tem o cadastro atualizado, sem duplicar.

**Área administrativa (`admin.html`)**

- Clientes e produtos: cadastrar, editar e remover.
- Pedidos: lançar pedidos manuais e mudar a situação (Pendente, Quitado, Cancelado). Os pedidos feitos na loja aparecem aqui.
- Botão **Restaurar dados de exemplo** para voltar ao estado inicial.

As duas páginas usam os mesmos dados, salvos no navegador (`localStorage`). O pedido guarda uma cópia do nome e do preço, então editar ou remover um produto não altera pedidos antigos.

## Como usar

Abra o `index.html` no navegador (a loja). O link **Admin** no topo leva à área administrativa. Não precisa de servidor.

## Estrutura

```text
index.html             # loja: vitrine, carrinho e finalização
admin.html             # área administrativa: clientes, produtos e pedidos
css/loja.css           # visual da loja (mobile first)
css/admin.css          # complementos da área administrativa (usa a base da loja)
js/dados-exemplo.js    # dados iniciais
js/util.js             # formatação (moeda, data) e criação de elementos sem innerHTML
js/dados.js            # dados compartilhados: localStorage, ids, preços e pedidos
js/loja.js             # vitrine, carrinho e finalização da compra
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
