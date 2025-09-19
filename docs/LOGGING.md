# Sistema de Logging - Documentación

## 📋 Resumen

Se ha implementado un sistema completo de logging para el backend que incluye:

- ✅ **Logging de HTTP Requests/Responses** - Middleware detallado
- ✅ **Logging de Queries de Base de Datos** - Prisma con estadísticas
- ✅ **Configuración Centralizada** - Variables de entorno
- ✅ **Endpoints de Monitoreo** - Estadísticas en tiempo real
- ✅ **Logging de Errores** - Stack traces y contexto
- ✅ **Logging Periódico** - Estadísticas automáticas

## 🚀 Características

### 1. Logging HTTP (Request/Response)
```bash
[REQUEST] GET /api/decks
  → IP: 127.0.0.1
  → User-Agent: Mozilla/5.0...
  → Content-Length: 0 bytes
  → Timestamp: 2025-09-19T22:30:15.123Z

[RESPONSE] 200 /api/decks
  ← Response-Time: 45ms
  ← Content-Length: 1024 bytes
  ← Timestamp: 2025-09-19T22:30:15.168Z
```

### 2. Logging de Base de Datos
```bash
[DB QUERY] #42 - 15ms
  SQL: SELECT * FROM "Deck" WHERE "userId" = $1
  Params: [123]
```

### 3. Logging de API Responses
```bash
[API RESPONSE] ✅ 45ms
  Message: Decks obtenidos exitosamente
  Data: Array with 5 items
```

### 4. Estadísticas de Queries Lentas
```bash
[SLOW QUERY] 250ms - SELECT * FROM "Flashcard" WHERE...
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Nivel general de logging
LOG_LEVEL=info  # error, warn, info, debug

# Logging HTTP
HTTP_LOGGING_ENABLED=true
LOG_REQUEST_BODY=false
LOG_RESPONSE_BODY=false
MAX_BODY_LOG_LENGTH=1000

# Logging de Base de Datos
DB_LOGGING_ENABLED=true
DB_LOG_QUERIES=true
DB_LOG_SLOW_QUERIES=true
DB_SLOW_QUERY_THRESHOLD=100  # ms
DB_MAX_LOGGED_QUERIES=1000

# Logging de Errores
ERROR_LOGGING_ENABLED=true
LOG_STACK_TRACE=true
LOG_ERROR_REQUEST_INFO=true

# Configuración de Colores
LOG_COLORS_ENABLED=true

# Logging Estructurado (JSON)
STRUCTURED_LOGGING=false

# Logging a Archivos (futuro)
LOG_TO_FILES=false
LOG_DIRECTORY=./logs
LOG_MAX_FILE_SIZE=10mb
LOG_MAX_FILES=7d
LOG_COMPRESS=true

# Logging Periódico
LOGGING_STATS_INTERVAL=300000  # 5 minutos en ms

# Métricas y Monitoreo
LOG_METRICS=true
COLLECT_SYSTEM_METRICS=true
COLLECT_QUERY_METRICS=true
```

## 📊 Endpoints de Monitoreo

### Health Check Básico
```bash
GET /api/health
```
```json
{
  "ok": true
}
```

### Health Check Detallado
```bash
GET /api/health/detailed
```
```json
{
  "success": true,
  "message": "Health check detallado",
  "data": {
    "server": {
      "uptime": "125s",
      "memory": {
        "rss": "45MB",
        "heapUsed": "32MB",
        "heapTotal": "48MB"
      },
      "nodeVersion": "v18.20.8",
      "environment": "development"
    },
    "database": {
      "totalQueries": 42,
      "slowQueries": 2,
      "status": "connected"
    },
    "logging": {
      "enabled": true,
      "level": "detailed",
      "features": ["http_requests", "db_queries", "errors", "api_responses"]
    }
  }
}
```

### Estadísticas de Queries
```bash
GET /api/logging/stats
```
```json
{
  "success": true,
  "message": "Estadísticas de queries obtenidas exitosamente",
  "data": {
    "totalQueries": 156,
    "slowQueriesCount": 3,
    "recentSlowQueries": [
      {
        "query": "SELECT * FROM \"Flashcard\" WHERE \"deckId\" = $1 AND \"front\" ILIKE $2",
        "duration": 250,
        "timestamp": "2025-09-19T22:35:15.123Z"
      }
    ],
    "timestamp": "2025-09-19T22:40:15.456Z"
  }
}
```

