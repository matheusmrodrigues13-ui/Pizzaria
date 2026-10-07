<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$usuario = usuario_atual();
if (!$usuario) {
    redirect(url('login.php') . '?voltar=' . rawurlencode(url('perfil.php')));
}

$titulo = 'Meu Perfil';
$ativo  = '';

$pedidos = array_values(array_filter(db_read('pedidos', []), function ($p) use ($usuario) {
    return isset($p['usuario_id']) && (int) $p['usuario_id'] === (int) $usuario['id'];
}));
usort($pedidos, function ($a, $b) { return strcmp($b['criado_em'] ?? '', $a['criado_em'] ?? ''); });

$reservas = array_values(array_filter(db_read('reservas', []), function ($r) use ($usuario) {
    return isset($r['usuario_id']) && (int) $r['usuario_id'] === (int) $usuario['id'] && $r['status'] !== 'cancelada';
}));
usort($reservas, function ($a, $b) { return strcmp($b['data'] ?? '', $a['data'] ?? ''); });

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container" style="max-width:960px">
    <div class="cabecalho-secao texto-centro">
      <span class="olho">Minha conta</span>
      <h2 class="titulo-secao">Perfil</h2>
      <p class="subtitulo">Seus dados, seu histórico de pedidos e suas reservas.</p>
    </div>

    <div class="card mb-3">
      <h3 class="mb-2">Dados cadastrais</h3>
      <p class="pequeno"><strong>Nome:</strong> <?= e($usuario['nome']) ?></p>
      <p class="pequeno"><strong>Login (e-mail):</strong> <?= e($usuario['email']) ?></p>
    </div>

    <h3 class="mb-2" style="font-size:24px">Histórico de pedidos</h3>
    <?php if (!$pedidos): ?>
      <div class="card texto-centro">
        <p class="muted">Você ainda não fez nenhum pedido.</p>
        <a class="btn btn--primario btn--pequeno mt-2" href="<?= url('cardapio.php') ?>">Ver o cardápio</a>
      </div>
    <?php else: ?>
      <?php foreach ($pedidos as $pedido): ?>
        <div class="card mb-2" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
          <div>
            <strong>Pedido #<?= (int) $pedido['numero'] ?></strong>
            <div class="pequeno muted">
              <?= e(date('d/m/Y', strtotime($pedido['criado_em'] ?? 'now'))) ?> ·
              <?= count($pedido['itens'] ?? []) ?> itens ·
              <?= $pedido['tipo'] === 'entrega' ? 'Entrega' : 'Retirada' ?>
            </div>
            <div class="pequeno muted">Código <?= e($pedido['codigo']) ?></div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <span class="preco"><?= moeda($pedido['total']) ?></span>
            <span class="selo selo--<?= e($pedido['status']) ?>"><?= e(status_pedido_label($pedido['status'])) ?></span>
            <a class="btn btn--fantasma btn--pequeno" href="<?= url('acompanhamento.php?numero=' . (int) $pedido['numero']) ?>">Acompanhar</a>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>

    <h3 class="mb-2 mt-4" style="font-size:24px">Reservas ativas</h3>
    <?php if (!$reservas): ?>
      <div class="card texto-centro">
        <p class="muted">Nenhuma reserva ativa no momento.</p>
        <a class="btn btn--primario btn--pequeno mt-2" href="<?= url('reserva.php') ?>">Reservar uma mesa</a>
      </div>
    <?php else: ?>
      <?php foreach ($reservas as $reserva): ?>
        <div class="card mb-2" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
          <div>
            <strong>Mesa <?= (int) $reserva['mesa_numero'] ?></strong>
            <div class="pequeno muted">
              <?= e(date('d/m/Y', strtotime($reserva['data']))) ?> às <?= e($reserva['horario']) ?> ·
              <?= (int) $reserva['pessoas'] ?> pessoa(s)
            </div>
          </div>
          <span class="selo selo--<?= e($reserva['status']) ?>"><?= e(status_reserva_label($reserva['status'])) ?></span>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>