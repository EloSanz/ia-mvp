# 📋 User Stories - Flashcards App

## 🔧 US-001: Fix Paginación en Búsqueda de Flashcards

### 📖 Descripción
**Como** usuario de la aplicación de flashcards,
**Quiero** que la paginación funcione correctamente cuando busco flashcards,
**Para** poder navegar eficientemente por los resultados de búsqueda sin perder el contexto.

### 🎯 Criterios de Aceptación
- ✅ Al buscar flashcards, se muestran los resultados paginados correctamente
- ✅ Al cambiar de página durante una búsqueda, se mantiene el término de búsqueda
- ✅ El contador de resultados refleja correctamente el total de elementos encontrados
- ✅ La navegación entre páginas es fluida y no requiere recargar la búsqueda

### 📊 Story Points
**3** puntos

### 🏷️ Labels
`bug`, `frontend`, `search`, `pagination`

### 📋 Estado
✅ **Completado**

### 🔍 Detalles Técnicos Implementados

1. ✅ **Función `handlePageChange`** que mantiene el contexto de búsqueda
2. ✅ **Debounced search** con timeout de 300ms
3. ✅ **Limpieza automática** de timeout en component unmount
4. ✅ **Estados de búsqueda** (`searching`, `searchQuery`, `searchResults`, `searchTotal`)
5. ✅ **Integración con FlashcardTable** y CardRow components

### 🧪 Testing Realizado
- ✅ Búsqueda básica funciona
- ✅ Paginación durante búsqueda funciona
- ✅ Limpieza de búsqueda funciona
- ✅ Estados de carga se muestran correctamente

### 📅 Información del Desarrollo
- **Fecha de Implementación**: 20/09/2025
- **Branch**: `feature/search-component`
- **Commit**: `feat: implement search component for flashcards`
- **Arquitectura**: React + Material-UI + API REST

### 🔗 Archivos Modificados
- `web/src/pages/DeckPage.jsx` - Lógica principal de búsqueda
- `web/src/components/FlashcardTable.jsx` - Integración en tabla
- `web/src/components/CardRow.jsx` - Alineación de columnas
- `web/src/components/SearchBar.jsx` - Componente reutilizable
- `server/src/controllers/flashcard.controller.js` - Backend API
- `server/src/models/flashcard.js` - Modelo de búsqueda
- `server/src/repositories/flashcard.repository.js` - Queries de BD

---

## 📝 Template para Nuevas User Stories

### Título: [Funcionalidad]

### 📖 Descripción
**Como** [tipo de usuario],
**Quiero** [funcionalidad],
**Para** [beneficio].

### 🎯 Criterios de Aceptación
- ✅ [Criterio 1]
- ✅ [Criterio 2]
- ✅ [Criterio 3]

### 📊 Story Points
**[1-8]** puntos

### 🏷️ Labels
`feature`, `bug`, `enhancement`, `frontend`, `backend`, `database`

### 📋 Estado
🔄 **Pendiente** | 🚧 **En Progreso** | ✅ **Completado** | ❌ **Cancelado**

### 🔍 Detalles Técnicos
[Implementación técnica, archivos modificados, etc.]

### 🧪 Testing
[Casos de prueba realizados]

### 📅 Información
- **Fecha**: [DD/MM/YYYY]
- **Desarrollador**: [Nombre]
- **Branch**: [branch-name]
- **Commit**: [commit-hash]
