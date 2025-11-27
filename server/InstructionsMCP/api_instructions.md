# Flashcard Learning Platform API - Documentation Index

This is the complete documentation for the REST API of the flashcard learning platform. The API provides functionality for user management, decks, flashcards, Anki synchronization, and tag organization.

---

## 📚 Documentation Structure

### 📚 **Decks**
For detailed decks module documentation, see: **[api_decks.md](api_decks.md)**

**Features:**
- Complete deck CRUD
- AI-powered deck generation
- AI topic suggestions
- AI-generated cover management

### 🎯 **Flashcards**
For complete flashcards module documentation, see: **[api_flashcards.md](api_flashcards.md)**

**Features:**
- Complete flashcard CRUD
- Advanced search and filtering
- Bulk AI generation
- Difficulty system and reviews
- Tag association

### 🔄 **Anki Sync**
Anki synchronization endpoints for importing/exporting flashcards.

**Endpoints:**
- `GET /api/sync/anki/status` - Check Anki connection
- `POST /api/sync/anki/sync` - Sync all flashcards
- `POST /api/sync/anki/sync/:deckId` - Sync deck flashcards
- `POST /api/sync/anki/import` - Import from Anki
- `POST /api/sync/anki/export` - Export to Anki
- `GET /api/sync/stats` - Study statistics

### 🏷️ **Tags**
For tag system documentation, see: **[api_tags.md](api_tags.md)**

**Features:**
- Deck-specific tags
- Flashcard tag association
- Complete tag CRUD by deck

### 📊 **Monitoring & Logging**
Database monitoring and logging endpoints.

**Endpoints:**
- `GET /api/logging/stats` - Database query statistics
- `POST /api/logging/reset-stats` - Reset statistics
- `POST /api/logging/log-stats` - Force statistics logging
- `GET /api/logging/health` - Logging service health check

### 📋 **Data Models**
For complete entity and model documentation, see: **[api_domain.md](api_domain.md)**

**Main Entities:**
- **User**: System users
- **Deck**: Flashcard collections
- **Flashcard**: Individual study cards
- **Tag**: Organization labels
- DTOs and validation schemas

---

## 🎯 Quick Guide to Endpoints - GET Operations

### **Get data from database**

| Resource | Endpoint | Description |
|----------|----------|-------------|
| **User decks** | `GET /api/decks` | Lists all authenticated user's decks |
| **User decks (MCP)** | `GET /api/decks/mcp` | Lists all decks without cover images (optimized for MCP) |
| **All flashcards count** | `GET /api/decks/flashcards-count` | Gets flashcards count for all user decks |
| **All untagged flashcards** | `GET /api/decks/untagged-flashcards-count` | Gets untagged flashcards count across all user decks |
| **Deck tag count** | `GET /api/decks/:deckId/tag-count` | Gets tag count for a specific deck |
| **Deck flashcards by tag** | `GET /api/decks/:deckId/flashcards-by-tag` | Gets flashcards count by tag for a specific deck |
| **Deck untagged flashcards** | `GET /api/decks/:deckId/untagged-flashcards-count` | Gets untagged flashcards count for a specific deck |
| **Specific deck** | `GET /api/decks/:id` | Gets deck by ID with ownership verification |
| **Deck flashcards** | `GET /api/flashcards/deck/:deckId` | Lists all deck flashcards (no pagination by default, returns all available cards) |
| **Specific flashcard** | `GET /api/flashcards/:id` | Gets flashcard by ID |
| **All flashcards** | `GET /api/flashcards` | Lists all flashcards (debug/admin) |
| **Deck tags** | `GET /api/decks/:deckId/tags` | Lists all tags for a specific deck |
| **Specific tag** | `GET /api/decks/:deckId/tags/:tagId` | Gets specific tag within a deck |
| **Health check** | `GET /api/health` | Verifies service status |
| **Detailed health** | `GET /api/health/detailed` | Detailed system information |
| **Logging stats** | `GET /api/logging/stats` | Database statistics |
| **Anki status** | `GET /api/sync/anki/status` | Check Anki connection |
| **Sync stats** | `GET /api/sync/stats` | Study synchronization stats |

### **Search and filtering**

| Endpoint | Description |
|----------|-------------|
| `GET /api/flashcards/deck/:deckId/search?q=term` | Searches flashcards in deck by content |
| `GET /api/flashcards/search?q=term&deckId=1` | Global flashcard search with optional filters |

---

## 📖 How to Use This Documentation

### **Navigation Guide for MCP Tools**

1. **Start here** (`api_instructions.md`) for:
   - Understanding overall API structure
   - Authentication setup and token management
   - Basic endpoint discovery and common patterns
   - Response format standards

2. **Use Quick Guide** for simple operations:
   - Basic CRUD operations (GET, POST, PUT, DELETE)
   - Common search and filtering
   - Health checks and monitoring

3. **Navigate to specific module files** when you need:
   - **Detailed endpoint specifications** with all parameters
   - **Complex request/response examples**
   - **Specific validation rules** and error codes
   - **Advanced features** (AI generation, bulk operations, etc.)

