# 🧪 iCards API - Tests Integrales

Suite completa de tests integrales para la API de iCards que prueba todas las funcionalidades con requests HTTP reales.

## 🚀 Requisitos Previos

1. **API corriendo**: Asegúrate de que el servidor esté ejecutándose en `http://localhost:3000`
2. **Dependencias**: `curl` y `jq` deben estar instalados
3. **Base de datos**: Debe estar disponible y limpia

## 📋 Tests Incluidos

### 🔐 **Autenticación**
- Registro de usuario con UUID único
- Login y obtención de token JWT

### 📚 **Decks (Mazos)**
- ✅ GET `/api/decks` - Listar decks del usuario
- ✅ GET `/api/decks/mcp` - Listar decks sin coverUrl (MCP)
- ✅ GET `/api/decks/:id` - Obtener deck específico
- ✅ POST `/api/decks` - Crear nuevo deck
- ✅ PUT `/api/decks/:id` - Actualizar deck
- ✅ DELETE `/api/decks/:id` - Eliminar deck
- ✅ GET `/api/decks/flashcards-count` - Conteo total de flashcards
- ✅ GET `/api/decks/untagged-flashcards-count` - Conteo de flashcards sin tag
- ✅ GET `/api/decks/:id/tag-count` - Conteo de tags por deck
- ✅ GET `/api/decks/:id/flashcards-by-tag` - Flashcards agrupadas por tag
- ✅ GET `/api/decks/:id/untagged-flashcards-count` - Flashcards sin tag por deck
- ✅ POST `/api/decks/suggest-topics` - Sugerir temas con IA
- ✅ POST `/api/decks/generate-with-ai` - Generar deck completo con IA

### 🏷️ **Tags (Etiquetas)**
- ✅ GET `/api/decks/:deckId/tags` - Listar tags de un deck
- ✅ GET `/api/decks/:deckId/tags/:tagId` - Obtener tag específico
- ✅ POST `/api/decks/:deckId/tags` - Crear nuevo tag
- ✅ PUT `/api/decks/:deckId/tags/:tagId` - Actualizar tag
- ✅ DELETE `/api/decks/:deckId/tags/:tagId` - Eliminar tag

### 🎯 **Flashcards**
- ✅ GET `/api/flashcards` - Listar todas las flashcards del usuario
- ✅ GET `/api/flashcards/:id` - Obtener flashcard específica
- ✅ GET `/api/flashcards/deck/:deckId` - Listar flashcards de un deck
- ✅ GET `/api/flashcards/deck/:deckId?all=true` - Listar todas sin paginación
- ✅ GET `/api/flashcards/deck/:deckId?pageSize=N` - Paginación personalizada
- ✅ POST `/api/flashcards` - Crear flashcard (difficulty opcional)
- ✅ PUT `/api/flashcards/:id` - Actualizar flashcard
- ✅ PUT `/api/flashcards/:id/review` - Marcar como revisada
- ✅ DELETE `/api/flashcards/:id` - Eliminar flashcard
- ✅ GET `/api/flashcards/deck/:deckId/search?q=term` - Búsqueda en deck
- ✅ GET `/api/flashcards/search?q=term` - Búsqueda global
- ✅ POST `/api/flashcards/batch` - Crear múltiples flashcards
- ✅ POST `/api/flashcards/ai-generate` - Generar flashcards con IA

### 🏥 **Health & Monitoring**
- ✅ GET `/api/health` - Health check básico
- ✅ GET `/api/health/detailed` - Health check detallado
- ✅ GET `/api/logging/stats` - Estadísticas de logging
- ✅ GET `/api/logging/health` - Health del servicio de logging

## 🏃‍♂️ **Ejecución**

### Opción 1: Script directo
```bash
cd server
./test-integration.sh
```

### Opción 2: Ver logs en tiempo real
```bash
# Terminal 1 - Servidor con logs
cd server
npm run dev

# Terminal 2 - Tests
cd server
./test-integration.sh
```

### Opción 3: Con variables de entorno
```bash
cd server
API_BASE=http://localhost:3000 ./test-integration.sh
```

## 📊 **Resultado Esperado**

```
🚀 INICIANDO TESTS INTEGRALES DE iCARDS API
==============================================
Usuario de prueba: test-user-xxxx-xxxx-xxxx
Contraseña: test123

📝 PASO 1: Crear usuario de prueba
✅ Usuario registrado exitosamente

🔐 PASO 2: Login y obtener token
✅ Login exitoso
   Token obtenido: eyJhbGciOiJIUzI1NiIs...

📚 PASO 3: TESTS DE DECKS
   3.1 GET /api/decks (debe estar vacío inicialmente)
✅ GET decks inicial
   3.2 POST /api/decks (crear primer deck)
✅ Deck creado
   3.3 POST /api/decks (crear segundo deck)
✅ Segundo deck creado
   3.4 GET /api/decks (debe tener 2 decks)
✅ GET decks con 2 decks
   ...

🎉 TESTS INTEGRALES COMPLETADOS
==================================
Usuario de prueba creado: test-user-xxxx-xxxx-xxxx
Token generado y usado correctamente
✅ Todas las operaciones CRUD probadas
✅ Todos los endpoints GET verificados
✅ Funcionalidades de IA probadas
✅ Endpoints de health/monitoring probados
✅ Limpieza completa realizada

📊 RESUMEN DE OPERACIONES:
   - 1 usuario registrado
   - 3 decks creados (2 manuales + 1 con IA)
   - 1 tag creado
   - 4 flashcards creadas (2 individuales + 2 batch + 3 con IA)
   - Múltiples operaciones GET, PUT, DELETE
   - Limpieza completa de datos de prueba
```

## 🔧 **Características del Test Suite**

### **Usuario Único por Ejecución**
- Cada ejecución crea un usuario con UUID único
- Evita conflictos entre múltiples ejecuciones
- Limpieza automática de datos de prueba

### **Validación Automática**
- Verifica respuestas HTTP exitosas
- Valida estructura de datos JSON
- Confirma conteos y estados esperados

### **Cobertura Completa**
- **43+ endpoints** probados
- **8 módulos** completamente testeados
- **CRUD operations** para todas las entidades
- **Funcionalidades avanzadas** (IA, búsqueda, paginación)

### **Logging Detallado**
- Muestra progreso paso a paso
- Indica qué endpoint se está probando
- Reporta errores específicos con contexto

## 🐛 **Solución de Problemas**

### Error: "Connection refused"
```bash
# Asegúrate de que el servidor esté corriendo
cd server && npm run dev
```

### Error: "jq: command not found"
```bash
# Instala jq
brew install jq  # macOS
sudo apt install jq  # Ubuntu/Debian
```

### Tests lentos
- Los tests de IA pueden tomar tiempo
- Algunos endpoints tienen delays internos
- Considera aumentar timeouts si es necesario

### Error en validación Joi
- Revisa que los datos enviados sean correctos
- Verifica que `difficulty` sea 1-3 cuando se envía
- Confirma que `deckId` sea un número válido

## 📈 **Métricas de Cobertura**

- **Endpoints probados**: 43+
- **Módulos testeados**: 8 (Auth, Decks, Flashcards, Tags, AI, Health, Monitoring, Search)
- **Operaciones CRUD**: 100% coverage
- **Casos edge**: Paginación, búsqueda, validaciones, errores
- **Limpieza**: 100% (todos los datos de prueba se eliminan)

---

*Última actualización: Noviembre 2025*
