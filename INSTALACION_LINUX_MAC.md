# Guía Detallada de Instalación - Linux/macOS

## ⚙️ Instalación Paso a Paso

### macOS

#### Paso 1: Instalar Homebrew (si no lo tienes)
\`\`\`bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
\`\`\`

#### Paso 2: Instalar PHP, MySQL y Node
\`\`\`bash
brew install php mysql node
\`\`\`

#### Paso 3: Iniciar MySQL
\`\`\`bash
brew services start mysql
\`\`\`

#### Paso 4: Crear Base de Datos
\`\`\`bash
# Acceder a MySQL
mysql -u root

# Dentro de MySQL, ejecutar:
SOURCE /ruta/a/scripts/01-database-schema.sql;
EXIT;
\`\`\`

O alternativa:
\`\`\`bash
mysql -u root < scripts/01-database-schema.sql
\`\`\`

#### Paso 5: Copiar Archivos PHP
\`\`\`bash
mkdir -p ~/Sites/servicedesk/api
cp api/config.php ~/Sites/servicedesk/api/
cp api/tickets.php ~/Sites/servicedesk/api/
cp api/users.php ~/Sites/servicedesk/api/
\`\`\`

#### Paso 6: Iniciar Servidor PHP
\`\`\`bash
cd ~/Sites/servicedesk/api
php -S localhost:8000
\`\`\`

#### Paso 7: Instalar y Ejecutar React
En otra terminal:
\`\`\`bash
npm install
npm run dev
\`\`\`

Abre http://localhost:3000

---

### Ubuntu/Debian

#### Paso 1: Actualizar paquetes
\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

#### Paso 2: Instalar dependencias
\`\`\`bash
sudo apt install -y php php-mysql mysql-server nodejs npm git
\`\`\`

#### Paso 3: Iniciar MySQL
\`\`\`bash
sudo service mysql start
\`\`\`

#### Paso 4: Crear Base de Datos
\`\`\`bash
sudo mysql -u root < scripts/01-database-schema.sql
\`\`\`

Si pide contraseña:
\`\`\`bash
sudo mysql -u root -p < scripts/01-database-schema.sql
\`\`\`

#### Paso 5: Copiar Archivos PHP
\`\`\`bash
sudo mkdir -p /var/www/servicedesk/api
sudo cp api/config.php /var/www/servicedesk/api/
sudo cp api/tickets.php /var/www/servicedesk/api/
sudo cp api/users.php /var/www/servicedesk/api/
sudo chown -R www-data:www-data /var/www/servicedesk
\`\`\`

#### Paso 6: Configurar PHP
\`\`\`bash
cd /var/www/servicedesk/api
php -S localhost:8000
\`\`\`

#### Paso 7: Instalar y Ejecutar React
En otra terminal:
\`\`\`bash
npm install
npm run dev
\`\`\`

Abre http://localhost:3000

---

## ✅ Verificar que Todo Funciona

\`\`\`bash
# Verificar PHP
php -v

# Verificar MySQL
mysql --version

# Verificar Node
node --version

# Verificar API
curl http://localhost:8000/api/tickets.php?action=list

# Verificar React
curl http://localhost:3000
\`\`\`

---

## 🆘 Solución de Problemas

### "MySQL connection refused"
\`\`\`bash
sudo service mysql restart
\`\`\`

### "Permission denied" en carpetas
\`\`\`bash
sudo chown -R $USER:$USER ./
\`\`\`

### "Port already in use"
Cambiar puertos en los comandos:
\`\`\`bash
php -S localhost:9000  # Cambiar a 9000
npm run dev -- --port 3001  # Cambiar a 3001
\`\`\`

---

## 🚀 Listo para Grabar

Ya tienes todo funcionando en Linux/macOS.
