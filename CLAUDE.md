# CLAUDE.md

> **Sincronia obrigatória:** `CLAUDE.md` e `AGENTS.md` devem ter o mesmo conteúdo (só o título muda). Sempre que um for alterado, atualize o outro.

## O que é

Loja online de videogames (vitrine, carrinho, finalização de compra) com área administrativa (clientes, produtos, pedidos). Trabalho da A3 de Modelos, Métodos e Técnicas de Engenharia de Software (2024), refeito em 2026. Roda abrindo o `index.html` (inclusive por `file://`). Detalhes no `README.md`.

## Stack

HTML, CSS e JavaScript puros, sem bibliotecas nem etapa de build. Scripts clássicos com `defer` (não usar `type="module"`, que quebra ao abrir por `file://`). Ordem dos scripts: `dados-exemplo.js`, `util.js`, `dados.js` e depois `loja.js` ou `admin.js`.

## Estrutura

- `index.html` + `css/loja.css` + `js/loja.js`: loja. Filtros em `filtros` (busca, categoria, ordem); `:ofertas` e `:favoritos` são categorias especiais. Carrinho em `localStorage` (`kabom:carrinho:v1`, lista de `{ produtoId, quantidade }`), favoritos (`kabom:favoritos:v1`, lista de ids) e e-mail da última compra (`kabom:email:v1`, usado em "Meus pedidos" e para preencher o checkout). Gaveta do carrinho é um `<dialog>` com três etapas (`data-etapa="itens" | "checkout" | "confirmacao"`); detalhes do produto e "Meus pedidos" também são `<dialog>`.
- `admin.html` + `css/loja.css` + `css/admin.css` + `js/admin.js`: área administrativa, com o mesmo visual da loja (`admin.css` só acrescenta painéis, formulários e tabelas). Seções em abas pelo `#` do endereço (`data-aba`: resumo, clientes, produtos, pedidos); formulários dentro de `<details class="novo">`; busca das tabelas por `input[data-busca]`. `configurarCadastro` (clientes e produtos compartilham o fluxo de adicionar/editar/remover) e pedidos manuais.
- `js/dados.js`: camada compartilhada. Estado `dados` no `localStorage` (`kabom:dados:v5`), `sequencias` com o último id de cada coleção, `proximoId`, `registrarPedido`, `totalPedido`, `precoPix`, constantes `FORMAS_PAGAMENTO`, `DESCONTO_PIX` (10) e `PARCELAS_MAXIMAS` (10). `acompanharOutrasAbas` atualiza a tela quando a outra página muda os dados.
- `js/util.js`: `moeda`, `dataHora`, `maiorId`, `criar` (cria elemento; texto nunca vira HTML), `celula`, `botaoAcao`, `lerFormulario`, `preencherSelect`, `mascaraCpf`, `mascaraTelefone`, `cpfValido`, `aplicarMascara`.
- `js/dados-exemplo.js`: `DADOS_EXEMPLO`. Produto: `{ id, nome, categoria, descricao, preco, precoAntigo?, imagem }` (`precoAntigo` maior que `preco` = oferta, ver `percentualOferta`). Pedido: `{ id, data, clienteId, clienteNome, itens: [{ produtoId, produtoNome, precoUnitario, quantidade }], desconto, formaPagamento, parcelas, endereco, situacao }`.
- `img/logo.png`: ninja da Kabom (PNG com fundo transparente). `img/produtos/`: fotos locais (500 px); créditos em `img/produtos/CREDITOS.md`.

## Convenções

