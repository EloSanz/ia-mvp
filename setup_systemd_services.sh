#!/bin/bash

# Script para configurar servicios systemd de iCards
# Crea archivos .service y los configura para ejecución automática

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

echo "🚀 Configurando servicios systemd para iCards..."
echo ""

# Verificar que somos root o tenemos sudo
if [ "$EUID" -ne 0 ]; then
    print_warning "Este script requiere permisos de root. Usando sudo..."
    SUDO="sudo"
else
    SUDO=""
fi

# Crear directorio temporal para servicios
TEMP_DIR="/tmp/icards-services"
mkdir -p "$TEMP_DIR"

print_info "Creando archivos de servicio..."

# 1. Servicio MCP
cat > "$TEMP_DIR/icards-mcp.service" << 'EOF'
[Unit]
Description=iCards MCP Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/iCardsMCP
Environment=AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2NDAxODE1OCwiZXhwIjoxNzY0MTA0NTU4fQ.lO1m4NTVPsoKnRbzd18uj9w-31apLUm9lKYYQ3df-bA
ExecStart=/usr/local/bin/uv run python server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=icards-mcp

[Install]
WantedBy=multi-user.target
EOF
print_status "Servicio MCP creado"

# 2. Servicio API
cat > "$TEMP_DIR/icards-api.service" << 'EOF'
[Unit]
Description=iCards API Backend
After=network.target postgresql.service
Wants=network.target
Requires=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/ia-mvp/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=icards-api

[Install]
WantedBy=multi-user.target
EOF
print_status "Servicio API creado"

# 3. Servicio Frontend
cat > "$TEMP_DIR/icards-frontend.service" << 'EOF'
[Unit]
Description=iCards Frontend
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ia-mvp/web
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=icards-frontend

[Install]
WantedBy=multi-user.target
EOF
print_status "Servicio Frontend creado"

# Copiar servicios al directorio de systemd
print_info "Copiando servicios a systemd..."
$SUDO cp "$TEMP_DIR/icards-mcp.service" /etc/systemd/system/
$SUDO cp "$TEMP_DIR/icards-api.service" /etc/systemd/system/
$SUDO cp "$TEMP_DIR/icards-frontend.service" /etc/systemd/system/
print_status "Servicios copiados"

# Recargar configuración de systemd
print_info "Recargando configuración de systemd..."
$SUDO systemctl daemon-reload
print_status "Systemd recargado"

# Detener servicios existentes si están corriendo
print_info "Deteniendo servicios existentes..."
$SUDO systemctl stop icards-mcp.service 2>/dev/null || true
$SUDO systemctl stop icards-api.service 2>/dev/null || true
$SUDO systemctl stop icards-frontend.service 2>/dev/null || true
print_status "Servicios existentes detenidos"

# Habilitar servicios
print_info "Habilitando servicios para inicio automático..."
$SUDO systemctl enable icards-mcp.service
$SUDO systemctl enable icards-api.service
$SUDO systemctl enable icards-frontend.service
print_status "Servicios habilitados"

# Iniciar servicios
print_info "Iniciando servicios..."
$SUDO systemctl start icards-mcp.service
sleep 2
$SUDO systemctl start icards-api.service
sleep 3
$SUDO systemctl start icards-frontend.service
sleep 2

# Verificar estado
echo ""
print_info "Verificando estado de servicios..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$SUDO systemctl status icards-mcp.service --no-pager -l | head -3
echo ""
$SUDO systemctl status icards-api.service --no-pager -l | head -3
echo ""
$SUDO systemctl status icards-frontend.service --no-pager -l | head -3
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Limpiar archivos temporales
rm -rf "$TEMP_DIR"

echo ""
print_status "🎉 Servicios systemd configurados exitosamente!"
echo ""
echo "📋 Comandos útiles:"
echo "   • Estado: sudo systemctl status icards-mcp.service"
echo "   • Logs: sudo journalctl -u icards-mcp.service -f"
echo "   • Reiniciar: sudo systemctl restart icards-mcp.service"
echo "   • Detener: sudo systemctl stop icards-mcp.service"
echo ""
echo "🌐 Servicios disponibles:"
echo "   • MCP Server: http://tu-vps-ip:3001"
echo "   • API Backend: http://tu-vps-ip:3000"
echo "   • Frontend: http://tu-vps-ip:5173"
echo ""
print_warning "Los servicios ahora se reinician automáticamente si fallan"
print_warning "Sobreviven a reinicios del VPS y cierres de terminal"
echo ""
print_info "Para desinstalar: sudo systemctl disable icards-*.service && sudo rm /etc/systemd/system/icards-*.service"
