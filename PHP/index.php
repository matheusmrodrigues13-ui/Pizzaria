<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$titulo = SITE_NOME;
$ativo  = 'index.php';

$produtos  = produtos_ativos();
$promocoes = array_values(array_filter(db_read('promocoes', []), function ($p) { return !empty($p['ativa']); }));
$loja      = config_loja();

$populares  = array_slice(array_values(array_filter($produtos, function ($p) { return $p['categoria'] === 'pizza_salgada' && !empty($p['popular']); })), 0, 4);
$bebidas    = array_slice(array_values(array_filter($produtos, function ($p) { return $p['categoria'] === 'bebida'; })), 0, 4);
$sobremesas = array_slice(array_values(array_filter($produtos, function ($p) { return $p['categoria'] === 'sobremesa'; })), 0, 4);

$dados_js = dados_personalizador($produtos);
$whatsapp = whatsapp_link($loja['whatsapp'] ?? '', 'Olá! Gostaria de fazer um pedido.');

require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container hero__grade">
    <div>
      <span class="olho">Forno a lenha · desde 1987</span>
      <h1>Pizza de verdade,<br>feita com calma.</h1>
      <p>Massa de fermentação natural de 48 horas, molho de tomate San Marzano e ingredientes escolhidos a dedo. Peça para receber em casa ou reserve sua mesa.</p>
      <div class="hero__acoes">
        <a class="btn btn--dourado" href="<?= url('cardapio.php') ?>">Ver o cardápio</a>
        <a class="btn btn--fantasma" href="<?= url('reserva.php') ?>" style="color:var(--cream);border-color:rgba(253,251,247,0.4)">Reservar mesa</a>
      </div>

      <div class="destaques">
        <div>
          <div class="destaque__valor">4,9</div>
          <div class="destaque__texto">Avaliação dos clientes</div>
        </div>
        <div>
          <div class="destaque__valor">30 min</div>
          <div class="destaque__texto">Entrega média</div>
        </div>
        <div>
          <div class="destaque__valor"><?= count($produtos) ?>+</div>
          <div class="destaque__texto">Itens no cardápio</div>
        </div>
      </div>
    </div>

    <div class="hero__imagem">
      <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80" alt="Pizza saindo do forno">
    </div>
  </div>
</section>

<?php if ($promocoes): ?>
<section class="secao secao--areia">
  <div class="container">
    <div class="cabecalho-secao texto-centro">
      <span class="olho">Economize</span>
      <h2 class="titulo-secao">Promoções do momento</h2>
    </div>
    <div class="grade grade--3">
      <?php foreach (array_slice($promocoes, 0, 3) as $promocao): ?>
        <div class="promo-card">
          <span class="selo selo--recebido">Oferta</span>
          <h3><?= e($promocao['titulo']) ?></h3>
          <p><?= e($promocao['descricao']) ?></p>
          <a class="btn btn--dourado btn--pequeno mt-2" href="<?= url('promocoes.php') ?>">Aproveitar</a>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="secao">
  <div class="container">
    <div class="cabecalho-secao texto-centro">
      <span class="olho">As favoritas</span>
      <h2 class="titulo-secao">Mais pedidas da casa</h2>
      <p class="subtitulo">Escolha o tamanho, a borda e os adicionais — do jeito que você gosta.</p>
    </div>
    <div class="grade grade--4">
      <?php foreach ($populares as $produto) { echo card_produto($produto); } ?>
    </div>
    <div class="texto-centro mt-4">
      <a class="btn btn--fantasma" href="<?= url('cardapio.php') ?>">Ver cardápio completo</a>
    </div>
  </div>
</section>

<section class="secao secao--escura">
  <div class="container grade grade--2" style="align-items:center;gap:48px">
    <div>
      <span class="olho">Nossa história</span>
      <h2 class="titulo-secao">Três décadas de massa bem feita</h2>
      <p class="subtitulo" style="color:rgba(253,251,247,0.75)">
        Nasceu de uma receita de família, na Bela Vista. O forno a lenha continua o mesmo,
        o molho é preparado todo dia e a massa descansa 48 horas antes de virar pizza.
        Simples assim — e é por isso que dá certo.
      </p>
      <div class="mt-3" style="display:flex;gap:12px;flex-wrap:wrap">
        <a class="btn btn--dourado" href="<?= url('reserva.php') ?>">Reservar uma mesa</a>
        <?php if ($whatsapp): ?>
          <a class="btn btn--fantasma" style="color:var(--cream);border-color:rgba(253,251,247,0.4)" href="<?= e($whatsapp) ?>" target="_blank" rel="noreferrer">Falar no WhatsApp</a>
        <?php endif; ?>
      </div>
    </div>
    <div style="border-radius:18px;overflow:hidden">
      <img src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=900&q=80" alt="Interior da pizzaria" style="width:100%;height:360px;object-fit:cover">
    </div>
  </div>
</section>

<?php if ($bebidas || $sobremesas): ?>
<section class="secao">
  <div class="container">
    <div class="grade grade--2" style="gap:48px">
      <?php if ($bebidas): ?>
        <div>
          <h2 class="titulo-secao" style="font-size:28px">Bebidas</h2>
          <p class="subtitulo mb-3">Para acompanhar a pizza.</p>
          <div class="grade grade--2">
            <?php foreach ($bebidas as $produto) { echo card_produto($produto); } ?>
          </div>
        </div>
      <?php endif; ?>

      <?php if ($sobremesas): ?>
        <div>
          <h2 class="titulo-secao" style="font-size:28px">Sobremesas</h2>
          <p class="subtitulo mb-3">Porque sempre cabe mais um docinho.</p>
          <div class="grade grade--2">
            <?php foreach ($sobremesas as $produto) { echo card_produto($produto); } ?>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="secao secao--areia">
  <div class="container grade grade--3">
    <div class="card">
      <h3>Endereço</h3>
      <p class="muted pequeno mt-1"><?= e($loja['endereco'] ?? 'Endereço ainda não cadastrado.') ?></p>
    </div>
    <div class="card">
      <h3>Horário</h3>
      <p class="muted pequeno mt-1"><?= e($loja['horario'] ?? 'Horário ainda não cadastrado.') ?></p>
    </div>
    <div class="card">
      <h3>Telefone</h3>
      <p class="muted pequeno mt-1"><?= e($loja['telefone'] ?? 'Telefone ainda não cadastrado.') ?></p>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>