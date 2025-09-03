# Reglas de Branching

## Ramas Principales

- `main`: Rama principal que contiene el código en producción
- `develop`: Rama de desarrollo principal

## Ramas de Características

### Patrones de Nombrado

- `feature/*`: Para nuevas características
  - Ejemplo: `feature/auth-system`
  - Ejemplo: `feature/flashcard-generator`

- `bugfix/*`: Para corrección de bugs
  - Ejemplo: `bugfix/login-validation`
  - Ejemplo: `bugfix/card-display`

- `hotfix/*`: Para correcciones urgentes en producción
  - Ejemplo: `hotfix/security-patch`
  - Ejemplo: `hotfix/critical-error`

### Flujo de Trabajo

1. Crear rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-caracteristica
   ```

2. Realizar cambios y commits:
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

3. Publicar rama:
   ```bash
   git push -u origin feature/nombre-caracteristica
   ```

4. Crear Pull Request a `develop`

5. Después de la revisión y aprobación, hacer merge a `develop`

### Convenciones de Commits

Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Reglas de Protección

- Las ramas `main` y `develop` están protegidas
- Se requiere revisión de código para hacer merge
- Los tests deben pasar antes del merge
- El nombre de la rama debe seguir los patrones establecidos
