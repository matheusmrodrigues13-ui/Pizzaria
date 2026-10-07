# La Tavola — versão PHP

App completo da pizzaria em **PHP + HTML + CSS + JavaScript**, com os dados guardados
em arquivos **JSON**. Não precisa de MySQL: basta subir os arquivos em qualquer
hospedagem com PHP 7.4 ou superior.

> Esta pasta é independente do app React. Ela não roda na Base44 — foi feita para
> você hospedar no seu próprio servidor.

---

## Como instalar

1. Baixe a pasta `php` inteira.
2. Envie o conteúdo para o seu servidor (via FTP, cPanel ou XAMPP).
   - Em XAMPP, coloque em `C:\xampp\htdocs\latavola\`.
3. Dê permissão de **escrita** na pasta `data/` (chmod `775` ou `777` em hospedagens Linux).
   É onde os pedidos, reservas e usuários são gravados.
4. Acesse `https://seusite.com/` — o site já abre com o cardápio preenchido.

O caminho base é detectado automaticamente, então funciona tanto na raiz do domínio
quanto dentro de uma subpasta (ex.: `seusite.com/pizzaria/`).

### Requisitos
- PHP 7.4+ (funciona em 8.x)
- Extensão `json` (já vem habilitada por padrão)
- Servidor Apache (o `.htaccess` incluso já protege a pasta `data/`)

Se usar **Nginx**, bloqueie o acesso à pasta `data/` no arquivo de configuração:

```nginx
location ~ ^/data/ { deny all; }
```

---

## Acesso ao painel

- Endereço: `/admin/login.php`
- Usuário: `admin`
- Senha: `admin123`

**Troque a senha no primeiro acesso**, em *Configurações → Acesso ao painel*.
Ao trocar, a senha passa a ser guardada com hash (bcrypt) automaticamente.

---

## O que o sistema faz

**Área do cliente**
| Página | O que faz |
|---|---|
| `index.php` | Home com destaques, mais pedidas, promoções, bebidas e sobremesas |
| `cardapio.php` | Cardápio completo com filtro por categoria |
| `promocoes.php` | Ofertas da casa e itens em promoção |
| `reserva.php` | Reserva de mesa com mapa de mesas (exige login) |
| `checkout.php` | Finalização do pedido (exige login) |
| `acompanhamento.php` | Consulta do pedido por número ou código, com linha do tempo |
| `perfil.php` | Dados do cliente, histórico de pedidos e reservas |
| `contato.php` | Formulário que abre o WhatsApp + endereço, mapa e redes sociais |
| `login.php` / `register.php` | Login e cadastro de clientes |

**Painel administrativo** (`/admin`)
| Página | O que faz |
|---|---|
| `index.php` | Visão geral: pedidos do dia, faturamento, pedidos em aberto, reservas pendentes |
| `pedidos.php` | Lista e filtro de pedidos, detalhes dos itens e troca de status |
| `reservas.php` | Lista de reservas e confirmação/cancelamento |
| `mesas.php` | Cadastro de mesas, capacidade e status |
| `produtos.php` | Cadastro completo do cardápio (preços por tamanho, promoções, imagem) |
| `configuracoes.php` | Endereço, telefone, WhatsApp, redes sociais, horário e senha do painel |

---

## Carrinho e pedidos

O carrinho fica no navegador do cliente (`localStorage`), então não ocupa o servidor
enquanto ele navega. No momento de confirmar o pedido:

- o cliente precisa estar logado;
- os **preços são recalculados no servidor** a partir do `data/produtos.json`,
  ignorando o que veio do navegador (evita manipulação);
- o **número** e o **código** do pedido são gerados pelo servidor.

---

## Onde ficam os dados

Tudo em `data/`, em arquivos JSON fáceis de ler e editar:

| Arquivo | Conteúdo |
|---|---|
| `produtos.json` | Itens do cardápio |
| `promocoes.json` | Promoções |
| `mesas.json` | Mesas do salão |
| `opcoes.json` | Bordas, adicionais, bairros e formas de pagamento |
| `configuracao.json` | Dados da pizzaria |
| `pedidos.json` | Pedidos recebidos |
| `reservas.json` | Reservas |
| `usuarios.json` | Clientes cadastrados |
| `admin.json` | Credenciais do painel |

Você pode editar `opcoes.json` direto no editor de texto para mudar os preços das
bordas, dos adicionais e as taxas de entrega por bairro.

---

## Personalização rápida

- **Cores e fontes:** `assets/css/style.css`, nas variáveis do topo (`--wine`, `--gold`, `--cream`…).
- **Nome da pizzaria:** `includes/config.php` (`SITE_NOME` e `SITE_SUB`).
- **Fuso horário:** `includes/config.php` (`date_default_timezone_set`).

---

## Segurança já incluída

- Senhas de clientes com `password_hash` (bcrypt)
- Token CSRF em todos os formulários que gravam dados
- Escape de HTML em tudo que é exibido
- Pasta `data/` bloqueada por `.htaccess`
- Preços recalculados no servidor no fechamento do pedido

Recomendado ainda: servir o site em **HTTPS** e manter backups regulares da pasta `data/`.