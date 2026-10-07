<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$usuario = usuario_atual();
if (!$usuario) {
    redirect(url('login.php') . '?voltar=' . rawurlencode(url('checkout.php')));
}

$titulo = 'Finalizar pedido';
$ativo  = '';

$opcoes   = opcoes_loja();
$loja     = config_loja();
$bairros  = $opcoes['bairros'] ?? [];
$pagamentos = $opcoes['pagamentos'] ?? ['Dinheiro', 'Pix'];
$erro     = $_GET['erro'] ?? '';

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container">
    <div class="cabecalho-secao">
      <span class="olho">Quase lá</span>
      <h2 class="titulo-secao">Finalizar pedido</h2>
      <p class="subtitulo">Confira os itens, informe os dados de entrega e escolha a forma de pagamento.</p>
    </div>

    <?php if ($erro): ?>
      <div class="aviso aviso--erro"><?= e($erro) ?></div>
    <?php endif; ?>

    <form method="post" action="<?= url('finalizar.php') ?>" class="grade--lateral">
      <?= csrf_campo() ?>
      <input type="hidden" name="itens" id="itens-json" value="[]">

      <div>
        <div class="card mb-3">
          <h3 class="mb-2">Seus itens</h3>
          <div id="checkout-lista" style="display:flex;flex-direction:column;gap:12px"></div>
        </div>

        <div class="card">
          <h3 class="mb-2">Entrega</h3>

          <div class="campo">
            <label>Como você quer receber?</label>
            <div class="opcoes">
              <label class="opcao marcada">
                <input type="radio" name="tipo" value="entrega" checked>
                <span>🛵 Receber em casa</span>
              </label>
              <label class="opcao">
                <input type="radio" name="tipo" value="retirada">
                <span>🏪 Retirar na pizzaria</span>
              </label>
            </div>
          </div>

          <div class="campo--metade">
            <div class="campo">
              <label for="nome">Nome*</label>
              <input type="text" id="nome" name="nome" required value="<?= e($usuario['nome']) ?>">
            </div>
            <div class="campo">
              <label for="telefone">Telefone*</label>
              <input type="text" id="telefone" name="telefone" required placeholder="(11) 99999-9999">
            </div>
          </div>

          <div id="bloco-endereco">
            <div class="campo--metade">
              <div class="campo">
                <label for="cep">CEP</label>
                <input type="text" id="cep" name="cep" placeholder="00000-000">
              </div>
              <div class="campo">
                <label for="bairro">Bairro*</label>
                <select id="bairro" name="bairro">
                  <?php foreach ($bairros as $bairro): ?>
                    <option value="<?= e($bairro['nome']) ?>" data-taxa="<?= (float) $bairro['taxa'] ?>">
                      <?= e($bairro['nome']) ?> (<?= moeda($bairro['taxa']) ?>)
                    </option>
                  <?php endforeach; ?>
                </select>
              </div>
            </div>

            <div class="campo--metade">
              <div class="campo">
                <label for="rua">Rua*</label>
                <input type="text" id="rua" name="rua" placeholder="Rua das Flores">
              </div>
              <div class="campo">
                <label for="numero">Número*</label>
                <input type="text" id="numero" name="numero" placeholder="123">
              </div>
            </div>

            <div class="campo--metade">
              <div class="campo">
                <label for="complemento">Complemento</label>
                <input type="text" id="complemento" name="complemento" placeholder="Apto, bloco...">
              </div>
              <div class="campo">
                <label for="referencia">Ponto de referência</label>
                <input type="text" id="referencia" name="referencia" placeholder="Perto do mercado">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="card mb-3">
          <h3 class="mb-2">Pagamento</h3>
          <div class="campo">
            <select name="pagamento">
              <?php foreach ($pagamentos as $forma): ?>
                <option value="<?= e($forma) ?>"><?= e($forma) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="campo">
            <label for="observacoes">Observações do pedido</label>
            <textarea id="observacoes" name="observacoes" placeholder="Ex.: caprichar no orégano..."></textarea>
          </div>
        </div>

        <div class="card">
          <div class="linha-total">
            <span>Subtotal</span>
            <span class="preco" id="checkout-subtotal">R$ 0,00</span>
          </div>
          <div class="linha-total" id="linha-taxa">
            <span>Taxa de entrega</span>
            <span class="preco" id="checkout-taxa">R$ 0,00</span>
          </div>
          <div class="linha-total linha-total--forte">
            <span>Total</span>
            <span class="preco" id="checkout-total">R$ 0,00</span>
          </div>

          <button type="submit" class="btn btn--primario btn--bloco mt-2">Confirmar pedido</button>
          <p class="pequeno muted texto-centro mt-2">
            Você receberá um código de acompanhamento ao confirmar.
          </p>
        </div>
      </div>
    </form>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>