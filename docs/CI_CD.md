# CI/CD Pipeline

Este documento describe la configuración de integración continua para el backend del proyecto.

## GitHub Actions Workflow

El proyecto utiliza GitHub Actions para ejecutar tests automatizados del backend únicamente.

### Workflow Backend CI (`ci.yml`)
Se ejecuta automáticamente en:
- Push a las ramas `main` y `develop`
- Pull requests hacia `main` y `develop`

**Jobs incluidos:**
- **Backend Tests**: Tests unitarios del backend
- **Integration Tests**: Tests de integración con base de datos PostgreSQL

### Configuración de Branch Protection

Para requerir que los tests pasen antes de hacer merge:

1. Ve a **Settings** > **Branches** en tu repositorio de GitHub
2. Haz clic en **Add rule**
3. Configura:
   - **Branch name pattern**: `main` (o `develop`)
   - **Require status checks to pass before merging**: ✅
   - **Status checks found in the last week for this repository**:
     - Selecciona estos checks:
       - `backend-tests`
       - `integration-tests`

### Comandos Locales

Antes de hacer push, puedes ejecutar los mismos checks localmente:

```bash
# Backend tests
cd server
npm test

# Integration tests (requiere BD local)
cd server
npm run test:integration
```

### Variables de Entorno para CI

Las siguientes variables están configuradas en el workflow de CI:

- `NODE_ENV=test`
- `DATABASE_URL`: Conexión a PostgreSQL de test
- `JWT_SECRET`: Clave JWT para tests
- `OPENAI_API_KEY`: Clave de API (placeholder para tests)

## Troubleshooting

### Tests fallan en CI pero pasan localmente
- Verifica que no tengas variables de entorno locales que afecten los tests
- Asegúrate de que los tests no dependan de datos específicos de tu BD local

### Integration tests fallan
- Los tests de integración requieren una base de datos PostgreSQL
- Verifica que las migraciones de Prisma estén actualizadas

### npm install falla
- Verifica que `package.json` tenga todas las dependencias necesarias
- Asegúrate de que `package-lock.json` esté sincronizado
