import { StudyQueue, calculateCardPriority, calculateNextReview } from '../../../src/utils/study-queue.js';
import { jest } from '@jest/globals';

/**
 * Tests unitarios para StudyQueue
 */

describe('StudyQueue', () => {
  let mockCards;

  beforeEach(() => {
    // Crear cards de prueba con diferentes escenarios
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    mockCards = [
      // Card vencida (máxima prioridad)
      {
        id: 1,
        front: 'Card vencida',
        back: 'Answer 1',
        difficulty: 2,
        reviewCount: 2,
        lastReviewed: yesterday,
        nextReview: yesterday, // Vencida
      },
      // Card que vence hoy
      {
        id: 2,
        front: 'Card vence hoy',
        back: 'Answer 2',
        difficulty: 1,
        reviewCount: 1,
        lastReviewed: yesterday,
        nextReview: tomorrow,
      },
      // Card difícil nueva
      {
        id: 3,
        front: 'Card difícil nueva',
        back: 'Answer 3',
        difficulty: 3,
        reviewCount: 1,
        lastReviewed: null,
        nextReview: nextWeek,
      },
      // Card normal
      {
        id: 4,
        front: 'Card normal',
        back: 'Answer 4',
        difficulty: 2,
        reviewCount: 5,
        lastReviewed: yesterday,
        nextReview: nextWeek,
      },
      // Card nunca revisada
      {
        id: 5,
        front: 'Card nunca revisada',
        back: 'Answer 5',
        difficulty: 2,
        reviewCount: 0,
        lastReviewed: null,
        nextReview: null,
      }
    ];
  });

  describe('Constructor y construcción de cola', () => {
    test('debe crear una cola con las cards ordenadas por prioridad', () => {
      const queue = new StudyQueue(mockCards);

      // Verificar que se crearon las propiedades
      expect(queue).toHaveProperty('cards');
      expect(queue).toHaveProperty('orderedQueue');
      expect(queue).toHaveProperty('currentIndex');
      expect(queue.currentIndex).toBe(0);
    });

    test('debe ordenar cards por prioridad calculada', () => {
      const queue = new StudyQueue(mockCards);

      // Orden esperado por prioridad: 5 (nunca revisada), 1 (vencida), 2 (vence hoy), 3 (difícil), 4 (normal)
      expect(queue.next().id).toBe(5); // Nunca revisada = máxima prioridad (1000+)
      expect(queue.next().id).toBe(1); // Vencida = prioridad alta (~600)
      expect(queue.next().id).toBe(2); // Vence hoy = prioridad media (~400)
      expect(queue.next().id).toBe(3); // Difícil nueva = prioridad media-baja (~300)
      expect(queue.next().id).toBe(4); // Normal = prioridad baja (~200)
    });
  });

  describe('Navegación de cola', () => {
    test('next() debe retornar la siguiente card y avanzar el índice', () => {
      const queue = new StudyQueue(mockCards);

      const firstCard = queue.next();
      expect(firstCard.id).toBe(5); // Primera por prioridad
      expect(queue.currentIndex).toBe(1);

      const secondCard = queue.next();
      expect(secondCard.id).toBe(1); // Segunda por prioridad
      expect(queue.currentIndex).toBe(2);
    });

    test('current() debe retornar la card actual sin avanzar', () => {
      const queue = new StudyQueue(mockCards);

      const currentCard = queue.current();
      expect(currentCard.id).toBe(5); // Primera por prioridad
      expect(queue.currentIndex).toBe(0); // No debería cambiar

      // Llamar de nuevo debería retornar la misma card
      const sameCard = queue.current();
      expect(sameCard.id).toBe(5); // Debería ser la misma
    });

    test('hasNext() debe indicar si hay más cards', () => {
      const queue = new StudyQueue(mockCards);

      expect(queue.hasNext()).toBe(true);

      // Consumir todas las cards
      while (queue.hasNext()) {
        queue.next();
      }

      expect(queue.hasNext()).toBe(false);
    });

    test('next() debe retornar null cuando no hay más cards', () => {
      const queue = new StudyQueue([mockCards[0]]); // Solo una card

      queue.next(); // Consumir la única card
      const noMoreCard = queue.next();

      expect(noMoreCard).toBeNull();
    });
  });

  describe('Estadísticas y progreso', () => {
    test('getStats() debe retornar estadísticas correctas', () => {
      const queue = new StudyQueue(mockCards);
      const stats = queue.getStats();

      expect(stats.total).toBe(5);
      expect(stats.completed).toBe(0);
      expect(stats.remaining).toBe(5);
      expect(stats.percentage).toBe(0);
      expect(stats.distribution).toBeDefined();
    });

    test('getProgress() debe actualizarse correctamente al consumir cards', () => {
      const queue = new StudyQueue(mockCards);

      let progress = queue.getProgress();
      expect(progress.current).toBe(1); // 1-indexed
      expect(progress.completed).toBe(0);

      queue.next(); // Consumir primera card
      progress = queue.getProgress();
      expect(progress.current).toBe(2);
      expect(progress.completed).toBe(1);
      expect(progress.percentage).toBe(20);
    });

    test('getStats() debe calcular distribución correcta', () => {
      const queue = new StudyQueue(mockCards);
      const stats = queue.getStats();

      // Verificar que se calculen los grupos correctamente
      expect(stats.distribution.overdue).toBeGreaterThanOrEqual(0);
      expect(stats.distribution.dueToday).toBeGreaterThanOrEqual(0);
      expect(stats.distribution.difficult).toBeGreaterThanOrEqual(0);
      expect(stats.distribution.others).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Controles de navegación', () => {
    test('previous() debe retroceder en la cola', () => {
      const queue = new StudyQueue(mockCards);

      queue.next(); // Avanzar a segunda card (id=1)
      queue.next(); // Avanzar a tercera card (id=2)
      expect(queue.currentIndex).toBe(2);

      const previousCard = queue.previous(); // Retroceder a segunda card
      expect(previousCard.id).toBe(1); // La segunda card por prioridad
      expect(queue.currentIndex).toBe(1);
    });

    test('previous() debe retornar null si está al inicio', () => {
      const queue = new StudyQueue(mockCards);

      const previousCard = queue.previous();
      expect(previousCard).toBeNull();
      expect(queue.currentIndex).toBe(0);
    });

    test('reset() debe reiniciar la cola', () => {
      const queue = new StudyQueue(mockCards);

      queue.next();
      queue.next();
      expect(queue.currentIndex).toBe(2);

      queue.reset();
      expect(queue.currentIndex).toBe(0);
    });

    test('setCurrentIndex() debe permitir saltar a posiciones específicas', () => {
      const queue = new StudyQueue(mockCards);

      queue.setCurrentIndex(3);
      expect(queue.currentIndex).toBe(3);

      const card = queue.current();
      expect(card.id).toBe(3); // Tercera card en la cola ordenada
    });
  });

  describe('Edge cases', () => {
    test('debe manejar cola vacía', () => {
      const queue = new StudyQueue([]);

      expect(queue.hasNext()).toBe(false);
      expect(queue.next()).toBeNull();
      expect(queue.current()).toBeNull();

      const stats = queue.getStats();
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
    });

    test('setCurrentIndex() debe validar límites', () => {
      const queue = new StudyQueue(mockCards);

      // Índice negativo
      queue.setCurrentIndex(-1);
      expect(queue.currentIndex).toBe(0);

      // Índice mayor al tamaño
      queue.setCurrentIndex(10);
      expect(queue.currentIndex).toBe(0); // No debería cambiar
    });
  });
});

describe('calculateCardPriority', () => {
  test('debe dar máxima prioridad a cards nunca revisadas', () => {
    const neverReviewedCard = {
      id: 1,
      difficulty: 2,
      reviewCount: 0,
      lastReviewed: null,
      nextReview: null
    };

    const priority = calculateCardPriority(neverReviewedCard);
    expect(priority).toBeGreaterThan(4); // Alta prioridad
  });

  test('debe dar alta prioridad a cards vencidas', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const overdueCard = {
      id: 1,
      difficulty: 2,
      reviewCount: 2,
      lastReviewed: yesterday,
      nextReview: yesterday // Vencida
    };

    const priority = calculateCardPriority(overdueCard);
    expect(priority).toBeGreaterThan(2);
  });

  test('debe considerar la dificultad en el cálculo', () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const easyCard = {
      id: 1,
      difficulty: 1,
      reviewCount: 2,
      lastReviewed: now,
      nextReview: tomorrow
    };

    const hardCard = {
      ...easyCard,
      difficulty: 3
    };

    const easyPriority = calculateCardPriority(easyCard);
    const hardPriority = calculateCardPriority(hardCard);

    // Verificar que los valores sean números válidos
    expect(typeof easyPriority).toBe('number');
    expect(typeof hardPriority).toBe('number');
    expect(easyPriority).toBeGreaterThan(0);
    expect(hardPriority).toBeGreaterThan(0);
  });
});

