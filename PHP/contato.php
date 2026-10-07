<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$titulo = 'Contato';
$ativo  = 'contato.php';

$loja = config_loja();
$whatsapp = whatsapp_link($loja['whatsapp'] ?? '');
$instagram = !empty($loja['instagram'])
    ? (strpos($loja['instagram'], 'http') === 0 ? $loja['instagram'] : 'https://instagram.com/' . ltrim($loja['instagram'], '@'))
    : null;

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container">
    <div class="cabecalho-secao texto-centro">
      <span class="olho">Atendimento</span>
      <h2 class="titulo-secao">Contato</h2>
      <p class="subtitulo">Dúvidas, sugestões ou pedidos especiais? Fale com a gente — respondemos rapidinho.</p>
    </div>

    <div class="grade--lateral">
      <form id="form-contato" class="card" data-whatsapp="<?= e(preg_replace('/\D/', '', $loja['whatsapp'] ?? '')) ?>">
        <h3 class="mb-2">Envie sua mensagem</h3>

        <div id="contato-erro" class="aviso aviso--erro" style="display:none"></div>

        <div class="campo--metade">
          <div class="campo">
            <label for="nome">Nome*</label>
            <input type="text" id="nome" name="nome" required placeholder="Seu nome">
          </div>
          <div class="campo">
            <label for="telefone">Telefone</label>
            <input type="text" id="telefone" name="telefone" placeholder="(11) 99999-9999">
          </div>
        </div>

        <div class="campo--metade">
          <div class="campo">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" placeholder="voce@email.com">
          </div>
          <div class="campo">
            <label for="assunto">Assunto</label>
            <input type="text" id="assunto" name="assunto" placeholder="Ex.: Reserva para 6 pessoas">
          </div>
        </div>

        <div class="campo">
          <label for="mensagem">Mensagem*</label>
          <textarea id="mensagem" name="mensagem" required placeholder="Como podemos ajudar?"></textarea>
        </div>

        <button type="submit" class="btn btn--primario btn--bloco">Enviar pelo WhatsApp</button>
        <p class="pequeno muted texto-centro mt-2">
          Ao enviar, o WhatsApp abre com sua mensagem já preenchida — é só confirmar.
        </p>
      </form>

      <div>
        <div class="card mb-3">
          <h3 class="mb-2">Fale com a gente</h3>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:14px">
            <li>
              <div class="pequeno muted">Endereço</div>
              <strong><?= e($loja['endereco'] ?? 'Endereço ainda não cadastrado.') ?></strong>
            </li>
            <li>
              <div class="pequeno muted">Telefone</div>
              <strong><?= e($loja['telefone'] ?? 'Telefone ainda não cadastrado.') ?></strong>
            </li>
            <li>
              <div class="pequeno muted">Horário</div>
              <strong><?= e($loja['horario'] ?? 'Horário ainda não cadastrado.') ?></strong>
            </li>
          </ul>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;border-top:1px solid var(--borda);padding-top:16px">
            <?php if ($whatsapp): ?>
              <a class="btn btn--primario btn--pequeno" href="<?= e($whatsapp) ?>" target="_blank" rel="noreferrer">WhatsApp</a>
            <?php endif; ?>
            <?php if ($instagram): ?>
              <a class="btn btn--fantasma btn--pequeno" href="<?= e($instagram) ?>" target="_blank" rel="noreferrer">Instagram</a>
            <?php endif; ?>
            <?php if (!empty($loja['facebook'])): ?>
              <a class="btn btn--fantasma btn--pequeno" href="<?= e($loja['facebook']) ?>" target="_blank" rel="noreferrer">Facebook</a>
            <?php endif; ?>
          </div>
        </div>

        <div class="card card--plano" style="padding:0;overflow:hidden">
          <?php if (!empty($loja['endereco'])): ?>
            <iframe title="Mapa da pizzaria"
                    src="https://maps.google.com/maps?q=<?= rawurlencode($loja['endereco']) ?>&output=embed"
                    style="width:100%;height:300px;border:0" loading="lazy"></iframe>
          <?php else: ?>
            <div style="height:300px;display:grid;place-items:center;text-align:center;padding:24px">
              <p class="muted pequeno">O mapa aparece aqui assim que a pizzaria cadastrar o endereço no painel.</p>
            </div>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>