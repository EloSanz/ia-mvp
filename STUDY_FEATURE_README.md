# 📚 SISTEMA DE ESTUDIO DE FLASHCARDS

## 🎯 PROPÓSITO

Implementar funcionalidad de estudio similar a Anki con algoritmo de repetición espaciada y cola de prioridad.

## 🏗️ ARQUITECTURA ELEGIDA

### Cola de Prioridad: **Grupos de Prioridad Fijos**
- **Grupo 1**: Cards vencidas (máxima prioridad)
- **Grupo 2**: Cards que vencen hoy
- **Grupo 3**: Cards difíciles con pocos reviews
- **Grupo 4**: Resto de cards

### Sesiones: **En Memoria con TTL**
- Sesiones temporales (30 minutos)
- Estadísticas básicas de sesión
- Límite de 20 cards por sesión

---

## 📋 API ENDPOINTS

### 1. INICIAR SESIÓN DE ESTUDIO
```http
POST /api/study/start
```

**Request Body:**
```json
{
  "userId": 1,
  "deckId": 2,
  "limit": 20
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "study_123456789",
    "totalCards": 15,
    "currentCard": {
      "id": 10,
      "front": "¿Cuál es la capital de Francia?",
      "back": "París",
      "difficulty": 2,
      "reviewCount": 3,
      "lastReviewed": "2024-09-15T10:30:00Z",
      "nextReview": "2024-09-18T10:30:00Z"
    },
    "queueLength": 14,
    "sessionStats": {
      "startedAt": "2024-09-20T15:30:00Z",
      "cardsReviewed": 0,
      "timeSpent": 0
    }
  },
  "message": "Sesión de estudio iniciada"
}
```

**Errores:**
- `400`: Deck no encontrado o sin permisos
- `404`: Usuario o deck no existen

---

### 2. OBTENER SIGUIENTE CARD
```http
GET /api/study/:sessionId/next
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "currentCard": {
      "id": 12,
      "front": "¿Qué es la fotosíntesis?",
      "back": "Proceso por el cual las plantas convierten luz solar en energía química",
      "difficulty": 3,
      "reviewCount": 1,
      "lastReviewed": "2024-09-19T09:15:00Z",
      "nextReview": "2024-09-26T09:15:00Z"
    },
    "queueLength": 13,
    "progress": {
      "current": 2,
      "total": 15,
      "percentage": 13.33
    }
  }
}
```

**Errores:**
- `404`: Sesión no encontrada o expirada
- `400`: Sesión ya finalizada

---

### 3. MARCAR CARD COMO REVISADA
```http
POST /api/study/:sessionId/review
```

**Request Body:**
```json
{
  "cardId": 10,
  "difficulty": 1
}
```

