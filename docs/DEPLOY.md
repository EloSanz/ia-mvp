# Despliegue y publicación de imágenes Docker (resumen para el equipo)

Este documento resume los pasos para construir imágenes Docker del frontend y backend, etiquetarlas, subirlas a Azure Container Registry (ACR) y desplegarlas en Azure App Service o mediante docker-compose en producción. Incluye comandos y fallos comunes para facilitar el trabajo del equipo.

## Nota sobre el ACR usado en este proyecto

En este repositorio usamos el registro de contenedores `icardflash.azurecr.io` (creado desde el Portal de Azure). En todas las instrucciones de este documento puedes sustituir `icardflash` por el nombre de tu propio ACR si vas a usar un registry distinto.

Si prefieres que cada desarrollador tenga su propio registry para pruebas, cualquiera puede crear uno con Azure CLI. Ejemplo:

```powershell
# Crear un Azure Container Registry (reemplaza <ACR_NAME> y <RG_NAME>)
az acr create --resource-group <RG_NAME> --name <ACR_NAME> --sku Basic --location "Canada Central"

# Ejemplo real:
az acr create --resource-group rg-icardflash --name willianicardacr --sku Basic --location "Canada Central"
```

Autenticación y push de imágenes:

```powershell
# Login recomendado usando Azure CLI (no necesita exponer credenciales):
az acr login --name <ACR_NAME>

# Alternativa (activar usuario admin del ACR y obtener credenciales):
az acr update --name <ACR_NAME> --admin-enabled true
az acr credential show --name <ACR_NAME>

# Luego (si usas credenciales):
docker login <ACR_NAME>.azurecr.io --username <username> --password <password>
docker push <ACR_NAME>.azurecr.io/frontend:v1
docker push <ACR_NAME>.azurecr.io/backend:v1
```

Dar permisos a un desarrollador o service principal para que pueda pushear (rol `AcrPush`):

```powershell
# Obtener el id del ACR
ACR_ID=$(az acr show --name <ACR_NAME> --resource-group <RG_NAME> --query id -o tsv)

# Asignar rol AcrPush a un usuario o SP (reemplaza <ASSIGNEE> por UPN o objectId)
az role assignment create --assignee <ASSIGNEE> --role AcrPush --scope $ACR_ID
```

Recomendación de nombres: usa un prefijo con tu usuario o initials para evitar colisiones, por ejemplo `willian-icard-acr`.


## 1) Construir las imágenes (local)

- Frontend (produce una imagen que sirve con Nginx):

```powershell
# Desde la raíz del repo
docker build -t icardflash.azurecr.io/frontend:v1 ./web
# Alternativa: usar docker compose para build
docker compose build frontend
```

- Backend:

```powershell
docker build -t icardflash.azurecr.io/backend:v1 ./server
# Alternativa:
docker compose build backend
```

## 2) Etiquetar imágenes (si procede)

```powershell
docker tag ia-mvp-frontend:latest icardflash.azurecr.io/frontend:v1
docker tag ia-mvp-backend:latest icardflash.azurecr.io/backend:v1
```

## 3) Login y push a ACR

```powershell
# Login en ACR (puedes usar az acr login o docker login)
docker login icardflash.azurecr.io --username <ACR_USER> --password <ACR_PASS>

docker push icardflash.azurecr.io/frontend:v1
docker push icardflash.azurecr.io/backend:v1
```

## 4) Verificar imágenes en ACR

```powershell
az acr repository show-tags --name icardflash --repository frontend --output table
az acr repository show-tags --name icardflash --repository backend --output table
```

## 5) Despliegue en Azure App Service

- App Service (imagen única):

```powershell
az webapp config container set \
  --name <APP_NAME> \
  --resource-group <RG_NAME> \
  --docker-custom-image-name icardflash.azurecr.io/frontend:v1 \
  --docker-registry-server-url https://icardflash.azurecr.io \
  --docker-registry-server-user <ACR_USER> \
  --docker-registry-server-password <ACR_PASS>

az webapp restart --name <APP_NAME> --resource-group <RG_NAME>
```

- App Service Slot (staging/blue-green):

```powershell
az webapp deployment slot create --name <APP_NAME> --resource-group <RG_NAME> --slot <SLOT_NAME>
az webapp config container set --name <APP_NAME> --resource-group <RG_NAME> --slot <SLOT_NAME> --docker-custom-image-name icardflash.azurecr.io/frontend:v1 --docker-registry-server-url https://icardflash.azurecr.io --docker-registry-server-user <ACR_USER> --docker-registry-server-password <ACR_PASS>
az webapp restart --name <APP_NAME> --resource-group <RG_NAME> --slot <SLOT_NAME>
```

## 6) Managed Identity (recomendado)

Evita credenciales en App Settings asignando identidad administrada y dando rol AcrPull al ACR.

```powershell
az webapp identity assign --name <APP_NAME> --resource-group <RG_NAME>
ACR_ID=$(az acr show --name icardflash --resource-group <RG_NAME> --query id -o tsv)
PRINCIPAL_ID=$(az webapp identity show --name <APP_NAME> --resource-group <RG_NAME> --query principalId -o tsv)
az role assignment create --assignee $PRINCIPAL_ID --role AcrPull --scope $ACR_ID
```

## 7) Variables y configuración (Nginx / API)

- Nuestra imagen frontend usa `nginx.conf.template` y `docker-entrypoint.sh` para inyectar en runtime la variable `API_UPSTREAM` que controla a dónde proxear `/api`.
- Si necesitas cambiar la URL de la API sin rebuild, configura `API_UPSTREAM` en los Application Settings del App Service.
- Las variables que empiezan con `VITE_` son sólo visibles en tiempo de build por Vite (p.ej. `VITE_API_URL`).

## 8) Dev vs Prod

- En desarrollo usamos volúmenes (`./web:/usr/src/app`) para hot-reload. Esto sobrescribe el contenido de la imagen en el contenedor.
- Para producir la imagen final y desplegar, usa `docker build` para incluir la versión compilada (`npm run build`) dentro de la imagen.

## 9) Errores comunes y diagnóstico

- 404 en `/slots/<name>`: el slot no existe. Comprueba:

```powershell
az webapp deployment slot list --name <APP_NAME> --resource-group <RG_NAME> -o table
```

- Image pull failed / Unauthorized: comprobar credenciales o usar Managed Identity + AcrPull.
- Container crashes: revisar logs con:

```powershell
az webapp log config --name <APP_NAME> --resource-group <RG_NAME> --docker-container-logging filesystem
az webapp log tail --name <APP_NAME> --resource-group <RG_NAME>
```

- Cambios no aparecen en el despliegue: reconstruye con `docker build` y vuelve a pushear la imagen.

## 10) Usar docker-compose en producción (opcional)

Crear `docker-compose.prod.yml` que use `image:` en lugar de `build:` y ejecutar en servidor:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

Si queréis, puedo añadir ejemplos concretos para App Service o AKS y un script `deploy.sh` para automatizar build+tag+push+deploy.