### Resetear Estadísticas
```bash
POST /api/logging/reset-stats
```

### Forzar Logging de Estadísticas
```bash
POST /api/logging/log-stats
```

### Health Check de Logging
```bash
GET /api/logging/health
```

## 🏗️ Arquitectura

### Estructura de Archivos
```
server/src/
├── config/
│   ├── database.js          # Configuración Prisma + logging
│   └── logging.config.js    # Configuración centralizada
├── middlewares/
│   └── logging.middleware.js # Middlewares HTTP
├── routes/
│   └── logging.routes.js    # Endpoints de monitoreo
└── index.js                 # Integración de middlewares
```

### Flujo de Logging

1. **HTTP Request** → `requestLogger` middleware
2. **API Processing** → `apiLogger` middleware
3. **Database Query** → Prisma event listeners
4. **Response** → Logging automático en `requestLogger`
5. **Errors** → `errorLogger` middleware
6. **Periodic Stats** → Interval automático cada 5 minutos

## 🎨 Niveles de Logging

| Nivel | Descripción | Ejemplo |
|-------|-------------|---------|
| `error` | Errores críticos | Conexiones fallidas, excepciones |
| `warn` | Advertencias | Queries lentas, configuración inválida |
| `info` | Información general | Requests, responses, estadísticas |
| `debug` | Debug detallado | Bodies completos, parámetros internos |

## 🚦 Estados y Códigos de Color

### HTTP Status Codes
- 🟢 **200-299**: Verde (éxito)
- 🟡 **300-399**: Amarillo (redirección)
- 🔴 **400-499**: Rojo (error cliente)
- 🔴 **500+**: Rojo (error servidor)

### Database Operations
- 🔵 **Query normal**: Azul
- 🟡 **Query lenta**: Amarillo
- 🔴 **Error de DB**: Rojo

## 📈 Monitoreo y Alertas

### Métricas Disponibles
- **Total de queries** ejecutadas
- **Número de queries lentas** (>100ms)
- **Tiempo de respuesta** promedio
- **Uso de memoria** del servidor
- **Tiempo de uptime**

### Alertas Recomendadas
```javascript
// Ejemplo de alertas que podrías implementar
if (slowQueriesCount > 10) {
  // Alertar: Muchas queries lentas
}

if (averageResponseTime > 500) {
  // Alertar: Respuestas muy lentas
}

if (memoryUsage > 80) {
  // Alertar: Alto uso de memoria
}
```

## 🔧 Uso en Desarrollo

### Ver todos los logs
```bash
npm run dev  # Los logs aparecerán en consola
```

### Solo logs de error
```bash
LOG_LEVEL=error npm run dev
```

### Logs estructurados (JSON)
```bash
STRUCTURED_LOGGING=true npm run dev
```

### Deshabilitar colores
```bash
LOG_COLORS_ENABLED=false npm run dev
```

## 🔒 Seguridad

### Información Sensible
- **Passwords**: Nunca se loggean
- **Tokens JWT**: Se muestra como `[PRESENT]`
- **Datos sensibles**: Se truncan o enmascaran

### Configuración en Producción
```bash
# Variables recomendadas para producción
LOG_LEVEL=warn
HTTP_LOGGING_ENABLED=true
DB_LOG_QUERIES=false  # Deshabilitar para mejor performance
LOG_TO_FILES=true
STRUCTURED_LOGGING=true
```

## 🚀 Próximas Mejoras

### Funcionalidades Futuras
- [ ] **Logging a archivos rotativo**
- [ ] **Integración con servicios de monitoring** (DataDog, New Relic)
- [ ] **Métricas de performance detalladas**
- [ ] **Alertas automáticas por email/Slack**
- [ ] **Dashboard de visualización de logs**
- [ ] **Tracing distribuido**

### Optimizaciones
- [ ] **Compresión de logs**
- [ ] **Buffering para alto throughput**
- [ ] **Filtros avanzados**
- [ ] **Exportación de logs**

---

**📝 Nota**: Este sistema de logging está diseñado para ser extensible y configurable. Todas las configuraciones se pueden ajustar mediante variables de entorno sin modificar el código.
