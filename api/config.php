<?php
// config.php - Configuración de la base de datos

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración de base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'servicedesk');

// Crear conexión
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Conexión fallida: ' . $conn->connect_error
    ]));
}

// Establecer charset
$conn->set_charset("utf8mb4");

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función para responder JSON
function respondJSON($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Función para generar número de ticket único
function generateTicketNumber($conn) {
    $prefix = 'TK';
    $timestamp = date('Ymd');
    
    $query = "SELECT COUNT(*) as count FROM tickets WHERE DATE(created_at) = CURDATE()";
    $result = $conn->query($query);
    $row = $result->fetch_assoc();
    $count = str_pad($row['count'] + 1, 4, '0', STR_PAD_LEFT);
    
    return $prefix . $timestamp . $count;
}
?>
