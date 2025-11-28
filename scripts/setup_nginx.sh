#!/bin/bash

# Script para configurar Nginx como proxy inverso para icards.fun
# Requiere: nginx, certbot

set -e

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

# Verificar que estamos en el directorio correcto
if [ ! -f "nginx/icards.fun.conf" ]; then
    print_error "No se encontró nginx/icards.fun.conf. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

print_info "🔧 Configurando Nginx para icards.fun..."

# Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    print_info "Instalando Nginx..."
    apt-get update
    apt-get install -y nginx
    print_status "Nginx instalado"
else
    print_status "Nginx ya está instalado"
fi

# Copiar configuración de Nginx
print_info "Copiando configuración de Nginx..."
cp nginx/icards.fun.conf /etc/nginx/sites-available/icards.fun.conf

# Crear enlace simbólico si no existe
if [ ! -L /etc/nginx/sites-enabled/icards.fun.conf ]; then
    ln -s /etc/nginx/sites-available/icards.fun.conf /etc/nginx/sites-enabled/icards.fun.conf
    print_status "Configuración habilitada"
else
    print_warning "La configuración ya está habilitada"
fi

# Verificar configuración de Nginx
print_info "Verificando configuración de Nginx..."
if nginx -t; then
    print_status "Configuración de Nginx válida"
else
    print_error "Error en la configuración de Nginx"
    exit 1
fi

# Instalar certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    print_info "Instalando Certbot..."
    apt-get install -y certbot python3-certbot-nginx
    print_status "Certbot instalado"
else
    print_status "Certbot ya está instalado"
fi

# Verificar si ya existe el certificado SSL
if [ -d "/etc/letsencrypt/live/icards.fun" ]; then
    print_warning "El certificado SSL ya existe. Omitiendo generación."
    print_info "Para renovar el certificado, ejecuta: certbot renew"
else
    print_info "Generando certificado SSL con Let's Encrypt..."
    print_warning "Asegúrate de que el dominio icards.fun apunta a esta IP antes de continuar"
    read -p "¿El dominio está apuntado correctamente? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot --nginx -d icards.fun -d www.icards.fun --non-interactive --agree-tos --email admin@icards.fun --redirect
        print_status "Certificado SSL generado"
    else
        print_warning "Omitiendo generación de certificado SSL. Configura el dominio primero."
        print_info "Para generar el certificado después, ejecuta:"
        print_info "certbot --nginx -d icards.fun -d www.icards.fun"
    fi
fi

# Recargar Nginx
print_info "Recargando Nginx..."
systemctl reload nginx
print_status "Nginx recargado"

# Habilitar Nginx para iniciar al arrancar
systemctl enable nginx

print_status "✅ Nginx configurado correctamente!"
print_info "El dominio icards.fun ahora debería funcionar en https://icards.fun"
print_info "Asegúrate de que los servicios en los puertos 3000 (backend) y 5173 (frontend) estén corriendo"