**Parámetros de difficulty:**
- `1`: Fácil (revisar en 3 días)
- `2`: Normal (revisar en 1 día)
- `3`: Difícil (revisar en 6 horas)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cardUpdated": {
      "id": 10,
      "difficulty": 1,
      "reviewCount": 4,
      "lastReviewed": "2024-09-20T15:35:00Z",
      "nextReview": "2024-09-23T15:35:00Z"
    },
    "sessionStats": {
      "cardsReviewed": 1,
      "easyCount": 1,
      "normalCount": 0,
      "hardCount": 0,
      "timeSpent": 120
    }
  },
  "message": "Card marcada como revisada"
}
```

**Errores:**
- `404`: Sesión o card no encontrada
- `400`: Difficulty inválida (debe ser 1-3)

---

### 4. OBTENER ESTADO DE SESIÓN
```http
GET /api/study/:sessionId/status
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "study_123456789",
    "status": "active",
    "totalCards": 15,
    "cardsReviewed": 5,
    "remainingCards": 10,
    "progress": {
      "percentage": 33.33,
      "completed": 5,
      "total": 15
    },
    "sessionStats": {
      "startedAt": "2024-09-20T15:30:00Z",
      "timeSpent": 450,
      "easyCount": 3,
      "normalCount": 1,
      "hardCount": 1,
      "averageResponseTime": 45
    },
    "currentCard": {
      "id": 15,
      "front": "¿Qué es el algoritmo de Dijkstra?",
      "difficulty": 3,
      "reviewCount": 2
    }
  }
}
```

---

### 5. FINALIZAR SESIÓN
```http
POST /api/study/:sessionId/finish
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "study_123456789",
    "finalStats": {
      "totalCards": 15,
      "cardsReviewed": 15,
      "completionRate": 100,
      "timeSpent": 1800,
      "averageResponseTime": 120,
      "difficultyBreakdown": {
        "easy": 8,
        "normal": 5,
        "hard": 2
      }
    },
    "finishedAt": "2024-09-20T16:00:00Z"
  },
  "message": "Sesión de estudio finalizada"
}
```

---

## 🔄 ALGORITMO DE COLA DE PRIORIDAD

### Lógica de Ordenamiento:

```javascript
const getStudyQueue = (cards) => {
  const now = new Date();

  // Grupo 1: Cards vencidas (nextReview <= ahora)
  const overdue = cards.filter(c =>
    !c.nextReview || c.nextReview <= now
  );

  // Grupo 2: Cards que vencen hoy
  const dueToday = cards.filter(c => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return c.nextReview > now && c.nextReview <= tomorrow;
  });

  // Grupo 3: Cards difíciles con pocos reviews
  const difficultNew = cards.filter(c =>
    c.difficulty >= 3 &&
    c.reviewCount < 3 &&
    c.nextReview > now
  );

  // Grupo 4: Resto de cards
  const others = cards.filter(c =>
    !overdue.includes(c) &&
    !dueToday.includes(c) &&
    !difficultNew.includes(c)
  );

  return [...overdue, ...dueToday, ...difficultNew, ...others];
};
```

### Cálculo de Próxima Revisión:

```javascript
const calculateNextReview = (currentDifficulty, userDifficulty) => {
  // Ajustar dificultad basada en respuesta del usuario
  const newDifficulty = Math.min(3, Math.max(1,
    Math.round((currentDifficulty + userDifficulty) / 2)
  ));

  // Intervalos basados en dificultad
  const intervals = {
    1: 3 * 24 * 60 * 60 * 1000,  // 3 días
    2: 1 * 24 * 60 * 60 * 1000,  // 1 día
    3: 6 * 60 * 60 * 1000        // 6 horas
  };

  return new Date(Date.now() + intervals[newDifficulty]);
};
```

---

## 📊 ESTRUCTURA DE SESIONES

### Sesión en Memoria:
```javascript
interface StudySession {
  id: string;
  userId: number;
  deckId: number;
  startedAt: Date;
  expiresAt: Date;  // TTL 30 minutos
  cards: Flashcard[];
  currentIndex: number;
  stats: {
    cardsReviewed: number;
    easyCount: number;
    normalCount: number;
    hardCount: number;
    timeSpent: number;
    startTime: number;
  };
}
```

### Gestión de Sesiones:
- **TTL**: 30 minutos de inactividad
- **Límite**: Máximo 20 cards por sesión
- **Persistencia**: Solo estadísticas finales se guardan en DB

---

## 🔧 IMPLEMENTACIÓN PLANEADA

### Fase 1: Core (Backend)
1. ✅ Crear `StudyQueue` utility
2. ✅ Crear `StudyService` con lógica de negocio
3. ✅ Crear `StudyController` con endpoints
4. ✅ Integrar con rutas existentes
5. ✅ Testing básico

### Fase 2: Frontend Integration
1. Componente de estudio de cards
2. UI para mostrar progreso
3. Estadísticas de sesión
4. Manejo de respuestas de dificultad

### Fase 3: Mejoras Avanzadas
1. Estadísticas persistentes por usuario
2. Análisis de rendimiento
3. Recomendaciones personalizadas
4. Modo de repaso masivo

---

## 🧪 TESTING ESCENARIOS

### Escenario 1: Nueva Sesión
```bash
# Usuario inicia estudio
POST /api/study/start
{"userId": 1, "deckId": 2}

# Esperado: Primera card vencida o nunca revisada
```

### Escenario 2: Revisión de Card Difícil
```bash
# Usuario marca como difícil
POST /api/study/session123/review
{"cardId": 10, "difficulty": 3}

# Esperado: nextReview en 6 horas
```

### Escenario 3: Sesión Completa
```bash
# Obtener estado
GET /api/study/session123/status

# Finalizar
POST /api/study/session123/finish
```

---

## 📈 MÉTRICAS A TRACKER

- **Tasa de finalización**: Sesiones completadas vs iniciadas
- **Tiempo promedio por card**: Eficiencia del estudio
- **Distribución de dificultad**: Qué tan bien responde el usuario
- **Frecuencia de estudio**: Cards revisadas por día
- **Retención**: Cards que requieren revisión frecuente

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar StudyQueue utility**
2. **Crear StudyService con gestión de sesiones**
3. **Desarrollar StudyController**
4. **Agregar rutas y middlewares**
5. **Testing y debugging**
6. **Frontend integration**

¿Listo para comenzar la implementación?
