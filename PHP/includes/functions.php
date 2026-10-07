<?php
/**
 * Funções utilitárias usadas em todo o site.
 */

/** Escapa texto para exibir em HTML. */
function e($valor)
{
    return htmlspecialchars((string) $valor, ENT_QUOTES, 'UTF-8');
}

/** Formata um número como moeda brasileira. */
function moeda($valor)
{
    return 'R$ ' . number_format((float) $valor, 2, ',', '.');
}

/** Categorias de produto do cardápio. */
function categorias()
{
    return [
        'pizza_salgada' => 'Pizzas Salgadas',
        'pizza_doce'    => 'Pizzas Doces',
        'bebida'        => 'Bebidas',
        'sobremesa'     => 'Sobremesas',
        'complemento'   => 'Complementos',
    ];
}

function categoria_label($categoria)
{
    $mapa = categorias();
    return $mapa[$categoria] ?? 'Outros';
}

/** Status possíveis de um pedido. */
function status_pedido()
{
    return [
        'recebido'     => 'Recebido',
        'confirmado'   => 'Confirmado',
        'preparo'      => 'Em preparo',
        'pronto'       => 'Pronto',
        'saiu_entrega' => 'Saiu para entrega',
        'entregue'     => 'Entregue',
        'cancelado'    => 'Cancelado',
    ];
}

function status_pedido_label($status)
{
    $mapa = status_pedido();
    return $mapa[$status] ?? $status;
}

function status_pedido_fluxo()
{
    return ['recebido', 'confirmado', 'preparo', 'pronto', 'saiu_entrega', 'entregue'];
}

function status_reserva()
{
    return [
        'pendente'   => 'Aguardando confirmação',
        'confirmada' => 'Confirmada',
        'cancelada'  => 'Cancelada',
    ];
}

function status_reserva_label($status)
{
    $mapa = status_reserva();
    return $mapa[$status] ?? $status;
}

function status_mesa()
{
    return [
        'disponivel' => 'Disponível',
        'reservada'  => 'Reservada',
        'ocupada'    => 'Ocupada',
        'limpeza'    => 'Em limpeza',
    ];
}

/** Redireciona e encerra a execução. */
function redirect($destino)
{
    header('Location: ' . $destino);
    exit;
}

/** Garante que o destino de um redirecionamento seja um caminho interno. */
function destino_seguro($valor, $padrao)
{
    if (!is_string($valor) || $valor === '') {
        return $padrao;
    }
    if (strpos($valor, '/') !== 0 || strpos($valor, '//') === 0 || strpos($valor, '\\') !== false) {
        return $padrao;
    }
    return $valor;
}

/** Gera o token CSRF da sessão. */
function csrf_token()
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/** Campo oculto com o token CSRF. */
function csrf_campo()
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

/** Valida o token CSRF de um POST. */
function csrf_verificar()
{
    $enviado = $_POST['csrf'] ?? '';
    if (!is_string($enviado) || !hash_equals($_SESSION['csrf'] ?? '', $enviado)) {
        http_response_code(403);
        exit('Sessão expirada. Volte à página anterior e tente novamente.');
    }
}

/** Código de acompanhamento do pedido, ex.: LT-7K3M9Q. */
function gerar_codigo()
{
    $caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $codigo = '';
    for ($i = 0; $i < 6; $i++) {
        $codigo .= $caracteres[random_int(0, strlen($caracteres) - 1)];
    }
    return 'LT-' . $codigo;
}

/** Link do WhatsApp a partir de um número com DDI. */
function whatsapp_link($numero, $texto = '')
{
    $digitos = preg_replace('/\D/', '', (string) $numero);
    if (!$digitos) {
        return null;
    }
    return 'https://wa.me/' . $digitos . ($texto ? '?text=' . rawurlencode($texto) : '');
}

/** Dados da loja (endereço, telefone, redes). */
function config_loja()
{
    static $config = null;
    if ($config === null) {
        $lista = db_read('configuracao', []);
        $config = $lista[0] ?? [];
    }
    return $config;
}

/** Opções do cardápio (bordas, adicionais, bairros, pagamentos). */
function opcoes_loja()
{
    static $opcoes = null;
    if ($opcoes === null) {
        $lista = db_read('opcoes', []);
        $opcoes = $lista[0] ?? ['bordas' => [], 'adicionais' => [], 'bairros' => [], 'pagamentos' => []];
    }
    return $opcoes;
}

/** Mensagem rápida exibida uma única vez. */
function flash_set($mensagem, $tipo = 'ok')
{
    $_SESSION['flash'] = ['mensagem' => $mensagem, 'tipo' => $tipo];
}

function flash_get()
{
    if (empty($_SESSION['flash'])) {
        return null;
    }
    $flash = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $flash;
}

