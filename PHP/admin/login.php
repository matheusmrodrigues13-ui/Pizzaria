<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

if (admin_logado()) {
    redirect(url('admin/index.php'));
}

$erro = '';
$usuario = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();
    $usuario = trim((string) ($_POST['usuario'] ?? ''));
    $senha   = (string) ($_POST['senha'] ?? '');
    $credenciais = admin_credenciais();

    if ($usuario === '' || $senha === '') {
        $erro = 'Informe usuário e senha.';
    } elseif ($usuario !== $credenciais['usuario'] || !senha_confere($senha, $credenciais['senha'])) {
        $erro = 'Usuário ou senha incorretos.';
    } else {
        $_SESSION['admin'] = $usuario;
        flash_set('Bem-vindo ao painel.');
        redirect(url('admin/index.php'));
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Painel — <?= e(SITE_NOME) ?></title>
<link rel="stylesheet" href="<?= url('assets/css/style.css') ?>">
</head>
<body>
<section class="secao" style="min-height:100vh;display:grid;place-items:center;background:var(--espresso)">
  <div class="container" style="max-width:400px">
    <div class="card">
      <div class="texto-centro mb-3">
        <span class="olho"><?= e(SITE_NOME) ?></span>
        <h2 class="titulo-secao" style="font-size:28px">Painel</h2>
        <p class="pequeno muted">Acesso restrito à equipe.</p>
      </div>

      <?php if ($erro): ?>
        <div class="aviso aviso--erro"><?= e($erro) ?></div>
      <?php endif; ?>

      <form method="post" action="<?= url('admin/login.php') ?>">
        <?= csrf_campo() ?>
        <div class="campo">
          <label for="usuario">Usuário</label>
          <input type="text" id="usuario" name="usuario" required value="<?= e($usuario) ?>" autocomplete="username">
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <input type="password" id="senha" name="senha" required autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn--primario btn--bloco">Entrar</button>
      </form>

      <p class="texto-centro pequeno mt-3">
        <a href="<?= url('index.php') ?>" style="color:var(--wine);font-weight:600">Voltar ao site</a>
      </p>
    </div>
  </div>
</section>
</body>
</html>