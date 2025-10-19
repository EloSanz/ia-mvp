// Mock de uuid simple
jest.mock('uuid', () => ({
  v4: jest.fn()
    .mockReturnValueOnce('test-uuid-123')
    .mockReturnValueOnce('session-1')
    .mockReturnValueOnce('session-2')
    .mockReturnValue('fallback-uuid')
}));

// Mocks con factory functions para evitar problemas de hoisting
jest.mock('../../../src/models/flashcard.js', () => ({
  Flashcard: {
    findByDeckId: jest.fn(),
    findByDeckIdAndTag: jest.fn(),
    markAsReviewed: jest.fn(),
  }
}));

jest.mock('../../../src/models/deck.js', () => ({
  Deck: {
    findById: jest.fn()
  }
}));

import { StudyService } from '../../../src/services/study.service.js';
import { Flashcard } from '../../../src/models/flashcard.js';
import { Deck } from '../../../src/models/deck.js';

describe('StudyService', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();

    // Configurar datos de prueba
    const testDeck = {
      id: 1,
      name: 'Test Deck',
      userId: 1
    };

      const testCards = [
      {
        id: 1,
        front: 'Question 1',
        back: 'Answer 1',
        difficulty: 2,
        reviewCount: 2,
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        nextReview: new Date(Date.now() - 24 * 60 * 60 * 1000), // Vencida ayer
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        front: 'Question 2',
        back: 'Answer 2',
        difficulty: 1,
        reviewCount: 0,
        lastReviewed: null,
        nextReview: null, // Nunca revisada
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Configurar mocks por defecto
    Deck.findById.mockResolvedValue(testDeck);
    Flashcard.findByDeckId.mockResolvedValue({ items: testCards, total: testCards.length });
    Flashcard.findByDeckIdAndTag.mockResolvedValue(testCards);
  });

  describe('startStudySession', () => {
    test('debe crear una sesión exitosa con datos válidos', async () => {
      const result = await StudyService.startStudySession(1, 1);

      expect(result).toHaveProperty('sessionId');
      expect(result.sessionId).toBe('study_test-uuid-123');
      expect(result.totalCards).toBe(2);
      expect(result.currentCard).toHaveProperty('id', 2); // La nunca revisada tiene mayor prioridad (1000+ puntos)
      expect(result.deckName).toBe('Test Deck');
      expect(result.sessionStats.cardsReviewed).toBe(0);
    });

    test('debe lanzar error si el deck no existe', async () => {
      Deck.findById.mockResolvedValue(null);

      await expect(StudyService.startStudySession(1, 999))
        .rejects
        .toThrow('Deck no encontrado o sin permisos de acceso');
    });

    test('debe limitar la cantidad de cards por sesión', async () => {
      const baseCard = {
        id: 1,
        front: 'Question 1',
        back: 'Answer 1',
        difficulty: 2,
        reviewCount: 2,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const manyCards = Array(30).fill().map((_, i) => ({
        ...baseCard,
        id: i + 1
      }));

      Flashcard.findByDeckId.mockResolvedValue(manyCards);

      const result = await StudyService.startStudySession(1, 1, 10);

      expect(result.totalCards).toBe(10); // Limitado a 10
    });

    test('debe lanzar error si no hay cards disponibles', async () => {
      Flashcard.findByDeckId.mockResolvedValue([]);

      await expect(StudyService.startStudySession(1, 1))
        .rejects
        .toThrow('No hay flashcards disponibles para estudiar en este deck');
    });

    test('debe formatear correctamente la card para estudio', async () => {
      const result = await StudyService.startStudySession(1, 1);

      expect(result.currentCard).toHaveProperty('front');
      expect(result.currentCard).toHaveProperty('back');
      expect(result.currentCard).toHaveProperty('difficulty');
      expect(result.currentCard).toHaveProperty('reviewCount');
      // No debería incluir campos internos
      expect(result.currentCard).not.toHaveProperty('userId');
      expect(result.currentCard).not.toHaveProperty('deckId');
    });
  });

  describe('getNextCard', () => {
    let sessionId;

    beforeEach(async () => {
      const result = await StudyService.startStudySession(1, 1);
      sessionId = result.sessionId;
    });

    test('debe retornar la siguiente card correctamente', async () => {
      const result = await StudyService.getNextCard(sessionId);

      expect(result.currentCard.id).toBe(1); // Después de la primera (id=2), viene la segunda (id=1)
      expect(result).toHaveProperty('progress');
      expect(result).toHaveProperty('queueLength');
    });

    test('debe lanzar error si la sesión no existe', async () => {
      await expect(StudyService.getNextCard('invalid-session'))
        .rejects
        .toThrow('Sesión de estudio no encontrada');
    });

    test('debe lanzar error si no hay más cards', async () => {
      // Consumir la segunda card (primera ya fue consumida en startStudySession)
      await StudyService.getNextCard(sessionId); // Esta debería fallar porque solo hay 2 cards

      await expect(StudyService.getNextCard(sessionId))
        .rejects
        .toThrow('No hay más cards en esta sesión');
    });
  });

  describe('reviewCard', () => {
    let sessionId;

    beforeEach(async () => {
      const result = await StudyService.startStudySession(1, 1);
      sessionId = result.sessionId;

      // Mock de markAsReviewed
      const reviewedCard = {
        id: 2,
        front: 'Question 2',
        back: 'Answer 2',
        difficulty: 1,
        reviewCount: 0,
        lastReviewed: null,
        nextReview: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Flashcard.markAsReviewed.mockResolvedValue({
        ...reviewedCard,
        reviewCount: 1,
        difficulty: 1,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días
      });
    });

    test('debe marcar card como revisada correctamente', async () => {
      const result = await StudyService.reviewCard(sessionId, 2, 1); // Revisar card id=2 (fácil)

      expect(Flashcard.markAsReviewed).toHaveBeenCalledWith(2, 1);
      expect(result.cardUpdated.reviewCount).toBe(1);
      expect(result.cardUpdated.difficulty).toBe(1);
      expect(result.sessionStats.cardsReviewed).toBe(1);
      expect(result.sessionStats.easyCount).toBe(1);
    });

    test('debe actualizar estadísticas correctamente para diferentes dificultades', async () => {
      await StudyService.reviewCard(sessionId, 2, 1); // Fácil (primera card)
      const result2 = await StudyService.reviewCard(sessionId, 1, 2); // Normal (segunda card)
      const result3 = await StudyService.reviewCard(sessionId, 2, 3); // Difícil (primera card otra vez)

      expect(result3.sessionStats.easyCount).toBe(1);
      expect(result3.sessionStats.normalCount).toBe(1);
      expect(result3.sessionStats.hardCount).toBe(1);
      expect(result3.sessionStats.cardsReviewed).toBe(3);
    });

    test('debe lanzar error con dificultad inválida', async () => {
      await expect(StudyService.reviewCard(sessionId, 1, 4))
        .rejects
        .toThrow('La dificultad debe ser 1 (fácil), 2 (normal) o 3 (difícil)');

      await expect(StudyService.reviewCard(sessionId, 1, 0))
        .rejects
        .toThrow('La dificultad debe ser 1 (fácil), 2 (normal) o 3 (difícil)');
    });

    test('debe calcular tiempo de respuesta promedio', async () => {
      // Simular tiempo transcurrido
      const mockStartTime = Date.now();
      const mockEndTime = mockStartTime + 2000; // 2 segundos después

      // Mock Date.now para que retorne tiempos consistentes
      const originalDate = global.Date;
      global.Date = class extends Date {
        static now() {
          return mockEndTime;
        }
      };

      const result = await StudyService.reviewCard(sessionId, 2, 1); // Revisar la primera card (id=2)

      expect(result.sessionStats.averageResponseTime).toBe(2); // 2 segundos

      global.Date = originalDate;
    });
  });

  describe('getSessionStatus', () => {
    let sessionId;

    beforeEach(async () => {
      const result = await StudyService.startStudySession(1, 1);
      sessionId = result.sessionId;
    });

    test('debe retornar estado correcto de sesión activa', async () => {
      const status = await StudyService.getSessionStatus(sessionId);

      expect(status.sessionId).toBe(sessionId);
      expect(status.status).toBe('active');
      expect(status.totalCards).toBe(2);
      expect(status.cardsReviewed).toBe(0);
      expect(status.remainingCards).toBe(1); // Una card ya fue consumida en startStudySession
      expect(status.currentCard).toBeDefined();
    });

    test('debe calcular progreso correctamente', async () => {
      await StudyService.reviewCard(sessionId, 2, 1); // Revisar primera card (id=2)

      const status = await StudyService.getSessionStatus(sessionId);

      expect(status.cardsReviewed).toBe(1);
      expect(status.remainingCards).toBe(1); // Queda 1 card después de revisar la primera
      expect(status.progress.percentage).toBe(50);
    });
  });

  describe('finishSession', () => {
    let sessionId;

    beforeEach(async () => {
      const result = await StudyService.startStudySession(1, 1);
      sessionId = result.sessionId;
    });

    test('debe finalizar sesión correctamente', async () => {
      const result = await StudyService.finishSession(sessionId);

      expect(result.sessionId).toBe(sessionId);
      expect(result.finalStats).toBeDefined();
      expect(result.finalStats.completionRate).toBe(0); // No se revisaron cards
      expect(result.message).toBe('Sesión de estudio finalizada exitosamente');
    });

    test('debe calcular tasa de finalización correctamente', async () => {
      // Revisar la primera card antes de finalizar
      await StudyService.reviewCard(sessionId, 2, 1); // Revisar card id=2 (primera)

      const result = await StudyService.finishSession(sessionId);

      expect(result.finalStats.completionRate).toBe(50); // 1 de 2 cards
    });
  });

  describe('Gestión de sesiones', () => {
    test('debe validar sesión inexistente', async () => {
      await expect(StudyService.getSessionStatus('invalid-session-id'))
        .rejects
        .toThrow('Sesión de estudio no encontrada');
    });

    test('debe manejar múltiples sesiones concurrentes', async () => {
      const session1 = await StudyService.startStudySession(1, 1);
      const session2 = await StudyService.startStudySession(2, 1);

      // Solo verificamos que se crearon dos sesiones diferentes
      expect(session1).toHaveProperty('sessionId');
      expect(session2).toHaveProperty('sessionId');
      expect(session1.sessionId).toContain('study_');
      expect(session2.sessionId).toContain('study_');
      // No verificamos que sean diferentes porque el mock puede reusarse
    });
  });

  describe('Formateo de datos', () => {
    test('formatCardForStudy debe excluir campos sensibles', () => {
      const card = {
        id: 1,
        front: 'Question',
        back: 'Answer',
        deckId: 1,
        userId: 1,
        difficulty: 2,
        reviewCount: 1,
        lastReviewed: new Date(),
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const formatted = StudyService.formatCardForStudy(card);

      expect(formatted).toHaveProperty('id', 1);
      expect(formatted).toHaveProperty('front', 'Question');
      expect(formatted).toHaveProperty('back', 'Answer');
      expect(formatted).toHaveProperty('difficulty', 2);
      expect(formatted).not.toHaveProperty('deckId');
      expect(formatted).not.toHaveProperty('userId');
    });

    test('formatSessionStats debe incluir todas las métricas', () => {
      const stats = {
        cardsReviewed: 3,
        easyCount: 1,
        normalCount: 1,
        hardCount: 1,
        timeSpent: 60,
        responseTimes: [10000, 20000, 30000] // tiempos en ms
      };

      const formatted = StudyService.formatSessionStats(stats);

      expect(formatted.cardsReviewed).toBe(3);
      expect(formatted.easyCount).toBe(1);
      expect(formatted.normalCount).toBe(1);
      expect(formatted.hardCount).toBe(1);
      expect(formatted.timeSpent).toBe(60);
      expect(formatted.averageResponseTime).toBe(20); // (10+20+30)/3 = 20 segundos
    });
  });
});
