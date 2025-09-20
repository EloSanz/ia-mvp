// Mock de uuid primero
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'integration-test-uuid')
}));

// Mock de modelos
jest.mock('../../src/models/flashcard.js', () => ({
  Flashcard: {
    findByDeckId: jest.fn(),
    markAsReviewed: jest.fn(),
  }
}));

jest.mock('../../src/models/deck.js', () => ({
  Deck: {
    findById: jest.fn()
  }
}));

import { StudyService } from '../../src/services/study.service.js';
import { StudyQueue } from '../../src/utils/study-queue.js';
import { Flashcard } from '../../src/models/flashcard.js';
import { Deck } from '../../src/models/deck.js';

describe.skip('Study System Integration Tests', () => {
  let mockCards;
  let mockDeck;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar datos realistas de prueba
    mockDeck = {
      id: 1,
      name: 'Mathematics Fundamentals',
      userId: 1
    };

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    mockCards = [
      // Card vencida (alta prioridad)
      {
        id: 1,
        front: '¿Qué es un número primo?',
        back: 'Un número mayor que 1 que solo es divisible por 1 y por sí mismo',
        difficulty: 2,
        reviewCount: 3,
        lastReviewed: yesterday,
        nextReview: yesterday,
        createdAt: yesterday,
        updatedAt: yesterday
      },
      // Card nunca revisada (alta prioridad)
      {
        id: 2,
        front: '¿Cuál es la fórmula del área de un círculo?',
        back: 'A = πr²',
        difficulty: 2,
        reviewCount: 0,
        lastReviewed: null,
        nextReview: null,
        createdAt: yesterday,
        updatedAt: yesterday
      },
      // Card vence hoy (media prioridad)
      {
        id: 3,
        front: '¿Qué es el teorema de Pitágoras?',
        back: 'En un triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos',
        difficulty: 3,
        reviewCount: 2,
        lastReviewed: yesterday,
        nextReview: tomorrow,
        createdAt: yesterday,
        updatedAt: yesterday
      },
      // Card normal (baja prioridad)
      {
        id: 4,
        front: '¿Cuánto es 2 + 2?',
        back: '4',
        difficulty: 1,
        reviewCount: 10,
        lastReviewed: yesterday,
        nextReview: nextWeek,
        createdAt: yesterday,
        updatedAt: yesterday
      }
    ];

    // Configurar mocks
    Deck.findById.mockResolvedValue(mockDeck);
    Flashcard.findByDeckId.mockResolvedValue(mockCards);
  });

  describe('Flujo completo de estudio', () => {
    test('debe permitir un flujo completo de estudio desde inicio hasta fin', async () => {
      // 1. Iniciar sesión
      const startResult = await StudyService.startStudySession(1, 1);

      expect(startResult.sessionId).toContain('study_integration-test-uuid');
      expect(startResult.totalCards).toBe(4);
      expect(startResult.currentCard.id).toBe(1); // Card vencida primero

      const sessionId = startResult.sessionId;

      // 2. Obtener siguiente card
      const nextResult = await StudyService.getNextCard(sessionId);
      expect(nextResult.currentCard.id).toBe(2); // Card nunca revisada

      // 3. Revisar primera card como fácil
      const updatedCard1 = {
        ...mockCards[0],
        reviewCount: 4,
        difficulty: 1,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };
      Flashcard.markAsReviewed.mockResolvedValue(updatedCard1);

      const reviewResult1 = await StudyService.reviewCard(sessionId, 1, 1);
      expect(reviewResult1.cardUpdated.difficulty).toBe(1);
      expect(reviewResult1.sessionStats.cardsReviewed).toBe(1);

      // 4. Obtener estado de la sesión
      const statusResult = await StudyService.getSessionStatus(sessionId);
      expect(statusResult.status).toBe('active');
      expect(statusResult.progress.percentage).toBe(25);

      // 5. Continuar estudiando
      const nextResult2 = await StudyService.getNextCard(sessionId);
      expect(nextResult2.currentCard.id).toBe(3); // Card vence hoy

      // 6. Revisar segunda card como difícil
      const updatedCard2 = {
        ...mockCards[1],
        reviewCount: 1,
        difficulty: 2,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      };
      Flashcard.markAsReviewed.mockResolvedValue(updatedCard2);

      const reviewResult2 = await StudyService.reviewCard(sessionId, 2, 3);
      expect(reviewResult2.sessionStats.hardCount).toBe(1);

      // 7. Finalizar sesión
      const finishResult = await StudyService.finishSession(sessionId);
      expect(finishResult.finalStats.completionRate).toBe(50); // 2 de 4 cards
      expect(finishResult.finalStats.cardsReviewed).toBe(2);
    });
  });

  describe('Algoritmo de cola de prioridad', () => {
    test('debe ordenar cards correctamente por prioridad', () => {
      const queue = new StudyQueue(mockCards);
      const orderedCards = queue.getQueue();

      // Verificar orden: vencida -> nunca revisada -> vence hoy -> normal
      expect(orderedCards[0].id).toBe(1); // Vencida
      expect(orderedCards[1].id).toBe(2); // Nunca revisada
      expect(orderedCards[2].id).toBe(3); // Vence hoy
      expect(orderedCards[3].id).toBe(4); // Normal
    });

    test('debe manejar navegación correcta en la cola', () => {
      const queue = new StudyQueue(mockCards);

      // Primera card
      expect(queue.next().id).toBe(1);
      expect(queue.currentIndex).toBe(1);

      // Segunda card
      expect(queue.next().id).toBe(2);
      expect(queue.currentIndex).toBe(2);

      // Retroceder
      expect(queue.previous().id).toBe(2);
      expect(queue.currentIndex).toBe(1);

      // Avanzar de nuevo
      expect(queue.next().id).toBe(2);
      expect(queue.currentIndex).toBe(2);
    });
  });

  describe('Gestión de sesiones concurrentes', () => {
    test('debe manejar múltiples sesiones simultáneamente', async () => {
      // Usuario 1 - Deck 1
      const session1 = await StudyService.startStudySession(1, 1);

      // Usuario 2 - Deck 1
      const session2 = await StudyService.startStudySession(2, 1);

      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(StudyService.sessions.size).toBe(2);

      // Verificar que ambas sesiones sean independientes
      const status1 = await StudyService.getSessionStatus(session1.sessionId);
      const status2 = await StudyService.getSessionStatus(session2.sessionId);

      expect(status1.totalCards).toBe(4);
      expect(status2.totalCards).toBe(4);
    });
  });

  describe('Validaciones y manejo de errores', () => {
    test('debe manejar errores de deck no encontrado', async () => {
      Deck.findById.mockResolvedValue(null);

      await expect(StudyService.startStudySession(1, 999))
        .rejects
        .toThrow('Deck no encontrado o sin permisos de acceso');
    });

    test('debe manejar errores de sesión expirada', async () => {
      const result = await StudyService.startStudySession(1, 1);
      const session = StudyService.getValidSession(result.sessionId);

      // Forzar expiración
      session.expiresAt = new Date(Date.now() - 1000);

      await expect(StudyService.getNextCard(result.sessionId))
        .rejects
        .toThrow('La sesión de estudio ha expirado');
    });

    test('debe validar dificultad en review', async () => {
      const result = await StudyService.startStudySession(1, 1);

      await expect(StudyService.reviewCard(result.sessionId, 1, 0))
        .rejects
        .toThrow('La dificultad debe ser 1 (fácil), 2 (normal) o 3 (difícil)');

      await expect(StudyService.reviewCard(result.sessionId, 1, 4))
        .rejects
        .toThrow('La dificultad debe ser 1 (fácil), 2 (normal) o 3 (difícil)');
    });
  });

  describe('Estadísticas y métricas', () => {
    test('debe calcular estadísticas correctamente durante la sesión', async () => {
      const result = await StudyService.startStudySession(1, 1);
      const sessionId = result.sessionId;

      // Mock para markAsReviewed
      Flashcard.markAsReviewed.mockImplementation((cardId, difficulty) => {
        const card = mockCards.find(c => c.id === cardId);
        return Promise.resolve({
          ...card,
          reviewCount: card.reviewCount + 1,
          difficulty: Math.min(3, Math.max(1, Math.round((card.difficulty + difficulty) / 2))),
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + (difficulty === 1 ? 3 : difficulty === 2 ? 1 : 0.25) * 24 * 60 * 60 * 1000)
        });
      });

      // Revisar algunas cards
      await StudyService.reviewCard(sessionId, 1, 1); // Fácil
      await StudyService.reviewCard(sessionId, 2, 2); // Normal
      await StudyService.reviewCard(sessionId, 3, 3); // Difícil

      const status = await StudyService.getSessionStatus(sessionId);

      expect(status.sessionStats.cardsReviewed).toBe(3);
      expect(status.sessionStats.easyCount).toBe(1);
      expect(status.sessionStats.normalCount).toBe(1);
      expect(status.sessionStats.hardCount).toBe(1);
      expect(status.progress.percentage).toBe(75);
    });

    test('debe calcular tiempo promedio de respuesta', async () => {
      const result = await StudyService.startStudySession(1, 1);
      const sessionId = result.sessionId;

      // Simular tiempos de respuesta
      const originalNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        const times = [1000, 3000, 5000]; // 2s, 2s, 0s
        return times[callCount++] || 5000;
      });

      Flashcard.markAsReviewed.mockResolvedValue({
        ...mockCards[0],
        reviewCount: 1,
        lastReviewed: new Date(),
        nextReview: new Date()
      });

      await StudyService.reviewCard(sessionId, 1, 1);

      const status = await StudyService.getSessionStatus(sessionId);
      expect(status.sessionStats.averageResponseTime).toBe(2); // 2 segundos promedio

      Date.now = originalNow;
    });
  });
});
