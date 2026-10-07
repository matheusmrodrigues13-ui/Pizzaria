<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

exigir_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();

    $reservas = db_read('reservas', []);
    $mesas    = db_read('mesas', []);
    $id = (int) ($_POST['id'] ?? 0);
    $novoStatus = (string) ($_POST['status'] ?? '');

    if (isset(status_reserva()[$novoStatus])) {
        $mesaLiberada = null;

        foreach ($reservas as $indice => $reserva) {
            if ((int) $reserva['id'] === $id) {
                $reservas[$indice]['status'] = $novoStatus;
                if ($novoStatus === 'cancelada') {
                    $mesaLiberada = (int) $reserva['mesa_numero'];
                }
            }
        }

        if ($mesaLiberada !== null) {
            foreach ($mesas as $indice => $mesa) {
                if ((int) $mesa['numero'] === $mesaLiberada) {
                    $mesas[$indice]['status'] = 'disponivel';
                }
            }
            db_write('mesas', $mesas);
        }

        db_write('reservas', $reservas);
        flash_set('Reserva atualizada.');
    }

    redirect(url('admin/reservas.php'));
}

$titulo = 'Reservas';
$ativo  = 'reservas.php';

$reservas = db_read('reservas', []);
usort($reservas, function ($a, $b) {
    return strcmp(($b['data'] ?? '') . ($b['horario'] ?? ''), ($a['data'] ?? '') . ($a['horario'] ?? ''));
});

require __DIR__ . '/../includes/admin_header.php';
?>

<?php if (!$reservas): ?>
  <div class="card texto-centro"><p class="muted">Nenhuma reserva registrada ainda.</p></div>
<?php else: ?>
  <table class="tabela">
    <thead>
      <tr>
        <th>Data</th><th>Hora</th><th>Mesa</th><th>Pessoas</th><th>Cliente</th><th>Status</th><th></th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($reservas as $reserva): ?>
        <tr>
          <td><?= e(date('d/m/Y', strtotime($reserva['data']))) ?></td>
          <td><?= e($reserva['horario']) ?></td>
          <td><strong><?= (int) $reserva['mesa_numero'] ?></strong></td>
          <td><?= (int) $reserva['pessoas'] ?></td>
          <td>
            <?= e($reserva['cliente_nome']) ?>
            <div class="pequeno muted">
              <?= e($reserva['cliente_telefone'] ?? '') ?>
              <?php if (!empty($reserva['cliente_email'])): ?> · <?= e($reserva['cliente_email']) ?><?php endif; ?>
            </div>
          </td>
          <td><span class="selo selo--<?= e($reserva['status']) ?>"><?= e(status_reserva_label($reserva['status'])) ?></span></td>
          <td>
            <form method="post" action="<?= url('admin/reservas.php') ?>" style="display:flex;gap:8px;align-items:center">
              <?= csrf_campo() ?>
              <input type="hidden" name="id" value="<?= (int) $reserva['id'] ?>">
              <select name="status" style="padding:6px 10px;border-radius:8px;border:1px solid var(--borda)">
                <?php foreach (status_reserva() as $chave => $rotulo): ?>
                  <option value="<?= e($chave) ?>" <?= ($reserva['status'] ?? '') === $chave ? 'selected' : '' ?>><?= e($rotulo) ?></option>
                <?php endforeach; ?>
              </select>
              <button type="submit" class="btn btn--primario btn--pequeno">Salvar</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>

<?php require __DIR__ . '/../includes/admin_footer.php'; ?>