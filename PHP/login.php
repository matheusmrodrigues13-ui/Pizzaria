<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

if (usuario_atual()) {
    redirect(url('perfil.php'));
}

$titulo = 'Entrar';
$ativo  = '';

$voltar = destino_seguro($_GET['voltar'] ?? '', url('perfil.php'));
$email  = '';
$erro   = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();
    $email = trim((string) ($_POST['email'] ?? ''));
    $senha = (string) ($_POST['senha'] ?? '');
    $voltar = destino_seguro($_POST['voltar'] ?? '', url('perfil.php'));

    if ($email === '' || $senha === '') {
        $erro = 'Preencha e-mail e senha.';
    } elseif (!login_usuario($email, $senha)) {
        $erro = 'E-mail ou senha incorretos.';
    } else {
        flash_set('Bem-vindo de volta!');
        redirect($voltar);
    }
}

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container" style="max-width:440px">
    <div class="card">
      <div class="texto-centro mb-3">
        <h2 class="titulo-secao" style="font-size:30px">Entrar</h2>
        <p class="pequeno muted">Acesse sua conta para pedir, reservar e acompanhar seus pedidos.</p>
      </div>

      <?php if ($erro): ?>
        <div class="aviso aviso--erro"><?= e($erro) ?></div>
      <?php endif; ?>

      <form method="post" action="<?= url('login.php') ?>">
        <?= csrf_campo() ?>
        <input type="hidden" name="voltar" value="<?= e($voltar) ?>">

        <div class="campo">
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" required value="<?= e($email) ?>" autocomplete="email">
        </div>

        <div class="campo">
          <label for="senha">Senha</label>
          <input type="password" id="senha" name="senha" required autocomplete="current-password">
        </div>

        <button type="submit" class="btn btn--primario btn--bloco">Entrar</button>
      </form>

      <p class="texto-centro pequeno mt-3">
        Ainda não tem conta? <a href="<?= url('register.php') ?>" style="color:var(--wine);font-weight:600">Criar conta</a>
      </p>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>