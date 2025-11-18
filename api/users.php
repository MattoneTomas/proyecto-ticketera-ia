<?php
// api/users.php - Endpoints para gestionar usuarios

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'agents':
                // Obtener solo usuarios que son agentes
                $query = "SELECT id, 
                          CASE name
                              WHEN 'Admin User' THEN 'Administrador de Redes'
                              WHEN 'Sarah Support' THEN 'Sara Soporte'
                              WHEN 'John Agent' THEN 'Tomas Soporte'
                              WHEN 'Sofia Billing' THEN 'Sofia Facturacion'
                              ELSE name
                          END as name
                          FROM users WHERE role IN ('agent', 'admin') ORDER BY name ASC";
                $result = $conn->query($query);

                if (!$result) {
                    respondJSON(false, 'Error en la consulta de agentes: ' . $conn->error, null, 500);
                }

                $agents = $result->fetch_all(MYSQLI_ASSOC);
                respondJSON(true, 'Agentes obtenidos exitosamente', $agents);
                break;

            default:
                respondJSON(false, 'Acción GET no válida para usuarios', null, 404);
                break;
        }
        break;
    default:
        respondJSON(false, 'Método no soportado para usuarios', null, 405);
        break;
}
?>