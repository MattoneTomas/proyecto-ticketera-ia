# ServiceDesk - Mini Sistema de Gestión de Tickets

Proyecto portfolio profesional para LinkedIn que demuestra un sistema completo de gestión de tickets con **React, PHP y MySQL**.

## Características

✅ **Dashboard interactivo** - Estadísticas en tiempo real  
✅ **Gestión de tickets** - CRUD completo (Crear, Leer, Actualizar, Eliminar)  
✅ **Sistema de prioridades y estados** - Seguimiento completo del ciclo de vida  
✅ **Asignación de tickets** - Asignar a agentes de soporte  
✅ **Comentarios y historial** - Colaboración y auditoría  
✅ **Interfaz moderna** - Diseño profesional responsive  
✅ **API RESTful** - Backend listo para producción  

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Backend** | PHP 7.4+ |
| **Base de Datos** | MySQL/MariaDB |
| **API** | REST API con JSON |

---

## Instalación Rápida (Local)

### Requisitos Previos
- PHP 7.4 o superior
- MySQL 5.7+ o MariaDB
- Node.js 18+
- npm o yarn

### Opción 1: Windows

#### Paso 1: Instalar XAMPP (PHP + MySQL)
1. Descarga XAMPP desde: https://www.apachefriends.org/
2. Instala en `C:\xampp`
3. Abre XAMPP Control Panel y inicia **Apache** y **MySQL**

#### Paso 2: Preparar Base de Datos
1. Abre http://localhost/phpmyadmin/
2. Copia y ejecuta el contenido de `scripts/01-database-schema.sql`:
   - Abre la pestaña **SQL**
   - Pega todo el contenido
   - Haz clic en **Ejecutar**

#### Paso 3: Copiar Archivos PHP
1. Ve a `C:\xampp\htdocs`
2. Crea una carpeta llamada `servicedesk`
3. Copia los archivos de la carpeta `api/` aquí:
   \`\`\`
   C:\xampp\htdocs\servicedesk\api\config.php
   C:\xampp\htdocs\servicedesk\api\tickets.php
   C:\xampp\htdocs\servicedesk\api\users.php
   \`\`\`

#### Paso 4: Ejecutar Frontend React
\`\`\`bash
npm install
npm run dev
\`\`\`

Abre http://localhost:3000 en tu navegador.

---

### Opción 2: macOS/Linux

#### Paso 1: Instalar dependencias
\`\`\`bash
# macOS
brew install php mysql node

# Ubuntu/Debian
sudo apt-get install php mysql-server node npm
\`\`\`

#### Paso 2: Preparar Base de Datos
\`\`\`bash
# Acceder a MySQL
mysql -u root -p

# Ejecutar script SQL
mysql -u root -p < scripts/01-database-schema.sql
\`\`\`

#### Paso 3: Iniciar servidor PHP
\`\`\`bash
cd api/
php -S localhost:8000
\`\`\`

#### Paso 4: Ejecutar Frontend
\`\`\`bash
npm install
npm run dev
\`\`\`

---

## Configuración de la API

### URL Base
- **Local**: `http://localhost:8000`
- **Producción**: Tu dominio

### Variables de Conexión (config.php)

