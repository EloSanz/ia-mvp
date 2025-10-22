# CI/CD Pipeline

Este documento describe la configuración de integración continua y despliegue continuo del proyecto.

## GitHub Actions Workflow

El proyecto utiliza GitHub Actions para ejecutar tests automatizados y verificaciones de calidad de código.

### Workflows Disponibles

#### 1. CI Pipeline (`ci.yml`)
Se ejecuta automáticamente en:
- Push a las ramas `main` y `develop`
- Pull requests hacia `main` y `develop`

**Jobs incluidos:**
- **Backend Tests**: Ejecuta tests unitarios, linting y coverage del backend
- **Frontend Tests**: Verifica que el frontend se construya correctamente
- **Integration Tests**: Tests de integración con base de datos PostgreSQL
- **Code Quality**: Verificaciones de linting y formato

### Configuración de Branch Protection

Para requerir que los tests pasen antes de hacer merge:

1. Ve a **Settings** > **Branches** en tu repositorio de GitHub
2. Haz clic en **Add rule**
3. Configura:
   - **Branch name pattern**: `main` (o `develop`)
   - **Require status checks to pass before merging**: ✅
   - **Status checks found in the last week for this repository**:
     - Selecciona todos los checks que aparezcan:
       - `backend-tests`
       - `frontend-tests`
       - `integration-tests`
       - `quality-checks`

### Comandos Locales

Antes de hacer push, puedes ejecutar los mismos checks localmente:

```bash
# Backend
cd server
npm run lint
npm test

# Frontend
cd web
npm run build

# Formato
cd server
npm run format
```

### Variables de Entorno para CI

Las siguientes variables están configuradas en el workflow de CI:

- `NODE_ENV=test`
- `DATABASE_URL`: Conexión a PostgreSQL de test
- `JWT_SECRET`: Clave JWT para tests
- `OPENAI_API_KEY`: Clave de API (placeholder para tests)

### Coverage Reports

Los reports de cobertura se suben automáticamente a Codecov para el backend.

## Troubleshooting

### Tests fallan en CI pero pasan localmente
- Verifica que no tengas variables de entorno locales que afecten los tests
- Asegúrate de que los tests no dependan de datos específicos de tu BD local

### Build falla por dependencias
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que no haya `package-lock.json` desincronizado

### Integration tests fallan
- Los tests de integración requieren una base de datos PostgreSQL
- Verifica que las migraciones de Prisma estén actualizadas
