<?php
// api/tickets.php - Endpoints para gestionar tickets

// Array para traducir los nombres de las categorías al español
$category_translations = [
    'Technical Support' => 'Soporte Técnico',
    'Billing' => 'Facturación',
    'Sales' => 'Ventas',
    'General Inquiry' => 'Consulta General',
    'Bug Report' => 'Reporte de Bug'
];

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
// Obtener datos JSON del request
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// La acción puede venir por GET o por POST (en el body)
$action = $_GET['action'] ?? $input['action'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'list':
                // Obtener lista de tickets con filtros
                $status = isset($_GET['status']) ? $_GET['status'] : '';
                $priority = isset($_GET['priority']) ? $_GET['priority'] : '';
                $assigned_to = isset($_GET['assigned_to']) ? (int)$_GET['assigned_to'] : 0;
                
                $query = "SELECT t.*, 
                          CASE u.name
                              WHEN 'Admin User' THEN 'Administrador de Redes'
                              WHEN 'Sarah Support' THEN 'Sara Soporte'
                              WHEN 'John Agent' THEN 'Tomas Soporte'
                              ELSE u.name
                          END as created_by_name, u.email as created_by_email,
                          CASE
                              WHEN cat.name = 'Technical Support' THEN 'Tomas Soporte'
                              WHEN cat.name = 'Billing' THEN 'Sofia Facturacion'
                              WHEN cat.name = 'Bug Report' AND t.id % 2 = 0 THEN 'Sara Soporte'
                              WHEN cat.name = 'Bug Report' AND t.id % 2 != 0 THEN 'Tomas Soporte'
                              WHEN agent.name = 'Sarah Support' THEN 'Sara Soporte'
                              ELSE agent.name 
                          END as assigned_to_name, cat.name as category_name, cat.color as category_color
                          FROM tickets t
                          LEFT JOIN users u ON t.created_by = u.id
                          LEFT JOIN users agent ON t.assigned_to = agent.id
                          LEFT JOIN categories cat ON t.category_id = cat.id
                          WHERE 1=1";
                
                if ($status) $query .= " AND t.status = '" . $conn->real_escape_string($status) . "'";
                if ($priority) $query .= " AND t.priority = '" . $conn->real_escape_string($priority) . "'";
                if ($assigned_to > 0) $query .= " AND t.assigned_to = $assigned_to";
                
                $query .= " ORDER BY t.created_at DESC LIMIT 100";
                
                $result = $conn->query($query);
                if (!$result) {
                    respondJSON(false, 'Error en query: ' . $conn->error, null, 500);
                }
                
                $tickets = [];
                while ($row = $result->fetch_assoc()) {
                    // Traducir el nombre de la categoría si existe
                    if (isset($row['category_name'])) {
                        $row['category_name'] = $category_translations[$row['category_name']] ?? $row['category_name'];
                    }
                    $tickets[] = $row;
                }
                
                respondJSON(true, 'Tickets obtenidos exitosamente', $tickets);
                break;

            case 'detail':
                if ($id <= 0) respondJSON(false, 'ID de ticket inválido', null, 400);

                // Obtener detalle de un ticket
                // Usamos consultas preparadas para prevenir Inyección SQL
                $stmt = $conn->prepare("SELECT t.*, 
                          CASE u.name
                              WHEN 'Admin User' THEN 'Administrador de Redes'
                              WHEN 'Sarah Support' THEN 'Sara Soporte'
                              WHEN 'John Agent' THEN 'Tomas Soporte'
                              ELSE u.name
                          END as created_by_name, u.email as created_by_email,
                          CASE agent.name
                              WHEN cat.name = 'Technical Support' AND t.id % 2 != 0 THEN 'Tomas Soporte'
                              WHEN cat.name = 'Technical Support' AND t.id % 2 = 0 THEN 'Sara Soporte'
                              WHEN cat.name = 'Billing' THEN 'Sofia Facturacion'
                              WHEN cat.name = 'Bug Report' AND t.id % 2 = 0 THEN 'Sara Soporte'
                              WHEN cat.name = 'Bug Report' AND t.id % 2 != 0 THEN 'Tomas Soporte'
                              WHEN agent.name = 'Admin User' THEN 'Administrador de Redes'
                              WHEN 'Sarah Support' THEN 'Sara Soporte'
                              WHEN 'John Agent' THEN 'Tomas Soporte'
                              ELSE agent.name
                          END as assigned_to_name, agent.email as assigned_to_email, 
                          cat.name as category_name, cat.color as category_color
                          FROM tickets t
                          LEFT JOIN users u ON t.created_by = u.id
                          LEFT JOIN users agent ON t.assigned_to = agent.id
                          LEFT JOIN categories cat ON t.category_id = cat.id
                          WHERE t.id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $ticket = $result->fetch_assoc();
                
                if (!$ticket) {
                    respondJSON(false, 'Ticket no encontrado', null, 404);
                }
                
                // Traducir el nombre de la categoría si existe
                if (isset($ticket['category_name'])) {
                    $ticket['category_name'] = $category_translations[$ticket['category_name']] ?? $ticket['category_name'];
                }

                // Obtener comentarios
                $comments_query = "SELECT tc.*, 
                                  CASE u.name
                                      WHEN 'Admin User' THEN 'Administrador de Redes'
                                      WHEN 'Sarah Support' THEN 'Sara Soporte'
                                      WHEN 'John Agent' THEN 'Tomas Soporte'
                                      ELSE u.name
                                  END as name, u.email FROM ticket_comments tc
                                  LEFT JOIN users u ON tc.user_id = u.id
                                  WHERE tc.ticket_id = $id
                                  ORDER BY tc.created_at ASC"; // Cambiado a ASC para orden cronológico
                $comments_result = $conn->query($comments_query);
                $comments = [];
                while ($row = $comments_result->fetch_assoc()) {
                    $comments[] = $row;
                }
                $ticket['comments'] = $comments;
                
                // Obtener historial
                $history_query = "SELECT th.*, 
                                  CASE u.name
                                      WHEN 'Admin User' THEN 'Administrador de Redes'
                                      WHEN 'Sarah Support' THEN 'Sara Soporte'
                                      WHEN 'John Agent' THEN 'Tomas Soporte'
                                      ELSE u.name
                                  END as changed_by FROM ticket_history th
                                 LEFT JOIN users u ON th.changed_by = u.id
                                 WHERE th.ticket_id = $id
                                 ORDER BY th.created_at DESC";
                $history_result = $conn->query($history_query);
                $history = [];
                while ($row = $history_result->fetch_assoc()) {
                    $history[] = $row;
                }
                $ticket['history'] = $history;
                
                respondJSON(true, 'Detalle del ticket', $ticket);
                break;

            case 'stats':
                // Obtener estadísticas
                $stats = [];
                
                $days = isset($_GET['days']) ? (int)$_GET['days'] : 30; // Filtro de días, 30 por defecto
                $date_filter = "";
                if ($days > 0) {
                    $date_filter = " AND created_at >= DATE_SUB(NOW(), INTERVAL $days DAY)";
                }

                $statuses = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];
                foreach ($statuses as $status) {
                    $result = $conn->query("SELECT COUNT(*) as count FROM tickets WHERE status = '$status'" . $date_filter);
                    $row = $result->fetch_assoc();
                    $stats[$status] = $row['count'];
                }

                // Datos para el gráfico de actividad, agrupados directamente desde la consulta SQL
                $activity_query = "SELECT
                    DATE(created_at) as date,
                    SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low,
                    SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
                    SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent
                    FROM tickets
                    WHERE 1=1 " . $date_filter . "
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC";
                $activity_result = $conn->query($activity_query);
                $activity_data = $activity_result->fetch_all(MYSQLI_ASSOC);

                // Combinar estadísticas y actividad en la respuesta
                $response_data = [
                    'summary' => $stats,
                    'activity' => $activity_data
                ];
                
                respondJSON(true, 'Estadísticas obtenidas', $response_data);
                break;

            default:
                respondJSON(false, 'Acción GET no válida', null, 404);
                break;
        }
        break;

    case 'POST':
        switch ($action) {
            case 'create':
                // Crear nuevo ticket
                $title = $conn->real_escape_string($input['title'] ?? '');
                $description = $conn->real_escape_string($input['description'] ?? '');
                $category_id = (int)($input['category_id'] ?? 1);
                $priority = $input['priority'] ?? 'medium';
                $created_by = (int)($input['created_by'] ?? 1);
                $assigned_to = isset($input['assigned_to_id']) ? (int)$input['assigned_to_id'] : null;
                
                if (!$title || !$description) {
                    respondJSON(false, 'Título y descripción son requeridos', null, 400);
                }
                
                $ticket_number = generateTicketNumber($conn);
                $assigned_to_sql = $assigned_to ? $assigned_to : "NULL";
                $query = "INSERT INTO tickets (ticket_number, title, description, category_id, priority, created_by, status, assigned_to)
                          VALUES ('$ticket_number', '$title', '$description', $category_id, '$priority', $created_by, 'open', $assigned_to_sql)";
                
                if ($conn->query($query)) {
                    $ticket_id = $conn->insert_id;
                    
                    // Registrar en historial
                    $conn->query("INSERT INTO ticket_history (ticket_id, changed_by, field_name, new_value)
                                VALUES ($ticket_id, $created_by, 'status', 'open')");
                    
                    $result = $conn->query("SELECT * FROM tickets WHERE id = $ticket_id");
                    $ticket = $result->fetch_assoc();
                    
                    respondJSON(true, 'Ticket creado exitosamente', $ticket, 201);
                } else {
                    respondJSON(false, 'Error al crear ticket: ' . $conn->error, null, 500);
                }
                break;

            case 'update':
                if ($id <= 0) respondJSON(false, 'ID de ticket inválido', null, 400);
                // Actualizar ticket
                $updates = [];
                $changed_by = (int)($input['changed_by'] ?? 1);
                
                $allowed_fields = ['title', 'description', 'status', 'priority', 'assigned_to', 'category_id'];
                
                foreach ($allowed_fields as $field) {
                    if (isset($input[$field])) {
                        $value = $input[$field];
                        if ($value === null) {
                            $updates[] = "$field = NULL";
                        } else {
                            $value = $conn->real_escape_string($value);
                            $updates[] = "$field = '$value'";
                        }
                        
                        // Registrar en historial
                        $old_value_result = $conn->query("SELECT $field FROM tickets WHERE id = $id");
                        $old_row = $old_value_result->fetch_assoc();
                        $old_value = $old_row[$field] ?? '';
                        
                        $conn->query("INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
                                     VALUES ($id, $changed_by, '$field', '$old_value', '$value')");
                    }
                }
                
                if (empty($updates)) {
                    respondJSON(false, 'No hay campos para actualizar', null, 400);
                }
                
                $query = "UPDATE tickets SET " . implode(', ', $updates) . ", updated_at = CURRENT_TIMESTAMP WHERE id = $id";
                
                if ($conn->query($query)) {
                    // Después de actualizar, obtenemos el ticket completo con todos sus detalles
                    $query_detail = "SELECT t.*, u.name as created_by_name, agent.name as assigned_to_name, cat.name as category_name, cat.color as category_color
                                     FROM tickets t
                                     LEFT JOIN users u ON t.created_by = u.id
                                     LEFT JOIN users agent ON t.assigned_to = agent.id
                                     LEFT JOIN categories cat ON t.category_id = cat.id
                                     WHERE t.id = $id";
                    $result = $conn->query($query_detail);
                    $ticket = $result->fetch_assoc();

                    // Obtener comentarios actualizados
                    $comments_result = $conn->query("SELECT tc.*, u.name FROM ticket_comments tc LEFT JOIN users u ON tc.user_id = u.id WHERE tc.ticket_id = $id ORDER BY tc.created_at ASC");
                    $ticket['comments'] = [];
                    while ($row = $comments_result->fetch_assoc()) {
                        $ticket['comments'][] = $row;
                    }

                    // Obtener historial actualizado
                    $history_result = $conn->query("SELECT th.*, u.name as changed_by FROM ticket_history th LEFT JOIN users u ON th.changed_by = u.id WHERE th.ticket_id = $id ORDER BY th.created_at DESC");
                    $ticket['history'] = [];
                    while ($row = $history_result->fetch_assoc()) {
                        $ticket['history'][] = $row;
                    }

                    respondJSON(true, 'Ticket actualizado', $ticket);
                } else {
                    respondJSON(false, 'Error al actualizar: ' . $conn->error, null, 500);
                }
                break;

            case 'comment':
                if ($id <= 0) respondJSON(false, 'ID de ticket inválido', null, 400);
                // Agregar comentario
                $comment = $conn->real_escape_string($input['comment'] ?? '');
                $user_id = (int)($input['user_id'] ?? 1);
                $is_internal = isset($input['is_internal']) ? 1 : 0;
                
                if (!$comment) {
                    respondJSON(false, 'El comentario no puede estar vacío', null, 400);
                }
                
                $query = "INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal)
                          VALUES ($id, $user_id, '$comment', $is_internal)";
                
                if ($conn->query($query)) {
                    $comment_id = $conn->insert_id;

                    // Después de agregar el comentario, obtenemos el ticket completo y actualizado
                    $query_detail = "SELECT t.*, u.name as created_by_name, agent.name as assigned_to_name, cat.name as category_name, cat.color as category_color
                                     FROM tickets t
                                     LEFT JOIN users u ON t.created_by = u.id
                                     LEFT JOIN users agent ON t.assigned_to = agent.id
                                     LEFT JOIN categories cat ON t.category_id = cat.id
                                     WHERE t.id = $id";
                    $result = $conn->query($query_detail);
                    $ticket = $result->fetch_assoc();

                    // Obtener comentarios actualizados
                    $comments_result = $conn->query("SELECT tc.*, u.name FROM ticket_comments tc LEFT JOIN users u ON tc.user_id = u.id WHERE tc.ticket_id = $id ORDER BY tc.created_at ASC");
                    $ticket['comments'] = [];
                    while ($row = $comments_result->fetch_assoc()) {
                        $ticket['comments'][] = $row;
                    }

                    // Obtener historial actualizado
                    $history_result = $conn->query("SELECT th.*, u.name as changed_by FROM ticket_history th LEFT JOIN users u ON th.changed_by = u.id WHERE th.ticket_id = $id ORDER BY th.created_at DESC");
                    $ticket['history'] = [];
                    while ($row = $history_result->fetch_assoc()) {
                        $ticket['history'][] = $row;
                    }
                    respondJSON(true, 'Comentario agregado', $ticket, 201);
                } else {
                    respondJSON(false, 'Error al agregar comentario: ' . $conn->error, null, 500);
                }
                break;

            case 'analyze_ticket':
                $description = $input['description'] ?? '';

                if (empty($description)) {
                    respondJSON(false, 'La descripción está vacía', null, 400);
                    return;
                }

                // --- SIMULACIÓN DE INTELIGENCIA ARTIFICIAL ---
                // En un proyecto real, aquí harías una llamada a una API de IA (como OpenAI, Gemini, etc.)
                // enviando la descripción y pidiendo que la clasifique.
                //
                // Ejemplo de prompt para OpenAI:
                // "Analiza el siguiente texto de un ticket de soporte y clasifícalo.
                // Categorías posibles: 1 (Soporte Técnico), 2 (Facturación), 3 (Ventas), 4 (Consulta General).
                // Prioridades posibles: 'low', 'medium', 'high', 'urgent'.
                // Devuelve solo un JSON con las claves 'category_id' y 'priority'.
                // Texto: '{$description}'"

                $description_lower = strtolower($description);
                $suggested_priority = 'low';
                $suggested_category_id = 4; // Por defecto: Consulta General
                $suggested_assigned_to_id = null; // Por defecto: sin asignar

                // Lógica de simulación simple basada en palabras clave
                // Prioridad Urgente: palabras que denotan una crisis inmediata.
                if (str_contains($description_lower, 'urgente') || str_contains($description_lower, 'caida masiva') || str_contains($description_lower, 'roto') || str_contains($description_lower, 'caído') || str_contains($description_lower, 'error crítico') || str_contains($description_lower, 'no puedo trabajar')) {
                    $suggested_priority = 'urgent';
                    $suggested_category_id = 1; // Soporte Técnico
                    $support_agents = [2, 3]; // IDs para Sara y Tomas
                    $suggested_assigned_to_id = $support_agents[array_rand($support_agents)];
                
                // Prioridad Alta: problemas que bloquean pero no son una crisis total.
                } elseif (str_contains($description_lower, 'problema') || str_contains($description_lower, 'no funciona') || str_contains($description_lower, 'error')) {
                    $suggested_priority = 'high';
                    $suggested_category_id = 1; // Soporte Técnico
                    $support_agents = [2, 3]; // IDs para Sara y Tomas
                    $suggested_assigned_to_id = $support_agents[array_rand($support_agents)];

                } elseif (str_contains($description_lower, 'bug') || str_contains($description_lower, 'reporte de bug')) {
                    $suggested_priority = 'high';
                    $suggested_category_id = 5; // Bug Report
                    $support_agents = [2, 3]; // IDs para Sara y Tomas
                    $suggested_assigned_to_id = $support_agents[array_rand($support_agents)];

                // Prioridad Media: temas que no bloquean pero son importantes.
                } elseif (str_contains($description_lower, 'factura') || str_contains($description_lower, 'pago')) {
                    $suggested_priority = 'medium';
                    $suggested_category_id = 2; // Facturación
                    $suggested_assigned_to_id = 4; // Asignar a Sofia Facturacion

                // Prioridad Baja: consultas o dudas.
                } elseif (str_contains($description_lower, 'pregunta') || str_contains($description_lower, 'cómo')) {
                    $suggested_priority = 'low';
                    $suggested_category_id = 4; // Consulta General
                }

                $suggestion = [
                    'category_id' => $suggested_category_id,
                    'priority' => $suggested_priority,
                    'assigned_to_id' => $suggested_assigned_to_id
                ];

                respondJSON(true, 'Análisis completado', $suggestion);
                break;

            default:
                respondJSON(false, 'Acción POST no válida', null, 404);
                break;
        }
        break;
    default:
        respondJSON(false, 'Método no soportado', null, 405);
        break;
}
?>
