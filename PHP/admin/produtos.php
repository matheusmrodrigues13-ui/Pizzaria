<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

exigir_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verificar();
    $produtos = db_read('produtos', []);
    $acao = (string) ($_POST['acao'] ?? '');

    if ($acao === 'salvar') {
        $id = (int) ($_POST['id'] ?? 0);

        $numeroOuNulo = function ($valor) {
            $valor = str_replace(',', '.', trim((string) $valor));
            return $valor === '' ? null : (float) $valor;
        };

        $dados = [
            'nome'           => trim((string) ($_POST['nome'] ?? '')),
            'categoria'      => (string) ($_POST['categoria'] ?? 'pizza_salgada'),
            'descricao'      => trim((string) ($_POST['descricao'] ?? '')),
            'ingredientes'   => trim((string) ($_POST['ingredientes'] ?? '')),
            'imagem'         => trim((string) ($_POST['imagem'] ?? '')),
            'preco_pequena'  => $numeroOuNulo($_POST['preco_pequena'] ?? ''),
            'preco_media'    => $numeroOuNulo($_POST['preco_media'] ?? ''),
            'preco_grande'   => $numeroOuNulo($_POST['preco_grande'] ?? ''),
            'preco'          => $numeroOuNulo($_POST['preco'] ?? ''),
            'promocao_texto' => trim((string) ($_POST['promocao_texto'] ?? '')),
            'ativo'          => !empty($_POST['ativo']),
            'popular'        => !empty($_POST['popular']),
            'promocao'       => !empty($_POST['promocao']),
        ];

        if ($dados['nome'] === '') {
            flash_set('Informe o nome do item.', 'erro');
        } elseif ($id > 0) {
            foreach ($produtos as $indice => $produto) {
                if ((int) $produto['id'] === $id) {
                    $produtos[$indice] = array_merge($produto, $dados);
                }
            }
            db_write('produtos', $produtos);
            flash_set('Item atualizado.');
        } else {
            $dados['id'] = db_proximo_id($produtos);
            $produtos[] = $dados;
            db_write('produtos', $produtos);
            flash_set('Item adicionado ao cardápio.');
        }
    }

    if ($acao === 'excluir') {
        $id = (int) ($_POST['id'] ?? 0);
        $produtos = array_values(array_filter($produtos, function ($produto) use ($id) {
            return (int) $produto['id'] !== $id;
        }));
        db_write('produtos', $produtos);
        flash_set('Item removido.');
    }

    redirect(url('admin/produtos.php'));
}

$titulo = 'Cardápio';
$ativo  = 'produtos.php';

$produtos = db_read('produtos', []);
usort($produtos, function ($a, $b) {
    $ordem = array_keys(categorias());
    $pa = array_search($a['categoria'], $ordem, true);
    $pb = array_search($b['categoria'], $ordem, true);
    if ($pa === $pb) { return strcmp($a['nome'], $b['nome']); }
    return $pa <=> $pb;
});

$editando = null;
if (!empty($_GET['editar'])) {
    $editando = db_buscar($produtos, (int) $_GET['editar']);
}

$valores = $editando ?: [
    'id' => 0, 'nome' => '', 'categoria' => 'pizza_salgada', 'descricao' => '', 'ingredientes' => '',
    'imagem' => '', 'preco_pequena' => '', 'preco_media' => '', 'preco_grande' => '', 'preco' => '',
    'promocao_texto' => '', 'ativo' => true, 'popular' => false, 'promocao' => false,
];

require __DIR__ . '/../includes/admin_header.php';
?>