4. **Decision Tree for File Navigation:**

```
Need basic info? → Stay in api_instructions.md
Need specific endpoint details? → Go to module file
Need authentication? → Use info in api_instructions.md
Need complex operations? → Check module-specific file
Need data models? → Check api_domain.md
```

### **When to Read Module-Specific Files**

| Operation Type | Use Index | Use Module File |
|----------------|-----------|-----------------|
| **Basic CRUD** | ✅ Quick Guide | ❌ Not needed |
| **Authentication** | ✅ Complete guide | ❌ Not needed |
| **Simple searches** | ✅ Examples provided | ❌ Not needed |
| **AI features** | ⚠️ Basic info | ✅ Detailed specs |
| **Bulk operations** | ❌ Limited info | ✅ Full documentation |
| **Complex validation** | ❌ Basic only | ✅ Complete rules |
| **Error handling** | ✅ Common errors | ✅ Module-specific |

### 📋 **Conventions**

- **HTTP Methods**: `GET`, `POST`, `PUT`, `DELETE`
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Error)
- **Authentication**: JWT Bearer tokens in `Authorization` header
- **Formats**: JSON for requests/responses
- **Validation**: Joi schemas for input validation

---

## 🚀 Quick Start - GET Operations

### **Common GET operation examples**

```bash
# Health check (no authentication)
curl -X GET http://localhost:3000/api/health

# Search flashcards in deck (no authentication)
curl -X GET "http://localhost:3000/api/flashcards/deck/1/search?q=spanish"
```

---

## 📊 GET Response Structure

All GET responses follow the consistent format:

```json
{
  "success": true,
  "message": "Operation description",
  "data": [
    // Array of entities or single object
  ],
  "count": 10, // Optional: total number of items
  "total": 25, // Optional: total without pagination
  "page": 0,   // Optional: current page
  "pageSize": 15 // Optional: items per page
}
```

### **Response examples**

**Deck list:**
```json
{
  "success": true,
  "message": "Decks retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Spanish Vocabulary",
      "description": "Basic words",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Tag list:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "grammar",
      "deckId": 1,
      "flashcardCount": 5
    }
  ],
  "total": 2,
  "message": "Tags retrieved successfully"
}
```

## 🔐 Authentication & Error Handling

### User Registration & Login

**Register new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "password": "secure-password"
  }'
```

**Login to get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'
```

**Response includes JWT token:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "your-username",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using JWT Tokens

**Header format:** `Authorization: Bearer <jwt-token>`

```bash
# Example with token
curl -X GET http://localhost:3000/api/decks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Common Authentication Errors

**Missing Token:**
```json
{
  "success": false,
  "message": "Token no proporcionado",
  "statusCode": 401
}
```

**Invalid/Expired Token:**
```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "statusCode": 401
}
```

### Access Control Errors

**Unauthorized Deck Access:**
```json
{
  "success": false,
  "error": "Access denied. Deck does not belong to user."
}
```

### How MCP Tools Should Handle Authentication

1. **Store token in environment variable:** `FLASHCARD_API_TOKEN`
2. **Check token availability before API calls**
3. **Handle authentication errors gracefully**
4. **Provide clear error messages to users**

**Example MCP implementation:**
```javascript
// Check for token in environment
const token = process.env.FLASHCARD_API_TOKEN;

if (!token) {
  console.error("❌ FLASHCARD_API_TOKEN not found in environment.");
  console.error("Please login first:");
  console.error("curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"username\": \"your-username\", \"password\": \"your-password\"}'");
  process.exit(1);
}

// Use token in all API calls
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

*Last updated: November 2025*

---

## 🤖 AI Assistant Instructions

### Comportamiento del Asistente

Cuando interactúes con el usuario a través de este servidor MCP:

1. **SIEMPRE termina tus respuestas con un emoji relevante** 📚
2. Sé conciso pero completo en tus explicaciones
3. Cuando listes decks o flashcards, muestra información útil y organizada
4. Si hay errores, explica qué pasó y sugiere soluciones
5. Ayuda proactivamente a organizar el contenido con tags

### Formato de Respuestas

Estructura tus respuestas así:
1. Confirma la acción realizada
2. Muestra resultados relevantes
3. Sugiere próximos pasos si aplica
4. **Termina con un emoji apropiado**

### Ejemplo de Respuesta Correcta

```
✅ He encontrado 13 mazos en tu colección:

📚 Más completos:
- Inteligencia Artificial (65 flashcards)
- Sistemas Operativos (49 flashcards)
- Inglés (31 flashcards)

¿Te gustaría revisar el contenido de alguno? 🎯
```

### Tonos a Usar

- 📚 Para aprendizaje general
- 🎯 Para objetivos o siguiente paso
- ✅ Para confirmaciones exitosas
- 🎴 Para temas de flashcards/mazos
- 🚀 Para acciones nuevas o motivación
- 💡 Para sugerencias o ideas
