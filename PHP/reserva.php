<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$usuario = usuario_atual();
if (!$usuario) {
    redirect(url('login.php') . '?voltar=' . rawurlencode(url('reserva.php')));
}

$titulo = 'Reservar Mesa';
$ativo  = 'reserva.php';

/* ------------------------------- Horários ------------------------------- */
$horarios = [];
for ($hora = 18; $hora <= 23; $hora++) {
    foreach (['00', '30'] as $minuto) {
        $horarios[] = sprintf('%02d:%s', $hora, $minuto);
    }
}

$erro = '';
$mesas = db_read('mesas', []);
$reservas = db_read('reservas', []);

$form = [
    'data'       => date('Y-m-d'),
    'horario'    => '20:00',
    'pessoas'    => 2,
    'mesa_numero' => '',
    'cliente_nome' => $usuario['nome'],
    'cliente_telefone' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();

    $form = [
        'data'       => trim((string) ($_POST['data'] ?? '')),
        'horario'    => trim((string) ($_POST['horario'] ?? '')),
        'pessoas'    => max(1, (int) ($_POST['pessoas'] ?? 1)),
        'mesa_numero' => (int) ($_POST['mesa_numero'] ?? 0),
        'cliente_nome' => trim((string) ($_POST['cliente_nome'] ?? '')),
        'cliente_telefone' => trim((string) ($_POST['cliente_telefone'] ?? '')),
    ];

    $mesa = null;
    foreach ($mesas as $registro) {
        if ((int) $registro['numero'] === $form['mesa_numero']) {
            $mesa = $registro;
            break;
        }
    }

    if ($form['cliente_nome'] === '' || $form['cliente_telefone'] === '') {
        $erro = 'Informe seu nome e telefone.';
    } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $form['data']) || $form['data'] < date('Y-m-d')) {
        $erro = 'Escolha uma data válida (a partir de hoje).';
    } elseif (!in_array($form['horario'], $horarios, true)) {
        $erro = 'Escolha um horário disponível.';
    } elseif (!$mesa) {
        $erro = 'Escolha uma mesa no mapa.';
    } elseif ((int) $mesa['capacidade'] < $form['pessoas']) {
        $erro = 'A mesa escolhida não comporta ' . $form['pessoas'] . ' pessoas.';
    } elseif (($mesa['status'] ?? 'disponivel') === 'ocupada' || ($mesa['status'] ?? '') === 'limpeza') {
        $erro = 'A mesa escolhida não está disponível.';
    } else {
        foreach ($reservas as $reserva) {
            $mesmaMesa = (int) $reserva['mesa_numero'] === (int) $mesa['numero'];
            $mesmoHorario = $reserva['data'] === $form['data'] && $reserva['horario'] === $form['horario'];
            if ($mesmaMesa && $mesmoHorario && $reserva['status'] !== 'cancelada') {
                $erro = 'Esta mesa já está reservada neste horário. Escolha outra.';
                break;
            }
        }
    }

    if ($erro === '') {
        $reservas[] = [
            'id'               => db_proximo_id($reservas),
            'usuario_id'       => (int) $usuario['id'],
            'data'             => $form['data'],
            'horario'          => $form['horario'],
            'pessoas'          => $form['pessoas'],
            'mesa_numero'      => (int) $mesa['numero'],
            'cliente_nome'     => $form['cliente_nome'],
            'cliente_email'    => $usuario['email'],
            'cliente_telefone' => $form['cliente_telefone'],
            'status'           => 'pendente',
            'criado_em'        => date('Y-m-d H:i:s'),
        ];
        db_write('reservas', $reservas);

        foreach ($mesas as $indice => $registro) {
            if ((int) $registro['numero'] === (int) $mesa['numero']) {
                $mesas[$indice]['status'] = 'reservada';
            }
        }
        db_write('mesas', $mesas);

        flash_set('Reserva enviada! Mesa ' . $mesa['numero'] . ' em ' . date('d/m/Y', strtotime($form['data'])) . ' às ' . $form['horario'] . '. Aguarde a confirmação.');
        redirect(url('perfil.php'));
    }
}

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container">
    <div class="cabecalho-secao texto-centro">
      <span class="olho">Sua mesa</span>
      <h2 class="titulo-secao">Reservar mesa</h2>
      <p class="subtitulo">Escolha a data, o horário e a mesa no mapa. Confirmamos por telefone ou WhatsApp.</p>
    </div>

    <?php if ($erro): ?>
      <div class="aviso aviso--erro"><?= e($erro) ?></div>
    <?php endif; ?>

    <form method="post" action="<?= url('reserva.php') ?>" class="grade--lateral">
      <?= csrf_campo() ?>

      <div class="card">
        <h3 class="mb-2">Mapa de mesas</h3>
        <p class="pequeno muted mb-3">Mesas em cinza não estão disponíveis.</p>

        <div class="mesas">
          <?php foreach ($mesas as $mesa): ?>
            <?php
              $status = $mesa['status'] ?? 'disponivel';
              $indisponivel = $status === 'ocupada' || $status === 'limpeza';
              $selecionada = (int) $form['mesa_numero'] === (int) $mesa['numero'];
            ?>
            <label class="mesa <?= $indisponivel ? 'indisponivel' : '' ?> <?= $selecionada ? 'selecionada' : '' ?>"
                   data-mesa="<?= (int) $mesa['numero'] ?>"
                   data-capacidade="<?= (int) $mesa['capacidade'] ?>">
              <input type="radio" name="mesa_numero" value="<?= (int) $mesa['numero'] ?>"
                     style="display:none" <?= $selecionada ? 'checked' : '' ?> <?= $indisponivel ? 'disabled' : '' ?>>
              <div class="mesa__numero"><?= (int) $mesa['numero'] ?></div>
              <div class="mesa__cap"><?= (int) $mesa['capacidade'] ?> lugares</div>
              <span class="selo selo--<?= e($status) ?>" style="margin-top:6px"><?= e(status_mesa()[$status] ?? $status) ?></span>
            </label>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="card">
        <h3 class="mb-2">Detalhes da reserva</h3>

        <div class="campo">
          <label for="data">Data*</label>
          <input type="date" id="data" name="data" required min="<?= date('Y-m-d') ?>" value="<?= e($form['data']) ?>">
        </div>

        <div class="campo--metade">
          <div class="campo">
            <label for="horario">Horário*</label>
            <select id="horario" name="horario" required>
              <?php foreach ($horarios as $horario): ?>
                <option value="<?= e($horario) ?>" <?= $form['horario'] === $horario ? 'selected' : '' ?>><?= e($horario) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="campo">
            <label for="pessoas">Pessoas*</label>
            <input type="number" id="pessoas" name="pessoas" min="1" max="12" required value="<?= (int) $form['pessoas'] ?>">
          </div>
        </div>

        <div class="campo">
          <label for="cliente_nome">Nome*</label>
          <input type="text" id="cliente_nome" name="cliente_nome" required value="<?= e($form['cliente_nome']) ?>">
        </div>

        <div class="campo">
          <label for="cliente_telefone">Telefone*</label>
          <input type="text" id="cliente_telefone" name="cliente_telefone" required placeholder="(11) 99999-9999" value="<?= e($form['cliente_telefone']) ?>">
        </div>

        <p class="pequeno muted mb-2">Mesa selecionada: <strong id="mesa-escolhida"><?= $form['mesa_numero'] ? (int) $form['mesa_numero'] : 'nenhuma' ?></strong></p>

        <button type="submit" class="btn btn--primario btn--bloco">Enviar reserva</button>
      </div>
    </form>
  </div>
</section>

<script>
document.querySelectorAll('.mesa').forEach(function (mesa) {
  mesa.addEventListener('click', function () {
    if (mesa.classList.contains('indisponivel')) { return; }
    document.querySelectorAll('.mesa').forEach(function (outra) { outra.classList.remove('selecionada'); });
    mesa.classList.add('selecionada');
    var campo = document.getElementById('mesa-escolhida');
    if (campo) { campo.textContent = mesa.dataset.mesa; }
  });
});
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>  