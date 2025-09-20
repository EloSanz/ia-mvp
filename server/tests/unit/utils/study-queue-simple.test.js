import { StudyQueue, calculateCardPriority, calculateNextReview } from '../../../src/utils/study-queue.js';

/**
 * Tests unitarios simples para StudyQueue - sin mocks complejos
 */

describe('StudyQueue - Tests básicos', () => {
  let sampleCards;

  beforeEach(() => {
    // Crear cards de prueba simples
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    sampleCards = [
      {
        id: 1,
        front: 'Question 1',
        back: 'Answer 1',
        difficulty: 2,
        reviewCount: 2,
        lastReviewed: yesterday,
        nextReview: yesterday, // Vencida
      },
      {
        id: 2,
        front: 'Question 2',
        back: 'Answer 2',
        difficulty: 1,
        reviewCount: 1,
        lastReviewed: yesterday,
        nextReview: tomorrow,
      },
      {
        id: 3,
        front: 'Question 3',
        back: 'Answer 3',
        difficulty: 2,
        reviewCount: 0,
        lastReviewed: null,
        nextReview: null, // Nunca revisada
      }
    ];
  });

  describe('Constructor', () => {
    test('crea una cola correctamente', () => {
      const queue = new StudyQueue(sampleCards);

      expect(queue).toBeDefined();
      expect(queue.getQueue()).toHaveLength(3);
    });

    test('maneja array vacío', () => {
      const queue = new StudyQueue([]);

      expect(queue.getQueue()).toHaveLength(0);
      expect(queue.hasNext()).toBe(false);
      expect(queue.next()).toBeNull();
    });
  });

  describe('Navegación básica', () => {
    test('next() retorna cards en orden de prioridad', () => {
      const queue = new StudyQueue(sampleCards);

      expect(queue.next().id).toBe(3); // Primera: nunca revisada (máxima prioridad)
      expect(queue.next().id).toBe(1); // Segunda: vencida (prioridad alta)
      expect(queue.next().id).toBe(2); // Tercera: vence pronto (prioridad baja)
    });

    test('hasNext() funciona correctamente', () => {
      const queue = new StudyQueue(sampleCards);

      expect(queue.hasNext()).toBe(true);
      queue.next();
      expect(queue.hasNext()).toBe(true);
      queue.next();
      expect(queue.hasNext()).toBe(true);
      queue.next();
      expect(queue.hasNext()).toBe(false);
    });

    test('current() retorna card actual sin avanzar', () => {
      const queue = new StudyQueue(sampleCards);

      expect(queue.current().id).toBe(3); // Primera card por prioridad
      expect(queue.current().id).toBe(3); // Sigue siendo la misma
      expect(queue.currentIndex).toBe(0); // No avanzó
    });
  });

  describe('Estadísticas', () => {
    test('getStats() retorna estadísticas válidas', () => {
      const queue = new StudyQueue(sampleCards);
      const stats = queue.getStats();

      expect(stats).toHaveProperty('total', 3);
      expect(stats).toHaveProperty('completed', 0);
      expect(stats).toHaveProperty('remaining', 3);
      expect(stats).toHaveProperty('percentage', 0);
      expect(stats).toHaveProperty('distribution');
    });

    test('getProgress() actualiza correctamente', () => {
      const queue = new StudyQueue(sampleCards);

      expect(queue.getProgress().current).toBe(1);
      expect(queue.getProgress().completed).toBe(0);

      queue.next();
      expect(queue.getProgress().current).toBe(2);
      expect(queue.getProgress().completed).toBe(1);
    });
  });

  describe('Controles', () => {
    test('previous() retrocede correctamente', () => {
      const queue = new StudyQueue(sampleCards);

      queue.next(); // Avanza a segunda card
      expect(queue.currentIndex).toBe(1);

      queue.previous(); // Retrocede a primera card
      expect(queue.currentIndex).toBe(0);
      expect(queue.current().id).toBe(3); // Primera card por prioridad
    });

    test('reset() reinicia la cola', () => {
      const queue = new StudyQueue(sampleCards);

      queue.next();
      queue.next();
      expect(queue.currentIndex).toBe(2);

      queue.reset();
      expect(queue.currentIndex).toBe(0);
      expect(queue.current().id).toBe(3); // Primera card por prioridad
    });
  });
});

describe('Funciones auxiliares', () => {
  describe('calculateCardPriority', () => {
    test('retorna un número', () => {
      const card = {
        id: 1,
        difficulty: 2,
        reviewCount: 1,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const priority = calculateCardPriority(card);
      expect(typeof priority).toBe('number');
      expect(priority).toBeGreaterThanOrEqual(0);
    });

    test('maneja cards sin nextReview', () => {
      const card = {
        id: 1,
        difficulty: 2,
        reviewCount: 0,
        lastReviewed: null,
        nextReview: null
      };

      const priority = calculateCardPriority(card);
      expect(typeof priority).toBe('number');
    });
  });

  describe('calculateNextReview', () => {
    test('retorna una fecha futura', () => {
      const nextReview = calculateNextReview(2, 1); // Normal, fácil

      expect(nextReview).toBeInstanceOf(Date);
      expect(nextReview.getTime()).toBeGreaterThan(Date.now());
    });

    test('maneja diferentes dificultades', () => {
      const easy = calculateNextReview(2, 1);
      const normal = calculateNextReview(2, 2);
      const hard = calculateNextReview(2, 3);

      expect(easy.getTime()).toBeGreaterThan(Date.now());
      expect(normal.getTime()).toBeGreaterThan(Date.now());
      expect(hard.getTime()).toBeGreaterThan(Date.now());

      // Verificar que todos son fechas futuras válidas
      const now = Date.now();
      expect(easy.getTime()).toBeGreaterThan(now);
      expect(normal.getTime()).toBeGreaterThan(now);
      expect(hard.getTime()).toBeGreaterThan(now);
    });
  });
});
