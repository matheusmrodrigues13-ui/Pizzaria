<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

if (usuario_atual()) {
    redirect(url('perfil.php'));
}

$titulo = 'Criar conta';
$ativo  = '';

$nome  = '';
$email = '';
$erro  = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();

    $nome  = trim((string) ($_POST['nome'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $senha = (string) ($_POST['senha'] ?? '');
    $confirma = (string) ($_POST['confirma'] ?? '');

    if ($nome === '' || $email === '' || $senha === '') {
        $erro = 'Preencha todos os campos.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erro = 'Informe um e-mail válido.';
    } elseif (strlen($senha) < 6) {
        $erro = 'A senha precisa ter pelo menos 6 caracteres.';
    } elseif ($senha !== $confirma) {
        $erro = 'As senhas não conferem.';
    } else {
        list($novo, $falha) = cadastrar_usuario($nome, $email, $senha);
        if ($falha) {
            $erro = $falha;
        } else {
            flash_set('Conta criada! Bem-vindo à ' . SITE_NOME . '.');
            redirect(url('perfil.php'));
        }
    }
}

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container" style="max-width:440px">
    <div class="card">
      <div class="texto-centro mb-3">
        <h2 class="titulo-secao" style="font-size:30px">Criar conta</h2>
        <p class="pequeno muted">Leva menos de um minuto.</p>
      </div>

      <?php if ($erro): ?>
        <div class="aviso aviso--erro"><?= e($erro) ?></div>
      <?php endif; ?>

      <form method="post" action="<?= url('register.php') ?>">
        <?= csrf_campo() ?>

        <div class="campo">
          <label for="nome">Nome completo</label>
          <input type="text" id="nome" name="nome" required value="<?= e($nome) ?>" autocomplete="name">
        </div>

        <div class="campo">
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" required value="<?= e($email) ?>" autocomplete="email">
        </div>

        <div class="campo">
          <label for="senha">Senha</label>
          <input type="password" id="senha" name="senha" required minlength="6" autocomplete="new-password">
        </div>

        <div class="campo">
          <label for="confirma">Confirmar senha</label>
          <input type="password" id="confirma" name="confirma" required minlength="6" autocomplete="new-password">
        </div>

        <button type="submit" class="btn btn--primario btn--bloco">Criar conta</button>
      </form>

      <p class="texto-centro pequeno mt-3">
        Já tem conta? <a href="<?= url('login.php') ?>" style="color:var(--wine);font-weight:600">Entrar</a>
      </p>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>