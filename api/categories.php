<?php
// api/categories.php - Endpoints para gestionar categorías

// Array para traducir los nombres de las categorías al español
$category_translations = [
    'Technical Support' => 'Soporte Técnico',
    'Billing' => 'Facturación',
    'Sales' => 'Ventas',
    'General Inquiry' => 'Consulta General',
    // Añade más traducciones si tienes otras categorías
];


require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'list':
                $query = "SELECT id, name FROM categories ORDER BY name ASC";
                $result = $conn->query($query);

                if (!$result) {
                    respondJSON(false, 'Error en la consulta de categorías: ' . $conn->error, null, 500);
                }

                $categories = [];
                while ($row = $result->fetch_assoc()) {
                    // Traduce el nombre si existe en el array de traducciones
                    $original_name = $row['name'];
                    $row['name'] = $category_translations[$original_name] ?? $original_name;
                    $categories[] = $row;
                }
                respondJSON(true, 'Categorías obtenidas exitosamente', $categories);
                break;

            default:
                respondJSON(false, 'Acción GET no válida para categorías', null, 404);
                break;
        }
        break;
    default:
        respondJSON(false, 'Método no soportado para categorías', null, 405);
        break;
}
?>