# Solución de Errores de Compilación de Docker (`invalid file request`)

Este documento explica la causa y la solución del error de compilación recurrente en Docker, especialmente en entornos Windows, que se manifiesta como:

```log
transferring context: 427.11MB
...
target backend: failed to solve: invalid file request server/node_modules/.bin/.acorn-YA9vQ8FM
```

## Resumen del Problema

Al ejecutar `docker-compose up --build`, la compilación fallaba porque Docker intentaba empaquetar y enviar la carpeta `node_modules` local al motor de Docker. Esto causaba dos problemas principales:

1.  **Contexto de Compilación Enorme:** El "contexto" (los archivos necesarios para construir la imagen) era de más de 400MB en lugar de unos pocos KB. Esto ralentizaba enormemente el inicio de la compilación.
2.  **Error de Archivo Inválido:** La carpeta `node_modules` contiene miles de archivos y, en Windows, enlaces simbólicos (`.bin`) que el motor de Docker (que corre en Linux/WSL2) no siempre puede procesar correctamente, resultando en el error `invalid file request`.

## Causa Raíz

La causa era una configuración incorrecta de cómo se definía el contexto de compilación en nuestro `docker-compose.yml` y cómo interactuaba con el archivo `.dockerignore`.

1.  **Contexto Incorrecto:** La configuración original era:

    ```yaml
    # docker-compose.yml (Antiguo)
    services:
      backend:
        build: ./server
    ```

    Esto le decía a Docker que el contexto de compilación para el servicio `backend` era **únicamente la carpeta `./server`**. Por lo tanto, Docker **nunca leía el archivo `.dockerignore` que estaba en la raíz del proyecto**, ignorando por completo las reglas para excluir `node_modules`.

2.  **`.dockerignore` Ignorado:** Como el archivo no se leía, Docker intentaba incluir todo lo que había dentro de `./server`, incluyendo la pesada carpeta `node_modules`.

## La Solución (Paso a Paso)

La solución consistió en reestructurar la configuración para que Docker siempre use la raíz del proyecto como contexto y pueda aplicar correctamente las reglas de `.dockerignore`.

### 1. Centralizar el Contexto de Compilación

Modificamos `docker-compose.yml` para definir explícitamente el `context` en la raíz (`.`) y especificar la ruta al `dockerfile`.

```yaml
# docker-compose.yml (Nuevo)
services:
  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
```

Ahora, Docker usa la raíz del proyecto como contexto y puede encontrar y aplicar nuestro `.dockerignore` principal.

### 2. Actualizar los Dockerfiles

Como el contexto ahora es la raíz del proyecto, tuvimos que ajustar las rutas `COPY` dentro de los `Dockerfile` para que apuntaran a las subcarpetas correctas.

```dockerfile
# server/Dockerfile (Nuevo)
...
# Copia desde la subcarpeta 'server' del contexto
COPY server/package*.json ./
...
COPY server/ .
...
```

### 3. Hacer `.dockerignore` más Explícito

Para evitar cualquier ambigüedad, hicimos las reglas en `.dockerignore` más específicas, usando rutas relativas desde la raíz.

```ignore
# .dockerignore (Nuevo)
...
/node_modules
/server/node_modules
/web/node_modules
...
```

Esto garantiza que Docker ignore las carpetas `node_modules` en la raíz, en `server` y en `web` durante la fase de compilación.

## Beneficios de la Solución

-   **Compilaciones Rápidas:** El contexto de compilación se redujo de ~427MB a ~15KB, haciendo que el `build` inicie casi instantáneamente.
-   **Robustez:** Se eliminaron los errores de `invalid file request` al no procesar más la carpeta `node_modules`.
-   **Mejores Prácticas:** La configuración actual sigue las mejores prácticas para proyectos monorepo con Docker, asegurando un comportamiento consistente en todos los sistemas operativos.

---

## Nota Importante sobre CI/CD (Entornos de Integración Continua)

Las soluciones descritas en este documento están enfocadas en el **entorno de desarrollo local** que utiliza `docker-compose`.

