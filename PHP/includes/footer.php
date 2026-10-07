</main>

<footer class="rodape">
  <div class="container">
    <div class="rodape__grade">
      <div>
        <h4><?= e(SITE_NOME) ?></h4>
        <p class="pequeno">Pizza artesanal, massa de fermentação natural e ingredientes selecionados. Feita com calma, servida com carinho.</p>
        <?php if (!empty($loja['horario'])): ?>
          <p class="pequeno mt-2"><strong>Horário:</strong> <?= e($loja['horario']) ?></p>
        <?php endif; ?>
      </div>

      <div>
        <h4>Navegar</h4>
        <a href="<?= url('index.php') ?>">Início</a>
        <a href="<?= url('cardapio.php') ?>">Cardápio</a>
        <a href="<?= url('promocoes.php') ?>">Promoções</a>
        <a href="<?= url('reserva.php') ?>">Reservar Mesa</a>
        <a href="<?= url('acompanhamento.php') ?>">Acompanhar Pedido</a>
        <a href="<?= url('perfil.php') ?>">Meu Perfil</a>
        <a href="<?= url('contato.php') ?>">Contato</a>
      </div>

      <div>
        <h4>Contato</h4>
        <?php if (!empty($loja['endereco'])): ?><p class="pequeno"><?= e($loja['endereco']) ?></p><?php endif; ?>
        <?php if (!empty($loja['telefone'])): ?><p class="pequeno mt-1"><?= e($loja['telefone']) ?></p><?php endif; ?>
        <?php if ($whatsapp): ?>
          <a href="<?= e($whatsapp) ?>" target="_blank" rel="noreferrer">WhatsApp</a>
        <?php endif; ?>
        <?php if (!empty($loja['instagram'])): ?>
          <a href="https://instagram.com/<?= e(ltrim($loja['instagram'], '@')) ?>" target="_blank" rel="noreferrer">Instagram</a>
        <?php endif; ?>
        <?php if (!empty($loja['facebook'])): ?>
          <a href="<?= e($loja['facebook']) ?>" target="_blank" rel="noreferrer">Facebook</a>
        <?php endif; ?>
      </div>
    </div>

    <div class="rodape__base">
      <span>&copy; <?= date('Y') ?> <?= e(SITE_NOME) ?>. Todos os direitos reservados.</span>
      <a href="<?= url('admin/login.php') ?>">Área do administrador</a>
    </div>
  </div>
</footer>

<!-- Carrinho -->
<div class="drawer" id="carrinho">
  <div class="drawer__fundo" data-acao="fechar-carrinho"></div>
  <aside class="drawer__painel">
    <div class="drawer__topo">
      <h2>Seu carrinho</h2>
      <button type="button" data-acao="fechar-carrinho" aria-label="Fechar">&times;</button>
    </div>
    <div class="drawer__lista" id="carrinho-lista"></div>
    <div class="drawer__rodape" id="carrinho-rodape"></div>
  </aside>
</div>

<!-- Personalizador de pizza -->
<div class="modal" id="modal-pizza">
  <div class="modal__fundo" data-acao="fechar-modal"></div>
  <div class="modal__caixa">
    <div class="modal__topo">
      <div>
        <h2 id="modal-titulo"></h2>
        <p class="pequeno muted" id="modal-descricao"></p>
      </div>
      <button type="button" data-acao="fechar-modal" aria-label="Fechar">&times;</button>
    </div>
    <div class="modal__corpo">
      <div class="grupo">
        <p class="grupo__titulo">Tamanho</p>
        <div class="opcoes" id="modal-tamanhos"></div>
      </div>
      <div class="grupo">
        <p class="grupo__titulo">Borda</p>
        <div class="opcoes" id="modal-bordas"></div>
      </div>
      <div class="grupo">
        <p class="grupo__titulo">Adicionais</p>
        <div class="opcoes" id="modal-adicionais"></div>
      </div>
      <div class="grupo">
        <p class="grupo__titulo">Observações</p>
        <textarea id="modal-observacoes" placeholder="Ex.: sem cebola, bem assada..."></textarea>
      </div>
    </div>
    <div class="modal__rodape">
      <button type="button" class="btn btn--primario btn--bloco" data-acao="confirmar-pizza">
        Adicionar · <span id="modal-total">R$ 0,00</span>
      </button>
    </div>
  </div>
</div>

<script>window.LT_BASE = <?= json_encode(BASE_URL, JSON_UNESCAPED_SLASHES) ?>;</script>
<?php if (!empty($dados_js)): ?>
<script>window.LT_DADOS = <?= json_encode($dados_js, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;</script>
<?php endif; ?>
<script src="<?= url('assets/js/app.js') ?>"></script>
</body>
</html>