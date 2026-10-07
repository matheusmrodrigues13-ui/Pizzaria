<?php
/**
 * Camada de dados: cada "tabela" é um arquivo .json dentro de /data.
 */

function db_file($nome)
{
    return DATA_DIR . '/' . $nome . '.json';
}

/**
 * Lê uma tabela. Devolve $padrao quando o arquivo não existe ou está inválido.
 */
function db_read($nome, $padrao = [])
{
    $arquivo = db_file($nome);
    if (!is_file($arquivo)) {
        return $padrao;
    }
    $conteudo = file_get_contents($arquivo);
    if ($conteudo === false || trim($conteudo) === '') {
        return $padrao;
    }
    $dados = json_decode($conteudo, true);
    return $dados === null ? $padrao : $dados;
}

/**
 * Grava uma tabela inteira.
 */
function db_write($nome, $dados)
{
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0775, true);
    }
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    file_put_contents(db_file($nome), $json, LOCK_EX);
}

/**
 * Próximo id numérico livre de uma tabela.
 */
function db_proximo_id($itens)
{
    $maior = 0;
    foreach ($itens as $item) {
        if (isset($item['id']) && (int) $item['id'] > $maior) {
            $maior = (int) $item['id'];
        }
    }
    return $maior + 1;
}

/**
 * Busca um registro pelo id.
 */
function db_buscar($itens, $id)
{
    foreach ($itens as $item) {
        if (isset($item['id']) && (int) $item['id'] === (int) $id) {
            return $item;
        }
    }
    return null;
}