#!/bin/bash

# Script alternativo usando screen para mantener servicios corriendo
# Requiere: apt install screen

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que screen está instalado
if ! command -v screen &> /dev/null; then
    print_error "Screen no está instalado. Instala con: apt install screen"
    exit 1
fi

print_info "🚀 Iniciando servicios con Screen..."

# Verificar la rama actual de Git en /root/ia-mvp
print_info "Verificando la rama de Git en /root/ia-mvp..."
current_branch=$(cd /root/ia-mvp && git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" != "develop" ]; then
    print_error "Error: El repositorio /root/ia-mvp debe estar en la rama 'develop'. Rama actual: $current_branch"
    exit 1
fi

print_status "El repositorio /root/ia-mvp está en la rama 'develop'. Procediendo..."

# Verificar que screen está instalado
if ! command -v screen &> /dev/null; then
    print_error "Screen no está instalado. Instala con: apt install screen"
    exit 1
fi

print_info "🚀 Iniciando servicios con Screen..."

# Función para iniciar servicio en screen
start_in_screen() {
    local session_name=$1
    local command=$2
    local working_dir=$3

    # Verificar si la sesión ya existe
    if screen -list | grep -q "$session_name"; then
        print_warning "Sesión $session_name ya existe, omitiendo"
        return
    fi

    print_status "Iniciando $session_name..."
    cd "$working_dir"
    screen -dmS "$session_name" bash -c "$command"
}

# 1. MCP Server
start_in_screen "icards-mcp" "AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2NDAxODE1OCwiZXhwIjoxNzY0MTA0NTU4fQ.lO1m4NTVPsoKnRbzd18uj9w-31apLUm9lKYYQ3df-bA uv run python server.py" "/root/iCardsMCP"

# 2. API Backend
start_in_screen "icards-api" "npm run dev" "/root/ia-mvp/server"

# 3. Frontend
start_in_screen "icards-frontend" "npm run dev" "/root/ia-mvp/web"

echo ""
print_info "🎉 Servicios iniciados en sesiones de Screen!"
echo ""
echo "📊 Sesiones activas:"
screen -list
echo ""
echo "📋 Comandos útiles:"
echo "   • Ver sesiones: screen -list"
echo "   • Conectar a sesión: screen -r icards-mcp"
echo "   • Desconectar: Ctrl+A, D"
echo "   • Matar sesión: screen -X -S icards-mcp quit"
echo ""
echo "🌐 Servicios disponibles:"
echo "   • MCP Server: http://tu-vps-ip:3001"
echo "   • API Backend: http://tu-vps-ip:3000"
echo "   • Frontend: http://tu-vps-ip:5173"
echo ""
print_warning "Los servicios seguirán corriendo aunque cierres la terminal SSH"