Nuestro pipeline de CI/CD (definido en `.github/workflows/ci.yml`) utiliza comandos `docker build` directos que podrían tener su propio contexto de compilación. Es crucial tener en cuenta que los cambios realizados en los `Dockerfile` (como cambiar las rutas `COPY`) deben ser compatibles con la forma en que el pipeline construye las imágenes.

**Advertencia:** Si el pipeline de CI/CD no se actualiza para usar el contexto raíz (`.`) al igual que nuestra configuración local, **la compilación en el pipeline fallará**. Este tema se deberá abordar al revisar y optimizar el archivo `ci.yml`.

---

# Solución de Problemas de Conexión API (Frontend a Backend)

## Resumen del Problema

Después de desplegar en Azure, la aplicación frontend intentaba conectarse al backend en `http://localhost:3000`, causando un fallo de conexión, a pesar de que las variables de entorno en Azure App Service estaban configuradas con la URL de producción correcta.

```log
// Error típico en la consola del navegador en producción
net::ERR_CONNECTION_REFUSED at http://localhost:3000/api/auth/login
```

## Causa Raíz: Configuración en Tiempo de Construcción vs. Tiempo de Ejecución

El problema se debe a cómo Vite (y otros bundlers de frontend) manejan las variables de entorno:

1.  **Tiempo de Construcción (Build-Time):** Cuando se ejecuta `npm run build` (dentro de `docker build`), Vite busca variables como `import.meta.env.VITE_API_URL`. Encuentra el valor en el archivo `.env` local (`http://localhost:3000`) y lo **incrusta directamente** en los archivos JavaScript estáticos generados.
2.  **Resultado:** La imagen Docker del frontend se crea con la URL `http://localhost:3000` "quemada" en su código. Por lo tanto, ignora cualquier variable de entorno configurada posteriormente en Azure.

## La Solución: Proxy Inverso con Nginx

La solución consiste en desacoplar el frontend del backend, haciendo que la URL de la API sea una configuración de **tiempo de ejecución (run-time)**.

### 1. Usar Rutas Relativas en el Frontend

Se modificó el código del frontend (ej. `ApiContext.jsx`) para que todas las llamadas a la API usen una ruta relativa, sin el dominio.

```javascript
// web/src/contexts/ApiContext.jsx (Nuevo)
const api = axios.create({
  baseURL: '/api', // ¡Esta es la clave!
});
```

Ahora, una llamada a `api.post('/auth/login', ...)` se convierte en una petición a `/api/auth/login` en el mismo dominio donde está alojado el frontend.

### 2. Configurar Nginx como Proxy Inverso

El servidor Nginx dentro del contenedor del frontend se configura para que intercepte todas las peticiones que empiezan con `/api` y las redirija al servidor backend real. Esto se logra con el script `web/docker-entrypoint.sh`, que genera la configuración de Nginx al arrancar el contenedor.

### 3. Configurar la URL del Backend en Tiempo de Ejecución

La URL real del backend se proporciona al contenedor del frontend a través de una variable de entorno:

-   **En `docker-compose.yml` (local):** Se usa el nombre del servicio de Docker.
    ```yaml
    environment:
      - VITE_API_URL=http://backend:3000
    ```
-   **En Azure App Service:** Se configura en los "Application Settings" del servicio web.
    -   `VITE_API_URL` = `https://api-icard.azurewebsites.net`

### 4. Soportar Desarrollo sin Docker (`npm run dev`)

Para que el desarrollo local sin Docker siga funcionando, se añadió una configuración de proxy al archivo `web/vite.config.js`. Esto le dice al servidor de desarrollo de Vite que redirija las peticiones `/api` al backend que corre en `localhost:3000`.

```javascript
// web/vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
},
```

## Beneficios de la Solución

-   **Portabilidad:** La misma imagen Docker del frontend funciona en cualquier entorno (local, staging, producción) sin necesidad de reconstruirla.
-   **Seguridad:** No se exponen URLs internas en el código del frontend.
-   **Flexibilidad:** Permite cambiar la URL del backend fácilmente modificando solo una variable de entorno.