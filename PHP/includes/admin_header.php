<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';

exigir_admin();

$titulo = $titulo ?? 'Painel';
$ativo  = $ativo ?? '';
$flash  = flash_get();

$menu_admin = [
    'index.php'         => 'Visão geral',
    'pedidos.php'       => 'Pedidos',
    'reservas.php'      => 'Reservas',
    'mesas.php'         => 'Mesas',
    'produtos.php'      => 'Cardápio',
    'configuracoes.php' => 'Configurações',
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($titulo) ?> — Painel <?= e(SITE_NOME) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="<?= url('assets/css/style.css') ?>">
</head>
<body>

<div class="admin">
  <aside class="admin__lateral">
    <div class="admin__marca">
      <strong><?= e(SITE_NOME) ?></strong>
      <span>Painel</span>
    </div>
    <nav class="admin__menu">
      <?php foreach ($menu_admin as $arquivo => $rotulo): ?>
        <a href="<?= url('admin/' . $arquivo) ?>" class="<?= $ativo === $arquivo ? 'ativo' : '' ?>"><?= e($rotulo) ?></a>
      <?php endforeach; ?>
    </nav>
    <div style="padding:16px 20px;border-top:1px solid rgba(255,255,255,0.1)">
      <a href="<?= url('index.php') ?>" style="font-size:13px;display:block;padding:6px 0">Ver o site</a>
      <a href="<?= url('admin/logout.php') ?>" style="font-size:13px;display:block;padding:6px 0">Sair</a>
    </div>
  </aside>

  <div class="admin__conteudo">
    <div class="admin__topo">
      <div style="display:flex;align-items:center;gap:12px">
        <button type="button" class="btn btn--fantasma btn--pequeno admin__alternar" data-acao="admin-menu">☰</button>
        <h1><?= e($titulo) ?></h1>
      </div>
    </div>

    <?php if ($flash): ?>
      <div class="aviso aviso--<?= $flash['tipo'] === 'erro' ? 'erro' : 'ok' ?>"><?= e($flash['mensagem']) ?></div>
    <?php endif; ?>