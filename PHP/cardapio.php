<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$titulo = 'Cardápio';
$ativo  = 'cardapio.php';

$produtos = produtos_ativos();
$categorias = categorias();
$selecionada = $_GET['cat'] ?? 'todas';
if ($selecionada !== 'todas' && !isset($categorias[$selecionada])) {
    $selecionada = 'todas';
}

$dados_js = dados_personalizador($produtos);

require __DIR__ . '/includes/header.php';
?>

<section class="secao">
  <div class="container">
    <div class="cabecalho-secao texto-centro">
      <span class="olho">Nosso cardápio</span>
      <h2 class="titulo-secao">Escolha a sua</h2>
      <p class="subtitulo">Todas as pizzas podem ser montadas do seu jeito: tamanho, borda e adicionais.</p>
    </div>

    <div class="barra-filtros" style="justify-content:center">
      <a href="<?= url('cardapio.php') ?>" class="<?= $selecionada === 'todas' ? 'ativo' : '' ?>">Tudo</a>
      <?php foreach ($categorias as $chave => $rotulo): ?>
        <a href="<?= url('cardapio.php?cat=' . $chave) ?>" class="<?= $selecionada === $chave ? 'ativo' : '' ?>"><?= e($rotulo) ?></a>
      <?php endforeach; ?>
    </div>

    <?php if (!$produtos): ?>
      <p class="texto-centro muted">O cardápio ainda não foi cadastrado.</p>
    <?php elseif ($selecionada !== 'todas'): ?>
      <?php
        $lista = array_values(array_filter($produtos, function ($p) use ($selecionada) { return $p['categoria'] === $selecionada; }));
      ?>
      <?php if (!$lista): ?>
        <p class="texto-centro muted">Nenhum item nesta categoria por enquanto.</p>
      <?php else: ?>
        <div class="grade grade--4">
          <?php foreach ($lista as $produto) { echo card_produto($produto); } ?>
        </div>
      <?php endif; ?>
    <?php else: ?>
      <?php foreach ($categorias as $chave => $rotulo): ?>
        <?php
          $lista = array_values(array_filter($produtos, function ($p) use ($chave) { return $p['categoria'] === $chave; }));
        ?>
        <?php if ($lista): ?>
          <div class="mb-3" style="margin-top:48px">
            <h3 class="titulo-secao" style="font-size:28px"><?= e($rotulo) ?></h3>
            <div class="grade grade--4 mt-3">
              <?php foreach ($lista as $produto) { echo card_produto($produto); } ?>
            </div>
          </div>
        <?php endif; ?>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>