<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$usuario = usuario_atual();
if (!$usuario) {
    redirect(url('login.php'));
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(url('checkout.php'));
}
csrf_verificar();

$itensRecebidos = json_decode($_POST['itens'] ?? '[]', true);
if (!is_array($itensRecebidos) || !$itensRecebidos) {
    redirect(url('checkout.php') . '?erro=' . rawurlencode('Seu carrinho está vazio.'));
}

/* -------------------- Recalcula os preços no servidor -------------------- */
$produtos = db_read('produtos', []);
$opcoes   = opcoes_loja();

$precoBordas = [];
foreach (($opcoes['bordas'] ?? []) as $borda) {
    $precoBordas[$borda['nome']] = (float) $borda['preco'];
}
$precoAdicionais = [];
foreach (($opcoes['adicionais'] ?? []) as $adicional) {
    $precoAdicionais[$adicional['nome']] = (float) $adicional['preco'];
}
$taxas = [];
foreach (($opcoes['bairros'] ?? []) as $bairro) {
    $taxas[$bairro['nome']] = (float) $bairro['taxa'];
}

$itens = [];
$subtotal = 0;

foreach ($itensRecebidos as $recebido) {
    $id = (int) preg_replace('/\D/', '', (string) ($recebido['id'] ?? ''));
    $produto = db_buscar($produtos, $id);
    if (!$produto) {
        continue;
    }

    $tamanho = $recebido['tamanho'] ?? null;
    $borda   = $recebido['borda'] ?? null;
    $quantidade = max(1, (int) ($recebido['quantidade'] ?? 1));

    $unitario = preco_base($produto, $tamanho);
    if ($borda) {
        $unitario += $precoBordas[$borda] ?? 0;
    }

    $nomesAdicionais = [];
    foreach (($recebido['adicionais'] ?? []) as $adicional) {
        $nomeAdicional = is_array($adicional) ? ($adicional['nome'] ?? '') : (string) $adicional;
        if ($nomeAdicional === '') {
            continue;
        }
        $nomesAdicionais[] = $nomeAdicional;
        $unitario += $precoAdicionais[$nomeAdicional] ?? 0;
    }

    $subtotal += $unitario * $quantidade;

    $itens[] = [
        'nome'           => $produto['nome'],
        'tipo'           => $produto['categoria'],
        'tamanho'        => $tamanho,
        'borda'          => $borda,
        'adicionais'     => $nomesAdicionais,
        'observacoes'    => trim((string) ($recebido['observacoes'] ?? '')),
        'quantidade'     => $quantidade,
        'preco_unitario' => round($unitario, 2),
    ];
}

if (!$itens) {
    redirect(url('checkout.php') . '?erro=' . rawurlencode('Não encontramos os itens do seu carrinho.'));
}

/* ------------------------------- Entrega -------------------------------- */
$tipo = ($_POST['tipo'] ?? 'entrega') === 'retirada' ? 'retirada' : 'entrega';
$bairro = trim((string) ($_POST['bairro'] ?? ''));

if ($tipo === 'entrega') {
    if (trim((string) ($_POST['rua'] ?? '')) === '' || trim((string) ($_POST['numero'] ?? '')) === '' || $bairro === '') {
        redirect(url('checkout.php') . '?erro=' . rawurlencode('Preencha o endereço de entrega.'));
    }
}

$taxaEntrega = $tipo === 'entrega' ? ($taxas[$bairro] ?? 0) : 0;
$total = $subtotal + $taxaEntrega;

/* ------------------------------- Registro ------------------------------- */
$pedidos = db_read('pedidos', []);

$ultimoNumero = 1041;
foreach ($pedidos as $pedido) {
    if (isset($pedido['numero']) && (int) $pedido['numero'] > $ultimoNumero) {
        $ultimoNumero = (int) $pedido['numero'];
    }
}

$pedido = [
    'id'               => db_proximo_id($pedidos),
    'numero'           => $ultimoNumero + 1,
    'codigo'           => gerar_codigo(),
    'usuario_id'       => (int) $usuario['id'],
    'cliente_nome'     => trim((string) ($_POST['nome'] ?? $usuario['nome'])),
    'cliente_email'    => $usuario['email'],
    'cliente_telefone' => trim((string) ($_POST['telefone'] ?? '')),
    'itens'            => $itens,
    'tipo'             => $tipo,
    'endereco'         => $tipo === 'entrega' ? [
        'cep'         => trim((string) ($_POST['cep'] ?? '')),
        'rua'         => trim((string) ($_POST['rua'] ?? '')),
        'numero'      => trim((string) ($_POST['numero'] ?? '')),
        'bairro'      => $bairro,
        'complemento' => trim((string) ($_POST['complemento'] ?? '')),
        'referencia'  => trim((string) ($_POST['referencia'] ?? '')),
    ] : null,
    'pagamento'        => trim((string) ($_POST['pagamento'] ?? '')),
    'subtotal'         => round($subtotal, 2),
    'taxa_entrega'     => round($taxaEntrega, 2),
    'desconto'         => 0,
    'total'            => round($total, 2),
    'status'           => 'recebido',
    'observacoes'      => trim((string) ($_POST['observacoes'] ?? '')),
    'tempo_estimado'   => $tipo === 'entrega' ? '45-60 min' : '25-35 min',
    'criado_em'        => date('Y-m-d H:i:s'),
];

$pedidos[] = $pedido;
db_write('pedidos', $pedidos);

flash_set('Pedido #' . $pedido['numero'] . ' confirmado! Seu código é ' . $pedido['codigo'] . '.');
redirect(url('acompanhamento.php') . '?numero=' . $pedido['numero'] . '&novo=1');