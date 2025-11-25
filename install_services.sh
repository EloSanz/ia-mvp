#!/bin/bash

# Script para instalar servicios systemd de iCards en Ubuntu VPS

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

echo "🚀 Instalando servicios systemd para iCards..."
echo ""

# Verificar que somos root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root"
    exit 1
fi

# Verificar que los directorios existen
if [ ! -d "/root/iCardsMCP" ]; then
    print_error "Directorio /root/iCardsMCP no encontrado"
    exit 1
fi

if [ ! -d "/root/ia-mvp/server" ]; then
    print_error "Directorio /root/ia-mvp/server no encontrado"
    exit 1
fi

if [ ! -d "/root/ia-mvp/web" ]; then
    print_error "Directorio /root/ia-mvp/web no encontrado"
    exit 1
fi

# Copiar archivos de servicio
print_info "Copiando archivos de servicio..."

if [ -f "systemd/icards-mcp.service" ]; then
    cp systemd/icards-mcp.service /etc/systemd/system/
    print_status "Servicio MCP copiado"
else
    print_error "Archivo systemd/icards-mcp.service no encontrado"
fi

if [ -f "systemd/icards-api.service" ]; then
    cp systemd/icards-api.service /etc/systemd/system/
    print_status "Servicio API copiado"
else
    print_error "Archivo systemd/icards-api.service no encontrado"
fi

if [ -f "systemd/icards-frontend.service" ]; then
    cp systemd/icards-frontend.service /etc/systemd/system/
    print_status "Servicio Frontend copiado"
else
    print_error "Archivo systemd/icards-frontend.service no encontrado"
fi

# Recargar systemd
print_info "Recargando configuración de systemd..."
systemctl daemon-reload
print_status "Systemd recargado"

# Habilitar servicios
print_info "Habilitando servicios..."
systemctl enable icards-mcp.service
systemctl enable icards-api.service
systemctl enable icards-frontend.service
print_status "Servicios habilitados"

# Iniciar servicios
print_info "Iniciando servicios..."
systemctl start icards-mcp.service
systemctl start icards-api.service
systemctl start icards-frontend.service

# Verificar estado
echo ""
print_info "Verificando estado de servicios..."
echo ""

echo "📊 Estado de servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
systemctl status icards-mcp.service --no-pager -l | head -3
echo ""
systemctl status icards-api.service --no-pager -l | head -3
echo ""
systemctl status icards-frontend.service --no-pager -l | head -3
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
print_status "🎉 Servicios instalados y ejecutándose!"
echo ""
echo "📋 Comandos útiles:"
echo "   • Ver logs: journalctl -u icards-mcp.service -f"
echo "   • Ver estado: systemctl status icards-*"
echo "   • Reiniciar: systemctl restart icards-mcp.service"
echo "   • Detener: systemctl stop icards-mcp.service"
echo ""
echo "🌐 Servicios disponibles:"
echo "   • MCP Server: http://tu-vps-ip:3001"
echo "   • API Backend: http://tu-vps-ip:3000"
echo "   • Frontend: http://tu-vps-ip:5173"
echo ""
print_warning "Los servicios se reiniciarán automáticamente si fallan"
echo ""
print_info "Para desinstalar: systemctl disable icards-*.service && rm /etc/systemd/system/icards-*.service"
