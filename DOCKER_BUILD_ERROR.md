-   **Mejores Prácticas:** La configuración actual sigue las mejores prácticas para proyectos monorepo con Docker, asegurando un comportamiento consistente en todos los sistemas operativos.

---

## Nota Importante sobre CI/CD (Entornos de Integración Continua)

Las soluciones descritas en este documento están enfocadas en el **entorno de desarrollo local** que utiliza `docker-compose`.

Nuestro pipeline de CI/CD (definido en `.github/workflows/ci.yml`) utiliza comandos `docker build` directos que podrían tener su propio contexto de compilación. Es crucial tener en cuenta que los cambios realizados en los `Dockerfile` (como cambiar las rutas `COPY`) deben ser compatibles con la forma en que el pipeline construye las imágenes.

**Advertencia:** Si el pipeline de CI/CD no se actualiza para usar el contexto raíz (`.`) al igual que nuestra configuración local, **la compilación en el pipeline fallará**. Este tema se deberá abordar al revisar y optimizar el archivo `ci.yml`.

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