<div class="grade grade--2" style="align-items:start">
  <div class="card">
    <h3 class="mb-2">Itens do cardápio (<?= count($produtos) ?>)</h3>
    <table class="tabela">
      <thead>
        <tr><th>Item</th><th>Categoria</th><th>Preço</th><th>Situação</th><th></th></tr>
      </thead>
      <tbody>
        <?php foreach ($produtos as $produto): ?>
          <tr>
            <td>
              <strong><?= e($produto['nome']) ?></strong>
              <?php if (!empty($produto['popular'])): ?><span class="selo selo--recebido">popular</span><?php endif; ?>
              <?php if (!empty($produto['promocao'])): ?><span class="selo selo--preparo">promo</span><?php endif; ?>
            </td>
            <td class="pequeno"><?= e(categoria_label($produto['categoria'])) ?></td>
            <td class="preco"><?= moeda(preco_minimo($produto)) ?></td>
            <td>
              <span class="selo selo--<?= !empty($produto['ativo']) ? 'entregue' : 'cancelado' ?>">
                <?= !empty($produto['ativo']) ? 'ativo' : 'inativo' ?>
              </span>
            </td>
            <td style="display:flex;gap:8px">
              <a class="btn btn--fantasma btn--pequeno" href="<?= url('admin/produtos.php?editar=' . (int) $produto['id']) ?>">Editar</a>
              <form method="post" action="<?= url('admin/produtos.php') ?>" onsubmit="return confirm('Remover <?= e($produto['nome']) ?>?')">
                <?= csrf_campo() ?>
                <input type="hidden" name="acao" value="excluir">
                <input type="hidden" name="id" value="<?= (int) $produto['id'] ?>">
                <button type="submit" class="btn btn--perigo btn--pequeno">Remover</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <div class="card">
    <h3 class="mb-2"><?= $editando ? 'Editar item' : 'Novo item' ?></h3>

    <form method="post" action="<?= url('admin/produtos.php') ?>">
      <?= csrf_campo() ?>
      <input type="hidden" name="acao" value="salvar">
      <input type="hidden" name="id" value="<?= (int) $valores['id'] ?>">

      <div class="campo">
        <label for="nome">Nome*</label>
        <input type="text" id="nome" name="nome" required value="<?= e($valores['nome']) ?>">
      </div>

      <div class="campo">
        <label for="categoria">Categoria</label>
        <select id="categoria" name="categoria">
          <?php foreach (categorias() as $chave => $rotulo): ?>
            <option value="<?= e($chave) ?>" <?= $valores['categoria'] === $chave ? 'selected' : '' ?>><?= e($rotulo) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="campo">
        <label for="descricao">Descrição</label>
        <textarea id="descricao" name="descricao"><?= e($valores['descricao']) ?></textarea>
      </div>

      <div class="campo">
        <label for="ingredientes">Ingredientes</label>
        <input type="text" id="ingredientes" name="ingredientes" value="<?= e($valores['ingredientes']) ?>">
      </div>

      <div class="campo">
        <label for="imagem">URL da imagem</label>
        <input type="text" id="imagem" name="imagem" value="<?= e($valores['imagem']) ?>" placeholder="https://...">
      </div>

      <p class="pequeno muted mb-2">Preencha os três tamanhos para pizzas. Para bebidas, sobremesas e complementos, use apenas o preço unitário.</p>

      <div class="campo--metade">
        <div class="campo">
          <label for="preco_pequena">Preço pequena</label>
          <input type="text" id="preco_pequena" name="preco_pequena" value="<?= e($valores['preco_pequena']) ?>">
        </div>
        <div class="campo">
          <label for="preco_media">Preço média</label>
          <input type="text" id="preco_media" name="preco_media" value="<?= e($valores['preco_media']) ?>">
        </div>
      </div>

      <div class="campo--metade">
        <div class="campo">
          <label for="preco_grande">Preço grande</label>
          <input type="text" id="preco_grande" name="preco_grande" value="<?= e($valores['preco_grande']) ?>">
        </div>
        <div class="campo">
          <label for="preco">Preço unitário</label>
          <input type="text" id="preco" name="preco" value="<?= e($valores['preco']) ?>">
        </div>
      </div>

      <div class="campo">
        <label for="promocao_texto">Texto da promoção</label>
        <input type="text" id="promocao_texto" name="promocao_texto" value="<?= e($valores['promocao_texto']) ?>">
      </div>

      <div class="campo" style="display:flex;gap:20px;flex-wrap:wrap">
        <label class="opcao <?= !empty($valores['ativo']) ? 'marcada' : '' ?>" style="flex:1">
          <input type="checkbox" name="ativo" value="1" <?= !empty($valores['ativo']) ? 'checked' : '' ?>> <span>Ativo</span>
        </label>
        <label class="opcao <?= !empty($valores['popular']) ? 'marcada' : '' ?>" style="flex:1">
          <input type="checkbox" name="popular" value="1" <?= !empty($valores['popular']) ? 'checked' : '' ?>> <span>Popular</span>
        </label>
        <label class="opcao <?= !empty($valores['promocao']) ? 'marcada' : '' ?>" style="flex:1">
          <input type="checkbox" name="promocao" value="1" <?= !empty($valores['promocao']) ? 'checked' : '' ?>> <span>Promoção</span>
        </label>
      </div>

      <button type="submit" class="btn btn--primario btn--bloco"><?= $editando ? 'Salvar alterações' : 'Adicionar ao cardápio' ?></button>

      <?php if ($editando): ?>
        <a class="btn btn--fantasma btn--bloco mt-2" href="<?= url('admin/produtos.php') ?>">Cancelar edição</a>
      <?php endif; ?>
    </form>
  </div>
</div>

<?php require __DIR__ . '/../includes/admin_footer.php'; ?>