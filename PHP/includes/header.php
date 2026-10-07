<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';

$titulo = $titulo ?? SITE_NOME;
$ativo  = $ativo ?? '';
$loja   = config_loja();
$usuario = usuario_atual();
$flash  = flash_get();

$titulo_pagina = ($titulo === SITE_NOME) ? SITE_NOME . ' — ' . SITE_SUB : $titulo . ' — ' . SITE_NOME;

$menu = [
    'index.php'          => 'Início',
    'cardapio.php'       => 'Cardápio',
    'promocoes.php'      => 'Promoções',
    'reserva.php'        => 'Reservar Mesa',
    'acompanhamento.php' => 'Meu Pedido',
    'contato.php'        => 'Contato',
];

$whatsapp = whatsapp_link($loja['whatsapp'] ?? '', 'Olá! Gostaria de falar com a ' . SITE_NOME . '.');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($titulo_pagina) ?></title>
<meta name="description" content="<?= e(SITE_NOME) ?> — pizzaria artesanal. Cardápio, delivery, reservas de mesa e promoções.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="<?= url('assets/css/style.css') ?>">
</head>
<body data-limpar-carrinho="<?= !empty($limpar_carrinho) ? '1' : '0' ?>">

<header class="topo">
  <div class="topo__linha">
    <a class="marca" href="<?= url('index.php') ?>">
      <span class="marca__icone">🍕</span>
      <span>
        <span class="marca__nome"><?= e(SITE_NOME) ?></span>
        <span class="marca__sub"><?= e(SITE_SUB) ?></span>
      </span>
    </a>

    <nav class="nav">
      <?php foreach ($menu as $arquivo => $rotulo): ?>
        <a href="<?= url($arquivo) ?>" class="<?= $ativo === $arquivo ? 'ativo' : '' ?>"><?= e($rotulo) ?></a>
      <?php endforeach; ?>
    </nav>

    <div class="topo__acoes">
      <?php if ($usuario): ?>
        <a class="btn btn--fantasma btn--pequeno" href="<?= url('perfil.php') ?>">Olá, <?= e(explode(' ', $usuario['nome'])[0]) ?></a>
        <a class="btn btn--fantasma btn--pequeno" href="<?= url('logout.php') ?>">Sair</a>
      <?php else: ?>
        <a class="btn btn--fantasma btn--pequeno" href="<?= url('login.php') ?>">Entrar</a>
      <?php endif; ?>

      <button type="button" class="btn-carrinho" data-acao="abrir-carrinho" aria-label="Abrir carrinho">
        🛒
        <span class="btn-carrinho__badge" id="carrinho-badge" style="display:none">0</span>
      </button>

      <button type="button" class="btn-menu" data-acao="menu" aria-label="Abrir menu">☰</button>
    </div>
  </div>

  <nav class="nav-mobile" id="nav-mobile">
    <?php foreach ($menu as $arquivo => $rotulo): ?>
      <a href="<?= url($arquivo) ?>"><?= e($rotulo) ?></a>
    <?php endforeach; ?>
    <?php if ($usuario): ?>
      <a href="<?= url('perfil.php') ?>">Meu Perfil</a>
      <a href="<?= url('logout.php') ?>">Sair</a>
    <?php else: ?>
      <a href="<?= url('login.php') ?>">Entrar</a>
      <a href="<?= url('register.php') ?>">Criar conta</a>
    <?php endif; ?>
  </nav>
</header>

<?php if ($flash): ?>
  <div class="container mt-2">
    <div class="aviso aviso--<?= $flash['tipo'] === 'erro' ? 'erro' : 'ok' ?>"><?= e($flash['mensagem']) ?></div>
  </div>
<?php endif; ?>

<main>