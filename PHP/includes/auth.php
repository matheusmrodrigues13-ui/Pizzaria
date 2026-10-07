<?php
/**
 * Autenticação de clientes e do painel administrativo.
 */

/** Usuário logado (ou null). */
function usuario_atual()
{
    if (empty($_SESSION['usuario_id'])) {
        return null;
    }
    foreach (db_read('usuarios', []) as $usuario) {
        if ((int) $usuario['id'] === (int) $_SESSION['usuario_id']) {
            return $usuario;
        }
    }
    return null;
}

/** Exige login do cliente. */
function exigir_login($destino = null)
{
    if (!usuario_atual()) {
        $voltar = $destino ?: ($_SERVER['REQUEST_URI'] ?? url('index.php'));
        redirect(url('login.php') . '?voltar=' . rawurlencode($voltar));
    }
}

/** Tenta autenticar um cliente. */
function login_usuario($email, $senha)
{
    $email = mb_strtolower(trim($email));
    foreach (db_read('usuarios', []) as $usuario) {
        if (mb_strtolower($usuario['email']) === $email && password_verify($senha, $usuario['senha'])) {
            $_SESSION['usuario_id'] = (int) $usuario['id'];
            return $usuario;
        }
    }
    return null;
}

/** Cria a conta de um cliente. Devolve [usuario, erro]. */
function cadastrar_usuario($nome, $email, $senha)
{
    $email = mb_strtolower(trim($email));
    $usuarios = db_read('usuarios', []);

    foreach ($usuarios as $usuario) {
        if (mb_strtolower($usuario['email']) === $email) {
            return [null, 'Este e-mail já está cadastrado.'];
        }
    }

    $novo = [
        'id'         => db_proximo_id($usuarios),
        'nome'       => trim($nome),
        'email'      => $email,
        'senha'      => password_hash($senha, PASSWORD_DEFAULT),
        'criado_em'  => date('Y-m-d H:i:s'),
    ];

    $usuarios[] = $novo;
    db_write('usuarios', $usuarios);
    $_SESSION['usuario_id'] = $novo['id'];

    return [$novo, null];
}

/** Encerra a sessão do cliente (mantém o admin logado, se houver). */
function logout_usuario()
{
    unset($_SESSION['usuario_id']);
}

/* ------------------------------ Painel admin ------------------------------ */

function admin_logado()
{
    return !empty($_SESSION['admin']);
}

function exigir_admin()
{
    if (!admin_logado()) {
        redirect(url('admin/login.php'));
    }
}

/** Credenciais do painel. */
function admin_credenciais()
{
    $lista = db_read('admin', []);
    return $lista[0] ?? ['usuario' => 'admin', 'senha' => 'admin123'];
}

/**
 * Confere a senha do painel. Aceita senha em texto puro (padrão inicial) e
 * passa a exigir hash assim que a senha for trocada em Configurações.
 */
function senha_confere($informada, $armazenada)
{
    if (strpos($armazenada, '$2y$') === 0 || strpos($armazenada, '$argon2') === 0) {
        return password_verify($informada, $armazenada);
    }
    return hash_equals($armazenada, $informada);
}

function salvar_admin($usuario, $senha)
{
    db_write('admin', [[
        'usuario' => trim($usuario),
        'senha'   => password_hash($senha, PASSWORD_DEFAULT),
    ]]);
}