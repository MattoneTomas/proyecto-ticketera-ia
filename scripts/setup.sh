#!/bin/bash

echo "🚀 ServiceDesk - Setup Script"
echo "=============================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar Node.js
echo -e "\n${YELLOW}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js instalado${NC}"

# Verificar PHP
echo -e "\n${YELLOW}Verificando PHP...${NC}"
if ! command -v php &> /dev/null; then
    echo -e "${RED}❌ PHP no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PHP instalado${NC}"

# Verificar MySQL
echo -e "\n${YELLOW}Verificando MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MySQL instalado${NC}"

# Instalar dependencias Node
echo -e "\n${YELLOW}Instalando dependencias de Node...${NC}"
npm install
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# Crear base de datos
echo -e "\n${YELLOW}Creando base de datos...${NC}"
read -p "Ingresa usuario de MySQL (default: root): " db_user
db_user=${db_user:-root}
mysql -u $db_user < scripts/01-database-schema.sql
echo -e "${GREEN}✅ Base de datos creada${NC}"

echo -e "\n${GREEN}=============================="
echo "✅ Setup completado exitosamente"
echo "=============================="
echo -e "\nPróximos pasos:"
echo "1. En una terminal: php -S localhost:8000 (desde la carpeta api/)"
echo "2. En otra terminal: npm run dev"
echo "3. Abre http://localhost:3000"
