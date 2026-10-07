<?php
/**
 * La Tavola — Configuração geral
 *
 * Ajuste apenas o que precisar. O caminho base é detectado automaticamente,
 * então funciona tanto na raiz do domínio quanto dentro de uma subpasta.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('America/Sao_Paulo');
mb_internal_encoding('UTF-8');

define('SITE_NOME', 'La Tavola');
define('SITE_SUB', 'Pizzaria');
define('SITE_WHATSAPP_PADRAO', '5511999999999');

// Pasta onde ficam os arquivos .json (banco de dados)
define('DATA_DIR', dirname(__DIR__) . '/data');

// Detecta o caminho base do app
$__dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
$__dir = preg_replace('#/admin/?$#', '', $__dir);
$__dir = rtrim($__dir, '/');
define('BASE_URL', $__dir);

/**
 * Monta uma URL interna do app. Use sempre url('pagina.php').
 */
function url($caminho = '')
{
    return BASE_URL . '/' . ltrim($caminho, '/');
}