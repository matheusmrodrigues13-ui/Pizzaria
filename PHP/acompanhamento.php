<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$titulo = 'Meu Pedido';
$ativo  = 'acompanhamento.php';

$busca  = trim((string) ($_GET['busca'] ?? ''));
$numero = trim((string) ($_GET['numero'] ?? ''));
$codigo = trim((string) ($_GET['codigo'] ?? ''));

$pedido = null;
$pedidos = db_read('pedidos', []);

if ($numero !== '') {
    foreach ($pedidos as $registro) {
        if ((string) $registro['numero'] === $numero) {
            $pedido = $registro;
            break;
        }
    }
} elseif ($codigo !== '') {
    foreach ($pedidos as $registro) {
        if (strcasecmp((string) $registro['codigo'], $codigo) === 0) {
            $pedido = $registro;
            break;
        }
    }
} elseif ($busca !== '') {
    foreach ($pedidos as $registro) {
        if ((string) $registro['numero'] === $busca || strcasecmp((string) $registro['codigo'], $busca) === 0) {
            $pedido = $registro;
            break;
        }
    }
}

$limpar_carrinho = isset($_GET['novo']);
$fluxo = status_pedido_fluxo();

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container" style="max-width:900px">
    <div class="cabecalho-secao texto-centro">
      <span class="olho">Acompanhamento</span>
      <h2 class="titulo-secao">Onde está meu pedido?</h2>
      <p class="subtitulo">Informe o número do pedido ou o código de acompanhamento (ex.: LT-7K3M9Q).</p>
    </div>

    <form method="get" action="<?= url('acompanhamento.php') ?>" class="card" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
      <div class="campo" style="flex:1;min-width:220px;margin:0">
        <label for="busca">Número ou código</label>
        <input type="text" id="busca" name="busca" value="<?= e($busca) ?>" placeholder="Ex.: 1042 ou LT-7K3M9Q">
      </div>
      <button type="submit" class="btn btn--primario">Buscar</button>
    </form>

    <?php if ($pedido): ?>
      <?php
        $indiceAtual = array_search($pedido['status'], $fluxo, true);
        $cancelado = $pedido['status'] === 'cancelado';
      ?>

      <div class="card mt-3">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
          <div>
            <h3>Pedido #<?= (int) $pedido['numero'] ?></h3>
            <p class="pequeno muted">
              Feito em <?= e(date('d/m/Y \à\s H:i', strtotime($pedido['criado_em'] ?? 'now'))) ?> ·
              Código <strong><?= e($pedido['codigo']) ?></strong>
            </p>
          </div>
          <span class="selo selo--<?= e($pedido['status']) ?>"><?= e(status_pedido_label($pedido['status'])) ?></span>
        </div>

        <?php if ($cancelado): ?>
          <div class="aviso aviso--erro mt-2">Este pedido foi cancelado. Em caso de dúvida, fale com a pizzaria.</div>
        <?php else: ?>
          <div class="linha-tempo">
            <?php foreach ($fluxo as $indice => $etapa): ?>
              <?php
                $classe = '';
                if ($indiceAtual !== false && $indice < $indiceAtual) { $classe = 'feito'; }
                if ($indiceAtual !== false && $indice === $indiceAtual) { $classe = 'atual'; }
              ?>
              <div class="passo <?= $classe ?>">
                <div class="passo__bolinha"><?= $indice + 1 ?></div>
                <div class="passo__texto"><?= e(status_pedido_label($etapa)) ?></div>
              </div>
            <?php endforeach; ?>
          </div>
          <?php if (!empty($pedido['tempo_estimado']) && $pedido['status'] !== 'entregue'): ?>
            <p class="texto-centro pequeno muted">Tempo estimado: <strong><?= e($pedido['tempo_estimado']) ?></strong></p>
          <?php endif; ?>
        <?php endif; ?>
      </div>

      <div class="grade grade--2 mt-3">
        <div class="card">
          <h3 class="mb-2">Itens</h3>
          <?php foreach (($pedido['itens'] ?? []) as $item): ?>
            <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--borda)">
              <div>
                <strong><?= (int) $item['quantidade'] ?>× <?= e($item['nome']) ?></strong>
                <div class="pequeno muted">
                  <?= e($item['tamanho'] ?? '') ?>
                  <?= !empty($item['borda']) && $item['borda'] !== 'Sem borda recheada' ? ' · Borda: ' . e($item['borda']) : '' ?>
                </div>
                <?php if (!empty($item['adicionais'])): ?>
                  <div class="pequeno muted">+ <?= e(implode(', ', $item['adicionais'])) ?></div>
                <?php endif; ?>
                <?php if (!empty($item['observacoes'])): ?>
                  <div class="pequeno muted"><em>"<?= e($item['observacoes']) ?>"</em></div>
                <?php endif; ?>
              </div>
              <span class="preco"><?= moeda($item['preco_unitario'] * $item['quantidade']) ?></span>
            </div>
          <?php endforeach; ?>

          <div class="linha-total mt-2"><span>Subtotal</span><span class="preco"><?= moeda($pedido['subtotal']) ?></span></div>
          <?php if (!empty($pedido['taxa_entrega'])): ?>
            <div class="linha-total"><span>Taxa de entrega</span><span class="preco"><?= moeda($pedido['taxa_entrega']) ?></span></div>
          <?php endif; ?>
          <div class="linha-total linha-total--forte"><span>Total</span><span class="preco"><?= moeda($pedido['total']) ?></span></div>
        </div>

        <div class="card">
          <h3 class="mb-2">Entrega e pagamento</h3>
          <p class="pequeno"><strong>Tipo:</strong> <?= $pedido['tipo'] === 'entrega' ? 'Entrega' : 'Retirada na pizzaria' ?></p>
          <p class="pequeno"><strong>Cliente:</strong> <?= e($pedido['cliente_nome']) ?></p>
          <?php if (!empty($pedido['cliente_telefone'])): ?>
            <p class="pequeno"><strong>Telefone:</strong> <?= e($pedido['cliente_telefone']) ?></p>
          <?php endif; ?>
          <?php if (!empty($pedido['endereco'])): ?>
            <?php $endereco = $pedido['endereco']; ?>
            <p class="pequeno"><strong>Endereço:</strong>
              <?= e($endereco['rua'] ?? '') ?>, <?= e($endereco['numero'] ?? '') ?>
              <?= !empty($endereco['complemento']) ? ' — ' . e($endereco['complemento']) : '' ?>
              — <?= e($endereco['bairro'] ?? '') ?>
            </p>
          <?php endif; ?>
          <p class="pequeno"><strong>Pagamento:</strong> <?= e($pedido['pagamento']) ?></p>
          <?php if (!empty($pedido['observacoes'])): ?>
            <p class="pequeno"><strong>Observações:</strong> <?= e($pedido['observacoes']) ?></p>
          <?php endif; ?>
        </div>
      </div>

    <?php elseif ($busca !== '' || $numero !== '' || $codigo !== ''): ?>
      <div class="aviso aviso--erro mt-3">Não encontramos nenhum pedido com esse número ou código.</div>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>