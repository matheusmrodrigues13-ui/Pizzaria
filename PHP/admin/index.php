<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

$titulo = 'Visão geral';
$ativo  = 'index.php';

$pedidos  = db_read('pedidos', []);
$reservas = db_read('reservas', []);
$mesas    = db_read('mesas', []);
$produtos = db_read('produtos', []);

$hoje = date('Y-m-d');

$pedidosHoje = array_filter($pedidos, function ($p) use ($hoje) {
    return strpos($p['criado_em'] ?? '', $hoje) === 0;
});

$faturamentoHoje = array_reduce($pedidosHoje, function ($soma, $p) {
    return $soma + (($p['status'] ?? '') === 'cancelado' ? 0 : (float) $p['total']);
}, 0);

$emAberto = array_filter($pedidos, function ($p) {
    return !in_array($p['status'] ?? '', ['entregue', 'cancelado'], true);
});

$reservasPendentes = array_filter($reservas, function ($r) {
    return ($r['status'] ?? '') === 'pendente';
});

$ultimos = $pedidos;
usort($ultimos, function ($a, $b) { return strcmp($b['criado_em'] ?? '', $a['criado_em'] ?? ''); });
$ultimos = array_slice($ultimos, 0, 6);

require __DIR__ . '/../includes/admin_header.php';
?>

<div class="grade grade--4 mb-3">
  <div class="cartao-numero">
    <div class="cartao-numero__valor"><?= count($pedidosHoje) ?></div>
    <div class="cartao-numero__rotulo">Pedidos hoje</div>
  </div>
  <div class="cartao-numero">
    <div class="cartao-numero__valor"><?= moeda($faturamentoHoje) ?></div>
    <div class="cartao-numero__rotulo">Faturamento hoje</div>
  </div>
  <div class="cartao-numero">
    <div class="cartao-numero__valor"><?= count($emAberto) ?></div>
    <div class="cartao-numero__rotulo">Pedidos em aberto</div>
  </div>
  <div class="cartao-numero">
    <div class="cartao-numero__valor"><?= count($reservasPendentes) ?></div>
    <div class="cartao-numero__rotulo">Reservas aguardando</div>
  </div>
</div>

<div class="grade grade--2">
  <div class="card">
    <h3 class="mb-2">Últimos pedidos</h3>
    <?php if (!$ultimos): ?>
      <p class="muted pequeno">Nenhum pedido registrado ainda.</p>
    <?php else: ?>
      <table class="tabela">
        <thead>
          <tr><th>#</th><th>Cliente</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          <?php foreach ($ultimos as $pedido): ?>
            <tr>
              <td><?= (int) $pedido['numero'] ?></td>
              <td><?= e($pedido['cliente_nome']) ?></td>
              <td class="preco"><?= moeda($pedido['total']) ?></td>
              <td><span class="selo selo--<?= e($pedido['status']) ?>"><?= e(status_pedido_label($pedido['status'])) ?></span></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      <a class="btn btn--fantasma btn--pequeno mt-3" href="<?= url('admin/pedidos.php') ?>">Ver todos os pedidos</a>
    <?php endif; ?>
  </div>

  <div class="card">
    <h3 class="mb-2">Situação das mesas</h3>
    <p class="pequeno muted mb-2">
      <?= count($mesas) ?> mesas cadastradas ·
      <?= count(array_filter($mesas, function ($m) { return ($m['status'] ?? '') === 'disponivel'; })) ?> disponíveis
    </p>
    <p class="pequeno muted mb-2"><?= count($produtos) ?> itens no cardápio.</p>
    <a class="btn btn--fantasma btn--pequeno" href="<?= url('admin/mesas.php') ?>">Gerenciar mesas</a>
    <a class="btn btn--fantasma btn--pequeno" href="<?= url('admin/produtos.php') ?>">Gerenciar cardápio</a>
  </div>
</div>

<?php require __DIR__ . '/../includes/admin_footer.php'; ?>