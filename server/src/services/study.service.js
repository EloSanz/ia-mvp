/**
 * StudyService - Servicio de lógica de negocio para sesiones de estudio
 * Maneja la creación, gestión y finalización de sesiones de estudio
 */

import { StudyQueue } from '../utils/study-queue.js';
import { Flashcard } from '../models/flashcard.js';
import { v4 as uuidv4 } from 'uuid';

// Almacén temporal de sesiones (en producción usar Redis o DB)
const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000; // 30 minutos en milisegundos
const MAX_CARDS_PER_SESSION = 20;

export class StudyService {
  /**
   * Inicia una nueva sesión de estudio
   */
  static async startStudySession(userId, deckId, limit = MAX_CARDS_PER_SESSION) {
    try {
      // Validar que el usuario tenga acceso al deck
      const deck = await this.validateDeckAccess(userId, deckId);
      if (!deck) {
        throw new Error(`Deck no encontrado o sin permisos de acceso (userId: ${userId}, deckId: ${deckId})`);
      }

      // Obtener todas las flashcards del deck que pueden ser estudiadas
      const allCardsResult = await Flashcard.findByDeckId(deckId);
      const allCards = allCardsResult.items || [];

      // Limitar la cantidad de cards por sesión
      const actualLimit = limit || MAX_CARDS_PER_SESSION;
      const studyCards = allCards.slice(0, actualLimit);

      if (studyCards.length === 0) {
        throw new Error(`No hay flashcards disponibles para estudiar en este deck (deckId: ${deckId}, cards found: ${allCards.length})`);
      }

      // Crear sesión
      const sessionId = `study_${uuidv4()}`;
      const queue = new StudyQueue(studyCards);

      const session = {
        id: sessionId,
        userId,
        deckId,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_TTL),
        queue,
        stats: {
          cardsReviewed: 0,
          easyCount: 0,
          normalCount: 0,
          hardCount: 0,
          timeSpent: 0,
          startTime: Date.now(),
          responseTimes: []
        },
        status: 'active'
      };

      // Almacenar sesión
      sessions.set(sessionId, session);

      // Limpiar sesiones expiradas
      this.cleanupExpiredSessions();

      // Obtener primera card
      const firstCard = queue.next();

      return {
        sessionId,
        totalCards: studyCards.length,
        currentCard: this.formatCardForStudy(firstCard),
        queueLength: studyCards.length - 1,
        sessionStats: this.formatSessionStats(session.stats),
        deckName: deck.name
      };

    } catch (error) {
      throw new Error(`Error al iniciar sesión de estudio: ${error.message}`);
    }
  }

  /**
   * Obtiene la siguiente card de la sesión
   */
  static async getNextCard(sessionId) {
    const session = this.getValidSession(sessionId);

    if (session.status !== 'active') {
      throw new Error('La sesión no está activa');
    }

    if (!session.queue.hasNext()) {
      // En lugar de error, devolver indicador de fin de sesión
      return {
        sessionFinished: true,
        message: 'No hay más cards en esta sesión',
        finalStats: session.stats
      };
    }

    const nextCard = session.queue.next();

    return {
      currentCard: this.formatCardForStudy(nextCard),
      queueLength: session.queue.getQueue().length - session.queue.getCurrentIndex(),
      progress: session.queue.getProgress(),
      sessionStats: this.formatSessionStats(session.stats)
    };
  }

  /**
   * Marca una card como revisada y actualiza estadísticas
   */
  static async reviewCard(sessionId, cardId, userDifficulty) {
    const session = this.getValidSession(sessionId);

    // Validar dificultad
    if (![1, 2, 3].includes(userDifficulty)) {
      throw new Error('La dificultad debe ser 1 (fácil), 2 (normal) o 3 (difícil)');
    }

    // Marcar card como revisada
    const reviewedCard = await Flashcard.markAsReviewed(cardId, userDifficulty);

    // Actualizar estadísticas de sesión
    const responseTime = Date.now() - session.stats.startTime;
    session.stats.responseTimes.push(responseTime);
    session.stats.cardsReviewed++;

    // Contabilizar por dificultad
    switch (userDifficulty) {
      case 1:
        session.stats.easyCount++;
        break;
      case 2:
        session.stats.normalCount++;
        break;
      case 3:
        session.stats.hardCount++;
        break;
    }

    // Calcular tiempo total
    session.stats.timeSpent = Math.floor((Date.now() - session.stats.startTime) / 1000);

    return {
      cardUpdated: this.formatCardForStudy(reviewedCard),
      sessionStats: this.formatSessionStats(session.stats)
    };
  }

  /**
   * Obtiene el estado actual de la sesión
   */
  static async getSessionStatus(sessionId) {
    const session = this.getValidSession(sessionId);

    const currentCard = session.queue.current();
    const progress = session.queue.getProgress();

    return {
      sessionId: session.id,
      status: session.status,
      totalCards: session.queue.getQueue().length,
      cardsReviewed: session.stats.cardsReviewed,
      remainingCards: progress.remaining,
      progress,
      sessionStats: this.formatSessionStats(session.stats),
      currentCard: currentCard ? this.formatCardForStudy(currentCard) : null
    };
  }

  /**
   * Finaliza la sesión de estudio
   */
  static async finishSession(sessionId) {
    const session = this.getValidSession(sessionId);

    session.status = 'finished';
    session.finishedAt = new Date();

    const finalStats = {
      ...this.formatSessionStats(session.stats),
      finishedAt: session.finishedAt,
      completionRate: session.queue.getQueue().length > 0
        ? Math.round((session.stats.cardsReviewed / session.queue.getQueue().length) * 100)
        : 0
    };

    // En una implementación real, aquí guardaríamos las estadísticas en la DB
    // await this.saveSessionStats(session);

    // Limpiar sesión después de 5 minutos (solo en producción)
    if (process.env.NODE_ENV !== 'test') {
      setTimeout(() => {
        sessions.delete(sessionId);
      }, 5 * 60 * 1000);
    }

    return {
      sessionId,
      finalStats,
      message: 'Sesión de estudio finalizada exitosamente'
    };
  }

  /**
   * Valida que el usuario tenga acceso al deck
   */
  static async validateDeckAccess(userId, deckId) {
    try {
      const Deck = (await import('../models/deck.js')).Deck;
      const deck = await Deck.findById(deckId);

      // Validar que el deck existe y pertenece al usuario
      if (!deck || deck.userId !== parseInt(userId)) {
        return null;
      }

      return deck;
    } catch (error) {
      console.error('Error al validar acceso al deck:', error);
      throw new Error(`Error al validar acceso al deck: ${error.message}`);
    }
  }

  /**
   * Obtiene una sesión válida o lanza error
   */
  static getValidSession(sessionId) {
    const session = sessions.get(sessionId);

    if (!session) {
      throw new Error('Sesión de estudio no encontrada');
    }

    if (session.expiresAt < new Date()) {
      sessions.delete(sessionId);
      throw new Error('La sesión de estudio ha expirado');
    }

    return session;
  }

  /**
   * Formatea una card para envío al frontend
   */
  static formatCardForStudy(card) {
    if (!card) return null;

    return {
      id: card.id,
      front: card.front,
      back: card.back,
      difficulty: card.difficulty,
      reviewCount: card.reviewCount,
      lastReviewed: card.lastReviewed,
      nextReview: card.nextReview,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt
    };
  }

  /**
   * Formatea estadísticas de sesión para respuesta
   */
  static formatSessionStats(stats) {
    const averageResponseTime = stats.responseTimes.length > 0
      ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length / 1000)
      : 0;

    return {
      cardsReviewed: stats.cardsReviewed,
      easyCount: stats.easyCount,
      normalCount: stats.normalCount,
      hardCount: stats.hardCount,
      timeSpent: stats.timeSpent,
      averageResponseTime
    };
  }

  /**
   * Limpia sesiones expiradas
   */
  static cleanupExpiredSessions() {
    const now = new Date();
    for (const [sessionId, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(sessionId);
      }
    }
  }

  /**
   * Obtiene estadísticas generales (para debugging/admin)
   */
  static getGlobalStats() {
    const activeSessions = Array.from(sessions.values())
      .filter(session => session.status === 'active');

    return {
      totalSessions: sessions.size,
      activeSessions: activeSessions.length,
      totalCardsReviewed: activeSessions.reduce((sum, s) => sum + s.stats.cardsReviewed, 0),
      averageSessionTime: activeSessions.length > 0
        ? Math.round(activeSessions.reduce((sum, s) => sum + s.stats.timeSpent, 0) / activeSessions.length)
        : 0
    };
  }

  /**
   * Limpia todas las sesiones (para testing)
   */
  static clearAllSessions() {
    sessions.clear();
  }
}

export default StudyService;