/** Lista os produtos ativos. */
function produtos_ativos()
{
    $produtos = db_read('produtos', []);
    return array_values(array_filter($produtos, function ($p) {
        return !isset($p['ativo']) || $p['ativo'];
    }));
}

/** Preço base de um produto conforme o tamanho escolhido. */
function preco_base($produto, $tamanho = null)
{
    if ($tamanho === 'Pequena' && !empty($produto['preco_pequena'])) {
        return (float) $produto['preco_pequena'];
    }
    if ($tamanho === 'Média' && !empty($produto['preco_media'])) {
        return (float) $produto['preco_media'];
    }
    if ($tamanho === 'Grande' && !empty($produto['preco_grande'])) {
        return (float) $produto['preco_grande'];
    }
    if (!empty($produto['preco'])) {
        return (float) $produto['preco'];
    }
    return (float) ($produto['preco_media'] ?? $produto['preco_pequena'] ?? $produto['preco_grande'] ?? 0);
}

/** Menor preço de um produto (usado nos cards). */
function preco_minimo($produto)
{
    $valores = array_filter([
        $produto['preco'] ?? null,
        $produto['preco_pequena'] ?? null,
        $produto['preco_media'] ?? null,
        $produto['preco_grande'] ?? null,
    ], function ($v) {
        return $v !== null && $v !== '' && (float) $v > 0;
    });

    return $valores ? min(array_map('floatval', $valores)) : 0;
}

/** Uma pizza (com tamanhos) ou um item simples? */
function tem_tamanhos($produto)
{
    return !empty($produto['preco_pequena']) || !empty($produto['preco_media']) || !empty($produto['preco_grande']);
}

/** HTML do card de um produto do cardápio. */
function card_produto($produto)
{
    $id = (int) $produto['id'];
    $nome = e($produto['nome']);
    $descricao = e($produto['descricao'] ?? '');
    $imagem = e($produto['imagem'] ?? '');
    $comTamanhos = tem_tamanhos($produto);

    $html = '<article class="produto">';
    $html .= '<div class="produto__foto">';
    if ($imagem) {
        $html .= '<img src="' . $imagem . '" alt="' . $nome . '" loading="lazy">';
    }
    if (!empty($produto['promocao'])) {
        $html .= '<span class="etiqueta etiqueta--promo">Promoção</span>';
    } elseif (!empty($produto['popular'])) {
        $html .= '<span class="etiqueta etiqueta--popular">Popular</span>';
    }
    $html .= '</div>';

    $html .= '<div class="produto__corpo">';
    $html .= '<h3 class="produto__nome">' . $nome . '</h3>';
    if ($descricao) {
        $html .= '<p class="produto__desc">' . $descricao . '</p>';
    }
    if (!empty($produto['promocao_texto'])) {
        $html .= '<p class="pequeno" style="color:var(--sienna);font-weight:600">' . e($produto['promocao_texto']) . '</p>';
    }

    $html .= '<div class="produto__rodape">';
    $html .= '<span class="preco">' . ($comTamanhos ? 'a partir de ' : '') . moeda(preco_minimo($produto)) . '</span>';

    if ($comTamanhos) {
        $html .= '<button type="button" class="btn btn--primario btn--pequeno" data-personalizar="p' . $id . '">Personalizar</button>';
    } else {
        $html .= '<button type="button" class="btn btn--primario btn--pequeno"'
            . ' data-adicionar="' . $id . '"'
            . ' data-nome="' . $nome . '"'
            . ' data-tipo="' . e($produto['categoria']) . '"'
            . ' data-preco="' . (float) preco_minimo($produto) . '">Adicionar</button>';
    }

    $html .= '</div></div></article>';

    return $html;
}

/** Dados enviados ao JavaScript para o personalizador de pizza. */
function dados_personalizador($produtos)
{
    $opcoes = opcoes_loja();
    $mapa = [];

    foreach ($produtos as $produto) {
        if (!tem_tamanhos($produto)) {
            continue;
        }
        $mapa['p' . $produto['id']] = [
            'id'            => (int) $produto['id'],
            'nome'          => $produto['nome'],
            'categoria'     => $produto['categoria'],
            'descricao'     => $produto['descricao'] ?? '',
            'preco_pequena' => $produto['preco_pequena'] ?? null,
            'preco_media'   => $produto['preco_media'] ?? null,
            'preco_grande'  => $produto['preco_grande'] ?? null,
            'preco'         => $produto['preco'] ?? null,
        ];
    }

    return [
        'bordas'     => $opcoes['bordas'] ?? [],
        'adicionais' => $opcoes['adicionais'] ?? [],
        'produtos'   => $mapa,
    ];
}