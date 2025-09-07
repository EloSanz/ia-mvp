# Git Flow

Este proyecto sigue una versión simplificada de Git Flow.

## Ramas Principales

- `main`: Código en producción
- `develop`: Rama principal de desarrollo

## Ramas de Características

### Tipos de Ramas

- `feature/*`: Nuevas características
  - Ejemplo: `feature/auth-system`
  - Ejemplo: `feature/card-generator`

- `bugfix/*`: Corrección de bugs
  - Ejemplo: `bugfix/login-error`
  - Ejemplo: `bugfix/card-display`

- `hotfix/*`: Correcciones urgentes en producción
  - Ejemplo: `hotfix/critical-error`

## Flujo de Trabajo

### 1. Desarrollo de Nuevas Características

```bash
# Crear rama feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/mi-caracteristica

# Trabajar y commitear cambios
git add .
git commit -m "feat: descripción del cambio"

# Publicar rama
git push -u origin feature/mi-caracteristica

# Crear Pull Request a develop
```

### 2. Corrección de Bugs

```bash
# Crear rama bugfix desde develop
git checkout develop
git checkout -b bugfix/descripcion-bug

# Corregir y commitear
git add .
git commit -m "fix: descripción de la corrección"

# Publicar y crear PR
git push -u origin bugfix/descripcion-bug
```

### 3. Hotfixes

```bash
# Crear rama hotfix desde main
git checkout main
git checkout -b hotfix/error-critico

# Corregir y commitear
git add .
git commit -m "fix: corrección urgente"

# Publicar y crear PR a main
git push -u origin hotfix/error-critico
```

## Convenciones de Commits

Usamos una versión simplificada de Conventional Commits:

- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato
- `refactor`: Refactorización de código
- `test`: Cambios en tests
- `chore`: Tareas de mantenimiento

Ejemplo:
```bash
git commit -m "feat: agregar generación de flashcards con IA"
git commit -m "fix: corregir error en la visualización de cards"
```