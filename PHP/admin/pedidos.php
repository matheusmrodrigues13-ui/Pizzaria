<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

exigir_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();
    $pedidos = db_read('pedidos', []);
    $id = (int) ($_POST['id'] ?? 0);
    $novoStatus = (string) ($_POST['status'] ?? '');

    if (isset(status_pedido()[$novoStatus])) {
        foreach ($pedidos as $indice => $pedido) {
            if ((int) $pedido['id'] === $id) {
                $pedidos[$indice]['status'] = $novoStatus;
            }
        }
        db_write('pedidos', $pedidos);
        flash_set('Status do pedido atualizado.');
    }

    redirect(url('admin/pedidos.php') . (!empty($_POST['filtro']) ? '?status=' . urlencode($_POST['filtro']) : ''));
}

$titulo = 'Pedidos';
$ativo  = 'pedidos.php';

$filtro = (string) ($_GET['status'] ?? 'todos');
$pedidos = db_read('pedidos', []);
usort($pedidos, function ($a, $b) { return strcmp($b['criado_em'] ?? '', $a['criado_em'] ?? ''); });

if ($filtro !== 'todos' && isset(status_pedido()[$filtro])) {
    $pedidos = array_values(array_filter($pedidos, function ($p) use ($filtro) { return ($p['status'] ?? '') === $filtro; }));
}

require __DIR__ . '/../includes/admin_header.php';
?>

<div class="barra-filtros">
  <a href="<?= url('admin/pedidos.php') ?>" class="<?= $filtro === 'todos' ? 'ativo' : '' ?>">Todos</a>
  <?php foreach (status_pedido() as $chave => $rotulo): ?>
    <a href="<?= url('admin/pedidos.php?status=' . $chave) ?>" class="<?= $filtro === $chave ? 'ativo' : '' ?>"><?= e($rotulo) ?></a>
  <?php endforeach; ?>
</div>

<?php if (!$pedidos): ?>
  <div class="card texto-centro"><p class="muted">Nenhum pedido encontrado.</p></div>
<?php else: ?>
  <?php foreach ($pedidos as $pedido): ?>
    <div class="card mb-2">
      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start">
        <div>
          <strong>Pedido #<?= (int) $pedido['numero'] ?></strong>
          <span class="selo selo--<?= e($pedido['status']) ?>"><?= e(status_pedido_label($pedido['status'])) ?></span>
          <div class="pequeno muted mt-1">
            <?= e(date('d/m/Y H:i', strtotime($pedido['criado_em'] ?? 'now'))) ?> ·
            <?= $pedido['tipo'] === 'entrega' ? 'Entrega' : 'Retirada' ?> ·
            Código <?= e($pedido['codigo']) ?>
          </div>
          <div class="pequeno muted">
            👤 <?= e($pedido['cliente_nome']) ?>
            <?php if (!empty($pedido['cliente_email'])): ?> · ✉️ <?= e($pedido['cliente_email']) ?><?php endif; ?>
            <?php if (!empty($pedido['cliente_telefone'])): ?> · 📞 <?= e($pedido['cliente_telefone']) ?><?php endif; ?>
          </div>
          <?php if (!empty($pedido['endereco'])): ?>
            <?php $endereco = $pedido['endereco']; ?>
            <div class="pequeno muted">
              📍 <?= e($endereco['rua'] ?? '') ?>, <?= e($endereco['numero'] ?? '') ?>
              <?= !empty($endereco['complemento']) ? ' — ' . e($endereco['complemento']) : '' ?>
              — <?= e($endereco['bairro'] ?? '') ?>
            </div>
          <?php endif; ?>
        </div>

        <div class="texto-centro">
          <div class="preco" style="font-size:22px"><?= moeda($pedido['total']) ?></div>
          <div class="pequeno muted"><?= e($pedido['pagamento']) ?></div>
        </div>
      </div>

      <details class="mt-2">
        <summary style="cursor:pointer;font-size:14px;font-weight:600">Ver itens</summary>
        <div class="mt-2">
          <?php foreach (($pedido['itens'] ?? []) as $item): ?>
            <div class="pequeno" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--borda)">
              <span>
                <?= (int) $item['quantidade'] ?>× <?= e($item['nome']) ?>
                <?= !empty($item['tamanho']) ? ' (' . e($item['tamanho']) . ')' : '' ?>
                <?= !empty($item['borda']) && $item['borda'] !== 'Sem borda recheada' ? ' · borda ' . e($item['borda']) : '' ?>
                <?= !empty($item['adicionais']) ? ' · + ' . e(implode(', ', $item['adicionais'])) : '' ?>
                <?= !empty($item['observacoes']) ? ' · "' . e($item['observacoes']) . '"' : '' ?>
              </span>
              <span class="preco"><?= moeda($item['preco_unitario'] * $item['quantidade']) ?></span>
            </div>
          <?php endforeach; ?>

          <div class="pequeno mt-2" style="display:flex;justify-content:space-between"><span>Subtotal</span><span><?= moeda($pedido['subtotal']) ?></span></div>
          <div class="pequeno" style="display:flex;justify-content:space-between"><span>Taxa de entrega</span><span><?= moeda($pedido['taxa_entrega']) ?></span></div>
          <?php if (!empty($pedido['observacoes'])): ?>
            <p class="pequeno mt-2"><strong>Observações:</strong> <?= e($pedido['observacoes']) ?></p>
          <?php endif; ?>
        </div>
      </details>

      <form method="post" action="<?= url('admin/pedidos.php') ?>" style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-top:16px">
        <?= csrf_campo() ?>
        <input type="hidden" name="id" value="<?= (int) $pedido['id'] ?>">
        <input type="hidden" name="filtro" value="<?= e($filtro === 'todos' ? '' : $filtro) ?>">
        <div class="campo" style="margin:0;min-width:200px">
          <label>Alterar status</label>
          <select name="status">
            <?php foreach (status_pedido() as $chave => $rotulo): ?>
              <option value="<?= e($chave) ?>" <?= ($pedido['status'] ?? '') === $chave ? 'selected' : '' ?>><?= e($rotulo) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <button type="submit" class="btn btn--primario btn--pequeno">Salvar</button>
      </form>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<?php require __DIR__ . '/../includes/admin_footer.php'; ?>