- Nomes de funções, variáveis e textos em pt-BR; funções e variáveis em `camelCase`, constantes globais em `MAIUSCULAS`, ids e classes CSS em `kebab-case`.
- Nada de `innerHTML` com dados (XSS): montar com `criar()`/`textContent`. Nada de `onclick` no HTML: eventos por `addEventListener` e delegação com `data-acao`/`data-id`.
- Ids nunca são reaproveitados (`proximoId` usa `dados.sequencias`).
- Pedido guarda cópia de `clienteNome`, `produtoNome` e `precoUnitario`; remover cliente/produto não mexe nos pedidos.
- Preço cadastrado é o preço cheio (cartão); PIX tem `DESCONTO_PIX` gravado no campo `desconto` do pedido.
- Mudou o formato dos dados salvos? Troque a versão da chave do `localStorage`.
- `css/loja.css` é mobile first (`@media (min-width: ...)`). Fotos novas: locais, com licença livre e crédito no `CREDITOS.md`.
- Identidade própria (nome Kabom, ninja, cores laranja e grafite). A loja é inspirada em lojas de tecnologia, mas não copiar marca, logo ou layout de lojas reais.
- Formatação: `.editorconfig` (4 espaços, LF, UTF-8).

## README com prints

- O `README.md` mostra o projeto com prints em `docs/imagens/` (PNG; 1280 de largura no computador, 500 no celular; poucos, só as telas principais), em tabelas lado a lado.
- Só dados fictícios nas imagens: nada de nome, telefone, e-mail ou chave reais, e nada do serviço na tela.
- Refaça os prints só quando a tela mudar de verdade: gere de novo e compare o tamanho do arquivo; se for idêntico, mantenha o antigo (evita inchar o repositório).
- Como tirar: Chrome sem janela, `chrome.exe --headless=new --hide-scrollbars --window-size=1280,900 --virtual-time-budget=10000 --screenshot=<arquivo> <url>`, com um `--user-data-dir=<pasta temporária>` para cada print. Site estático abre por `file:///`; PHP sobe com `C:\Users\bruno\php\php.exe -S localhost:8000 -t public` (o PHP não está no PATH). O Chrome sem janela não passa de uns 500 de largura.
- A rotina completa está na skill `/readme` do Claude Code.
- Neste projeto: `index.html` (loja) e `admin.html` por `file:///`; os dados vêm do `localStorage` (o botão **Restaurar dados de exemplo** do admin volta ao padrão).

## Notas para futuros agentes

- Reorganizado em 2026-11-06. Problemas corrigidos: XSS pelo `innerHTML`, ids repetidos (`length + 1`), "editar" que apagava e recriava o registro com outro id, tabelas que perdiam o cabeçalho e ficavam com colunas desalinhadas, desconto e parcelas que não apareciam, dados perdidos ao recarregar.
- No mesmo dia virou loja, a pedido do Bruno ("era pra ser tipo um clone da KaBuM"). O cadastro antigo foi para `admin.html` (`css/estilo.css` virou `css/admin.css` e `js/app.js` virou `js/admin.js`); pedido passou a ter vários itens (chave `v2` para `v3`; `v4` quando as fotos do Xbox Series X e do PS5 mudaram de arquivo). As fotos, que eram links externos (alguns quebrados), viraram arquivos locais.
- Em 2026-11-06, a pedido do Bruno ("melhorar o site" e "organizar melhor o admin"): ofertas (`precoAntigo`, chave `v4` para `v5`), favoritos, detalhes do produto, "Meus pedidos", máscaras e validação de CPF, admin em abas com resumo, busca e filtro, e mais um cliente e dois pedidos de exemplo.
- Para testar: abrir `index.html`, comprar algo, finalizar e conferir o pedido em `admin.html`, com o console do navegador sem erros. `node --check js/*.js` valida a sintaxe.

## Regras gerais

- Use português do Brasil (pt-BR) nas respostas ao usuário, na documentação, nos textos da tela e nos textos novos do código.
- Prefira soluções simples; não adicione bibliotecas sem necessidade.
- Não altere arquivos ou funcionalidades fora do escopo da tarefa sem explicar o motivo.
- Atualize o `README.md` quando mudar uso, estrutura ou comportamento importante.