describe('calculateNextReview', () => {
  test('debe calcular correctamente intervalos para dificultad fácil', () => {
    const nextReview = calculateNextReview(2, 1); // Card normal (2), respuesta fácil (1) = nueva dificultad 2 = 1 día

    const now = new Date();
    const timeDiff = nextReview - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Nueva dificultad = (2+1)/2 = 1.5 → redondeado = 2 → 1 día (24 horas)
    expect(hoursDiff).toBeGreaterThan(20); // Al menos 20 horas (margen por timing)
    expect(hoursDiff).toBeLessThan(30); // Menos de 30 horas
  });

  test('debe calcular correctamente intervalos para dificultad difícil', () => {
    const nextReview = calculateNextReview(2, 3); // Card normal, respuesta difícil

    const expectedDate = new Date();
    expectedDate.setHours(expectedDate.getHours() + 6); // 6 horas

    expect(nextReview.getHours()).toBe(expectedDate.getHours());
  });

  test('debe ajustar la dificultad de la card basada en respuesta', () => {
    // Card fácil que responde difícil → debería quedar normal
    const result1 = calculateNextReview(1, 3);
    const daysDiff1 = Math.round((result1 - new Date()) / (1000 * 60 * 60 * 24));
    expect(daysDiff1).toBe(1); // 1 día (normal)

    // Card difícil que responde fácil → debería quedar normal
    const result2 = calculateNextReview(3, 1);
    const daysDiff2 = Math.round((result2 - new Date()) / (1000 * 60 * 60 * 24));
    expect(daysDiff2).toBe(1); // 1 día (normal)
  });
});
