<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

unset($_SESSION['admin']);
flash_set('Você saiu do painel.');
redirect(url('admin/login.php'));