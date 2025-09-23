/**
 * StudyQueue - Utilidad para manejar cola de prioridad de flashcards
 * Implementa algoritmo de repetición espaciada con cola de grupos
 */

export class StudyQueue {
  constructor(cards = []) {
    this.cards = [...cards];
    this.orderedQueue = this.buildPriorityQueue();
    this.currentIndex = 0;
  }

  /**
   * Construye la cola ordenada por prioridad
   */
  buildPriorityQueue() {
    // Ordenar todas las cards por prioridad calculada (mayor a menor)
    return [...this.cards].sort((a, b) => {
      const priorityA = calculateCardPriority(a);
      const priorityB = calculateCardPriority(b);
      return priorityB - priorityA; // Mayor prioridad primero
    });
  }

  /**
   * Obtiene la siguiente card de la cola
   */
  next() {
    if (this.currentIndex >= this.orderedQueue.length) {
      return null; // No hay más cards
    }

    const card = this.orderedQueue[this.currentIndex];
    this.currentIndex++;
    return card;
  }

  /**
   * Obtiene la card actual sin avanzar
   */
  current() {
    if (this.currentIndex >= this.orderedQueue.length) {
      return null;
    }
    return this.orderedQueue[this.currentIndex];
  }

  /**
   * Obtiene la card anterior
   */
  previous() {
    if (this.currentIndex <= 0) {
      return null;
    }
    this.currentIndex--;
    return this.orderedQueue[this.currentIndex];
  }

  /**
   * Verifica si hay más cards en la cola
   */
  hasNext() {
    return this.currentIndex < this.orderedQueue.length;
  }

  /**
   * Obtiene estadísticas de la cola
   */
  getStats() {
    const now = new Date();
    const total = this.orderedQueue.length;
    const completed = this.currentIndex;
    const remaining = total - completed;

    // Calcular distribución por grupos
    const overdue = this.orderedQueue.filter(card =>
      !card.nextReview || card.nextReview <= now
    ).length;

    const dueToday = this.orderedQueue.filter(card => {
      if (!card.nextReview || card.nextReview <= now) return false;
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return card.nextReview <= tomorrow;
    }).length;

    const difficult = this.orderedQueue.filter(card =>
      card.difficulty >= 3
    ).length;

    return {
      total,
      completed,
      remaining,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      distribution: {
        overdue,
        dueToday,
        difficult,
        others: total - overdue - dueToday - difficult
      }
    };
  }

  /**
   * Obtiene el progreso actual
   */
  getProgress() {
    const stats = this.getStats();
    return {
      current: stats.completed + 1, // 1-indexed para UX
      total: stats.total,
      percentage: stats.percentage,
      completed: stats.completed,
      remaining: stats.remaining
    };
  }

  /**
   * Resetea la cola (útil para reiniciar sesión)
   */
  reset() {
    this.currentIndex = 0;
  }

  /**
   * Obtiene la cola completa (para debugging)
   */
  getQueue() {
    return this.orderedQueue;
  }

  /**
   * Obtiene posición actual en la cola
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Establece posición en la cola
   */
  setCurrentIndex(index) {
    if (index >= 0 && index <= this.orderedQueue.length) {
      this.currentIndex = index;
    }
  }
}

/**
 * Función helper para calcular prioridad de una card individual
 */
export const calculateCardPriority = (card) => {
  const now = new Date();

  // Sistema de prioridades determinístico con pesos claros
  let basePriority = 0;

  // 1. PRIORIDAD POR ESTADO DE REVISIÓN (40% del peso total)
  if (!card.nextReview) {
    // Nunca revisada - máxima prioridad
    basePriority += 1000;
  } else if (card.nextReview < now) {
    // Vencida - alta prioridad
    const daysOverdue = (now - card.nextReview) / (1000 * 60 * 60 * 24);
    basePriority += Math.min(800, 400 + (daysOverdue * 10)); // 400-800 puntos
  } else {
    // No vencida - prioridad baja
    const daysUntilDue = (card.nextReview - now) / (1000 * 60 * 60 * 24);
    if (daysUntilDue <= 1) {
      basePriority += 300; // Vence hoy
    } else if (daysUntilDue <= 3) {
      basePriority += 200; // Vence en 1-3 días
    } else if (daysUntilDue <= 7) {
      basePriority += 100; // Vence en 3-7 días
    } else {
      basePriority += 50; // Vence en más de 7 días
    }
  }

  // 2. BONUS POR DIFICULTAD (30% del peso total)
  // Cards difíciles necesitan más práctica
  const difficultyBonus = (card.difficulty - 1) * 50; // 0-150 puntos

  // 3. BONUS POR FALTA DE PRÁCTICA (20% del peso total)
  // Cards con menos reviews necesitan atención
  const practiceBonus = Math.max(0, 100 - (card.reviewCount * 20)); // 100-0 puntos

  // 4. BONUS POR TIEMPO SIN REVISAR (10% del peso total)
  let timeBonus = 0;
  if (card.lastReviewed) {
    const daysSinceReview = (now - card.lastReviewed) / (1000 * 60 * 60 * 24);
    timeBonus = Math.min(50, daysSinceReview * 2); // 0-50 puntos
  } else {
    timeBonus = 50; // Nunca revisada = máximo bonus
  }

  // Prioridad final = base + bonuses
  const finalPriority = basePriority + difficultyBonus + practiceBonus + timeBonus;

  return finalPriority;
};

/**
 * Función helper para calcular próxima revisión
 */
export const calculateNextReview = (currentDifficulty, userDifficulty) => {
  // Ajustar dificultad basada en respuesta del usuario
  const newDifficulty = Math.min(3, Math.max(1,
    Math.round((currentDifficulty + userDifficulty) / 2)
  ));

  // Intervalos basados en dificultad (en milisegundos)
  const intervals = {
    1: 3 * 24 * 60 * 60 * 1000,  // 3 días
    2: 1 * 24 * 60 * 60 * 1000,  // 1 día
    3: 6 * 60 * 60 * 1000        // 6 horas
  };

  return new Date(Date.now() + intervals[newDifficulty]);
};
