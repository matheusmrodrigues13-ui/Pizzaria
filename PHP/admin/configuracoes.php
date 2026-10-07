<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

exigir_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();
    $acao = (string) ($_POST['acao'] ?? '');

    if ($acao === 'loja') {
        $config = config_loja();
        $config['id'] = $config['id'] ?? 1;
        foreach (['endereco', 'telefone', 'whatsapp', 'instagram', 'facebook', 'horario'] as $campo) {
            $config[$campo] = trim((string) ($_POST[$campo] ?? ''));
        }
        db_write('configuracao', [$config]);
        flash_set('Configurações salvas.');
    }

    if ($acao === 'senha') {
        $atual = (string) ($_POST['atual'] ?? '');
        $nova  = (string) ($_POST['nova'] ?? '');
        $confirma = (string) ($_POST['confirma'] ?? '');
        $credenciais = admin_credenciais();

        if (!senha_confere($atual, $credenciais['senha'])) {
            flash_set('A senha atual está incorreta.', 'erro');
        } elseif (strlen($nova) < 6) {
            flash_set('A nova senha precisa ter pelo menos 6 caracteres.', 'erro');
        } elseif ($nova !== $confirma) {
            flash_set('As senhas não conferem.', 'erro');
        } else {
            salvar_admin($credenciais['usuario'], $nova);
            flash_set('Senha do painel alterada.');
        }
    }

    redirect(url('admin/configuracoes.php'));
}

$titulo = 'Configurações';
$ativo  = 'configuracoes.php';

$config = config_loja();
$campos = [
    'endereco'  => ['Endereço completo', 'Rua, número — bairro, cidade', true],
    'telefone'  => ['Telefone', '(11) 4002-8922', false],
    'whatsapp'  => ['WhatsApp (DDI + DDD + número)', '5511988776655', false],
    'horario'   => ['Horário de funcionamento', 'Terça a domingo, das 18h às 23h30', true],
    'instagram' => ['Instagram (URL ou @perfil)', '@latavola.pizzaria', false],
    'facebook'  => ['Facebook (URL)', 'https://facebook.com/...', false],
];

require __DIR__ . '/../includes/admin_header.php';
?>

<div class="grade grade--2" style="align-items:start">
  <div class="card">
    <h3 class="mb-2">Dados da pizzaria</h3>
    <p class="pequeno muted mb-3">Esses dados aparecem na página de Contato e no rodapé do site.</p>

    <form method="post" action="<?= url('admin/configuracoes.php') ?>">
      <?= csrf_campo() ?>
      <input type="hidden" name="acao" value="loja">

      <?php foreach ($campos as $chave => $info): ?>
        <div class="campo">
          <label for="<?= e($chave) ?>"><?= e($info[0]) ?></label>
          <?php if ($info[2]): ?>
            <textarea id="<?= e($chave) ?>" name="<?= e($chave) ?>" placeholder="<?= e($info[1]) ?>"><?= e($config[$chave] ?? '') ?></textarea>
          <?php else: ?>
            <input type="text" id="<?= e($chave) ?>" name="<?= e($chave) ?>" placeholder="<?= e($info[1]) ?>" value="<?= e($config[$chave] ?? '') ?>">
          <?php endif; ?>
        </div>
      <?php endforeach; ?>

      <button type="submit" class="btn btn--primario btn--bloco">Salvar configurações</button>
    </form>
  </div>

  <div class="card">
    <h3 class="mb-2">Acesso ao painel</h3>
    <p class="pequeno muted mb-3">
      Usuário atual: <strong><?= e(admin_credenciais()['usuario']) ?></strong>.
      A senha padrão é <strong>admin123</strong> — troque agora.
    </p>

    <form method="post" action="<?= url('admin/configuracoes.php') ?>">
      <?= csrf_campo() ?>
      <input type="hidden" name="acao" value="senha">

      <div class="campo">
        <label for="atual">Senha atual</label>
        <input type="password" id="atual" name="atual" required>
      </div>
      <div class="campo">
        <label for="nova">Nova senha</label>
        <input type="password" id="nova" name="nova" required minlength="6">
      </div>
      <div class="campo">
        <label for="confirma">Confirmar nova senha</label>
        <input type="password" id="confirma" name="confirma" required minlength="6">
      </div>

      <button type="submit" class="btn btn--primario btn--bloco">Alterar senha</button>
    </form>
  </div>
</div>

<?php require __DIR__ . '/../includes/admin_footer.php'; ?>