# Configuración de Nginx para icards.fun

Este documento explica cómo configurar Nginx como proxy inverso para que el dominio `icards.fun` funcione correctamente.

## Problema

Cuando accedes a `icards.fun`, recibes el error `ERR_CONNECTION_REFUSED` porque:
- El dominio está apuntado correctamente a la IP del VPS
- Pero no hay un servidor web escuchando en los puertos 80/443 (HTTP/HTTPS)
- La aplicación Node.js corre en el puerto 5173, que no es accesible directamente desde internet

## Solución

Usar **Nginx como proxy inverso** que:
1. Escucha en los puertos 80 y 443 (HTTP/HTTPS)
2. Redirige el tráfico HTTP a HTTPS
3. Proxifica las peticiones a:
   - `/api/*` → Backend en puerto 3000
   - `/*` → Frontend en puerto 5173
4. Configura SSL con Let's Encrypt

## Configuración Inicial (Primera Vez)

### Paso 1: Conectarse al VPS por SSH

```bash
ssh root@72.61.45.36
```

### Paso 2: Ir al directorio del proyecto

```bash
cd /root/ia-mvp
```

### Paso 3: Ejecutar el script de configuración

```bash
chmod +x scripts/setup_nginx.sh
./scripts/setup_nginx.sh
```

El script:
- Instala Nginx si no está instalado
- Copia la configuración de Nginx
- Genera certificado SSL con Let's Encrypt (si el dominio está apuntado)
- Recarga Nginx

### Paso 4: Verificar que funciona

1. Abre `https://icards.fun` en tu navegador
2. Deberías ver la aplicación funcionando
3. Verifica que las rutas `/api/*` funcionan correctamente

## Verificación Manual

### Verificar que Nginx está corriendo

```bash
systemctl status nginx
```

### Verificar configuración de Nginx

```bash
nginx -t
```

### Ver logs de Nginx

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Verificar que los servicios están corriendo

```bash
# Ver sesiones de Screen
screen -list

# Verificar puertos
netstat -tlnp | grep -E ':(80|443|3000|5173)'
```

## Renovación de Certificado SSL

Los certificados de Let's Encrypt expiran cada 90 días. Certbot se configura automáticamente para renovarlos, pero puedes renovar manualmente:

```bash
certbot renew
systemctl reload nginx
```

## Troubleshooting

### Error: "No se puede acceder a este sitio"

1. Verifica que Nginx está corriendo: `systemctl status nginx`
2. Verifica que los servicios Node.js están corriendo: `screen -list`
3. Verifica los logs: `tail -f /var/log/nginx/error.log`

### Error: "SSL certificate problem"

1. Verifica que el certificado existe: `ls -la /etc/letsencrypt/live/icards.fun/`
2. Regenera el certificado: `certbot --nginx -d icards.fun -d www.icards.fun --force-renewal`

### Los servicios no responden

1. Verifica que los puertos están abiertos en el firewall
2. Verifica que los servicios están corriendo en los puertos correctos:
   ```bash
   netstat -tlnp | grep -E ':(3000|5173)'
   ```

## Archivos de Configuración

- **Configuración de Nginx**: `nginx/icards.fun.conf`
- **Script de instalación**: `scripts/setup_nginx.sh`

## Notas Importantes

- El dominio `icards.fun` debe estar apuntado a la IP del VPS antes de generar el certificado SSL
- Los servicios Node.js (backend y frontend) deben estar corriendo antes de que Nginx pueda proxificarlos
- El firewall del VPS debe permitir tráfico en los puertos 80 y 443