Edita `api/config.php`:
\`\`\`php
$host = 'localhost';
$db_name = 'servicedesk_db';
$db_user = 'root';
$db_password = ''; // Cambiar según tu setup
$db_port = 3306;
\`\`\`

---

## Endpoints de la API

### Tickets

**Listar tickets**
\`\`\`
GET /api/tickets.php?action=list
\`\`\`

**Crear ticket**
\`\`\`
POST /api/tickets.php?action=create
Body:
{
  "title": "Mi primer ticket",
  "description": "Descripción del problema",
  "priority": "high",
  "category_id": 1,
  "created_by": 1
}
\`\`\`

**Actualizar estado**
\`\`\`
POST /api/tickets.php?action=update&id=1
Body:
{
  "status": "resolved"
}
\`\`\`

**Agregar comentario**
\`\`\`
POST /api/tickets.php?action=add_comment&id=1
Body:
{
  "comment": "Mi comentario",
  "user_id": 1
}
\`\`\`

### Usuarios

**Listar usuarios**
\`\`\`
GET /api/users.php?action=list
\`\`\`

**Crear usuario**
\`\`\`
POST /api/users.php?action=create
Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "agent"
}
\`\`\`

---

## Estructura del Proyecto

\`\`\`
servicedesk/
├── app/
│   ├── page.tsx              # Página principal
│   └── globals.css           # Estilos globales
├── components/
│   ├── dashboard.tsx         # Dashboard con estadísticas
│   ├── tickets-list.tsx      # Lista de tickets
│   ├── create-ticket.tsx     # Formulario para crear tickets
│   ├── ticket-detail.tsx     # Vista detallada de ticket
│   └── ui/                   # Componentes UI reutilizables
├── api/
│   ├── config.php            # Configuración base de datos
│   ├── tickets.php           # API de tickets
│   └── users.php             # API de usuarios
├── scripts/
│   └── 01-database-schema.sql # Schema de base de datos
├── package.json
└── README.md                 # Este archivo
\`\`\`

---

## Guía para Video de LinkedIn

### Script de Demostración (3-5 minutos)

1. **Dashboard (30 segundos)**
   - Muestra estadísticas: Total de tickets, estados pendientes
   - Explica: "El dashboard te da una visión general del estado actual"

2. **Crear Ticket (1 minuto)**
   - Abre "Crear"
   - Completa el formulario con datos de ejemplo
   - Envía
   - Explica: "Soporte técnico puede recibir tickets de clientes fácilmente"

3. **Lista de Tickets (1 minuto)**
   - Filtra por estado y prioridad
   - Explica: "Puedes ver todos tus tickets categorizados por prioridad y estado"

4. **Detalle del Ticket (1 minuto)**
   - Abre un ticket
   - Muestra los comentarios
   - Cambia el estado (ej: "Abierto" → "En Progreso" → "Resuelto")
   - Explica: "Seguimiento completo del ciclo de vida con historial"

5. **Historial (30 segundos)**
   - Muestra el historial de cambios
   - Explica: "Auditoría completa de todos los cambios"

### Texto para LinkedIn

\`\`\`
🎫 Proyecto: Mini ServiceDesk - Sistema de Gestión de Tickets

Acabo de terminar un proyecto portfolio que demuestra mis habilidades en:
✅ Frontend: React 19 + TypeScript + Tailwind CSS
✅ Backend: PHP + REST API
✅ Database: MySQL con esquema relacional
✅ UX/UI: Diseño moderno y responsive

Características incluidas:
📊 Dashboard con estadísticas en tiempo real
🎟️ CRUD completo de tickets
👥 Sistema de asignación de agentes
💬 Comentarios y colaboración
📝 Historial de cambios (auditoría)
🎨 Interfaz moderna y profesional

El proyecto está completamente funcional y listo para producción.
¿Interesado en verlo en acción? 🚀

#FullStack #React #PHP #MySQL #WebDevelopment #Portfolio
\`\`\`

---

## Datos de Prueba

La aplicación ya viene con 4 tickets de ejemplo:

1. **TK20250110001** - Sistema de gestión de tickets (En Progreso)
2. **TK20250110002** - Error en procesamiento de pagos (Abierto)
3. **TK20250110003** - Solicitud: Integración con Slack (En Espera)
4. **TK20250109001** - Dashboard no carga (Resuelto)

Puedes crear más tickets directamente en la aplicación.

---

## Próximos Pasos para Producción

- [ ] Agregar autenticación con JWT
- [ ] Implementar búsqueda avanzada
- [ ] Agregar notificaciones por email
- [ ] Crear sistema de roles y permisos
- [ ] Agregar exportación a PDF/Excel
- [ ] Implementar panel de admin
- [ ] Agregar integración con Slack

---

## Soporte y Preguntas

Si tienes dudas sobre la instalación o quieres agregar más features, 
siéntete libre de contactarme.

---

**Hecho con ❤️ para LinkedIn**
