# Guía Detallada de Instalación - Windows

## ⚙️ Instalación Paso a Paso

### Paso 1: Descargar XAMPP

1. Ve a https://www.apachefriends.org/
2. Descarga **XAMPP para Windows** (recomendado con PHP 8.0+)
3. Ejecuta el instalador
4. Instala en `C:\xampp` (ruta por defecto)
5. Asegúrate de instalar: **Apache** y **MySQL**

### Paso 2: Verificar Instalación

1. Abre **XAMPP Control Panel** (desde el menú inicio)
2. Haz clic en **Start** en la fila de **Apache**
3. Haz clic en **Start** en la fila de **MySQL**

Deberían ponerse de color **verde**.

### Paso 3: Crear Base de Datos

1. Abre http://localhost/phpmyadmin/ en tu navegador
2. Te debería aparecer la interfaz de phpMyAdmin
3. Haz clic en la pestaña **SQL** en la parte superior
4. Abre el archivo `scripts/01-database-schema.sql` con Notepad
5. Copia TODO el contenido
6. Pégalo en phpMyAdmin
7. Haz clic en el botón **Ejecutar** (abajo a la derecha)

✅ Base de datos creada exitosamente

### Paso 4: Copiar Archivos PHP

1. Navega a `C:\xampp\htdocs`
2. Crea una nueva carpeta: `servicedesk`
3. Copia estos archivos aquí:
   - `api/config.php`
   - `api/tickets.php`
   - `api/users.php`

Estructura final:
\`\`\`
C:\xampp\htdocs\
├── servicedesk/
│   └── api/
│       ├── config.php
│       ├── tickets.php
│       └── users.php
\`\`\`

### Paso 5: Verificar PHP API

1. Abre tu navegador
2. Ve a: http://localhost/servicedesk/api/tickets.php?action=list
3. Deberías ver un JSON con los tickets (vacío inicialmente)

Si ves errores, revisa `api/config.php` y asegúrate que los datos de conexión sean correctos.

### Paso 6: Instalar y Ejecutar React

1. Abre **Command Prompt** (CMD)
2. Navega a tu carpeta del proyecto:
   \`\`\`cmd
   cd C:\Users\TuUsuario\Documentos\servicedesk
   \`\`\`
3. Instala dependencias:
   \`\`\`cmd
   npm install
   \`\`\`
4. Inicia el servidor de desarrollo:
   \`\`\`cmd
   npm run dev
   \`\`\`
5. Abre http://localhost:3000 en tu navegador

### Paso 7: Conectar Frontend con Backend

En `components/`, edita cada componente que haga llamadas API y cambia:

De:
\`\`\`javascript
const response = await fetch('http://localhost:8000/api/tickets.php?action=list')
\`\`\`

A:
\`\`\`javascript
const response = await fetch('http://localhost/servicedesk/api/tickets.php?action=list')
\`\`\`

---

## ✅ Verificar que Todo Funciona

- [ ] Apache está corriendo (verde en XAMPP)
- [ ] MySQL está corriendo (verde en XAMPP)
- [ ] phpMyAdmin funciona: http://localhost/phpmyadmin/
- [ ] API responde: http://localhost/servicedesk/api/tickets.php?action=list
- [ ] React está en: http://localhost:3000
- [ ] Puedes ver el dashboard
- [ ] Puedes crear tickets
- [ ] Los cambios de estado se guardan

---

## 🆘 Solución de Problemas

### "Apache no inicia"
- Revisa si otro programa usa puerto 80
- Abre CMD como administrador
- En XAMPP, intenta "Config" → "Service and Port Settings"

### "MySQL no inicia"
- A veces conflictúa con otros servicios
- En XAMPP, prueba desinstalar/reinstalar MySQL

### "Error en base de datos"
- Asegúrate que el usuario es `root` sin contraseña
- O edita `config.php` con tus credenciales reales

### "React no ve la API"
- Verifica CORS en `api/config.php`
- Asegúrate que los headers incluyan `Access-Control-Allow-Origin: *`

---

## 🚀 Listo para Grabar

Ya tienes todo funcionando. Ahora puedes grabar tu video demostrando todas las funcionalidades.
