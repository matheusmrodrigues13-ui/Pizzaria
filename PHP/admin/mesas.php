<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

exigir_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();
    $mesas = db_read('mesas', []);
    $acao  = (string) ($_POST['acao'] ?? '');

    if ($acao === 'status') {
        $id = (int) ($_POST['id'] ?? 0);
        $novoStatus = (string) ($_POST['status'] ?? '');
        if (isset(status_mesa()[$novoStatus])) {
            foreach ($mesas as $indice => $mesa) {
                if ((int) $mesa['id'] === $id) {
                    $mesas[$indice]['status'] = $novoStatus;
                }
            }
            db_write('mesas', $mesas);
            flash_set('Mesa atualizada.');
        }
    }

    if ($acao === 'criar') {
        $numero = (int) ($_POST['numero'] ?? 0);
        $capacidade = (int) ($_POST['capacidade'] ?? 0);

        if ($numero <= 0 || $capacidade <= 0) {
            flash_set('Informe o número e a capacidade da mesa.', 'erro');
        } else {
            $existe = false;
            foreach ($mesas as $mesa) {
                if ((int) $mesa['numero'] === $numero) { $existe = true; }
            }
            if ($existe) {
                flash_set('Já existe uma mesa com esse número.', 'erro');
            } else {
                $mesas[] = [
                    'id'         => db_proximo_id($mesas),
                    'numero'     => $numero,
                    'capacidade' => $capacidade,
                    'status'     => 'disponivel',
                ];
                db_write('mesas', $mesas);
                flash_set('Mesa adicionada.');
            }
        }
    }

    if ($acao === 'excluir') {
        $id = (int) ($_POST['id'] ?? 0);
        $mesas = array_values(array_filter($mesas, function ($mesa) use ($id) {
            return (int) $mesa['id'] !== $id;
        }));
        db_write('mesas', $mesas);
        flash_set('Mesa removida.');
    }

    redirect(url('admin/mesas.php'));
}

$titulo = 'Mesas';
$ativo  = 'mesas.php';

$mesas = db_read('mesas', []);
usort($mesas, function ($a, $b) { return (int) $a['numero'] <=> (int) $b['numero']; });

require __DIR__ . '/../includes/admin_header.php';
?>

<div class="grade grade--2" style="align-items:start">
  <div class="card">
    <h3 class="mb-2">Mesas cadastradas</h3>
    <?php if (!$mesas): ?>
      <p class="muted pequeno">Nenhuma mesa cadastrada.</p>
    <?php else: ?>
      <table class="tabela">
        <thead>
          <tr><th>Mesa</th><th>Lugares</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <?php foreach ($mesas as $mesa): ?>
            <tr>
              <td><strong><?= (int) $mesa['numero'] ?></strong></td>
              <td><?= (int) $mesa['capacidade'] ?></td>
              <td>
                <form method="post" action="<?= url('admin/mesas.php') ?>" style="display:flex;gap:8px;align-items:center">
                  <?= csrf_campo() ?>
                  <input type="hidden" name="acao" value="status">
                  <input type="hidden" name="id" value="<?= (int) $mesa['id'] ?>">
                  <select name="status" style="padding:6px 10px;border-radius:8px;border:1px solid var(--borda)">
                    <?php foreach (status_mesa() as $chave => $rotulo): ?>
                      <option value="<?= e($chave) ?>" <?= ($mesa['status'] ?? '') === $chave ? 'selected' : '' ?>><?= e($rotulo) ?></option>
                    <?php endforeach; ?>
                  </select>
                  <button type="submit" class="btn btn--primario btn--pequeno">OK</button>
                </form>
              </td>
              <td>
                <form method="post" action="<?= url('admin/mesas.php') ?>" onsubmit="return confirm('Remover a mesa <?= (int) $mesa['numero'] ?>?')">
                  <?= csrf_campo() ?>
                  <input type="hidden" name="acao" value="excluir">
                  <input type="hidden" name="id" value="<?= (int) $mesa['id'] ?>">
                  <button type="submit" class="btn btn--perigo btn--pequeno">Remover</button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </div>

  <div class="card">
    <h3 class="mb-2">Adicionar mesa</h3>
    <form method="post" action="<?= url('admin/mesas.php') ?>">
      <?= csrf_campo() ?>
      <input type="hidden" name="acao" value="criar">
      <div class="campo">
        <label for="numero">Número da mesa</label>
        <input type="number" id="numero" name="numero" min="1" required>
      </div>
      <div class="campo">
        <label for="capacidade">Capacidade (lugares)</label>
        <input type="number" id="capacidade" name="capacidade" min="1" required>
      </div>
      <button type="submit" class="btn btn--primario btn--bloco">Adicionar</button>
    </form>
  </div>
</div>

<?php require __DIR__ . '/../includes/admin_footer.php'; ?>