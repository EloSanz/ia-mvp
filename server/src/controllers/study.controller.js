/**
 * StudyController - Controlador para endpoints de estudio de flashcards
 * Maneja las sesiones de estudio y la interacción con cards
 */

import { StudyService } from '../services/study.service.js';
import { BaseController } from './base.controller.js';

export const StudyController = {
  /**
   * Iniciar una nueva sesión de estudio
   * POST /api/study/start
   */
  startStudySession: BaseController.wrap(async (req, res) => {
    const { userId } = req;
    const { deckId, limit } = req.body;


    // Validaciones
    if (!deckId) {
      return BaseController.error(res, 'El deckId es requerido', 400);
    }

    // Si limit es null/undefined, usar valor por defecto
    const actualLimit = limit || undefined;

    if (actualLimit && (actualLimit < 1 || actualLimit > 50)) {
      return BaseController.error(res, 'El límite debe estar entre 1 y 50 cards', 400);
    }

    try {
      const result = await StudyService.startStudySession(userId, deckId, actualLimit);

      BaseController.success(res, {
        sessionId: result.sessionId,
        totalCards: result.totalCards,
        currentCard: result.currentCard,
        queueLength: result.queueLength,
        sessionStats: result.sessionStats,
        deckName: result.deckName
      }, 'Sesión de estudio iniciada exitosamente');

    } catch (error) {
      console.error('Error al iniciar sesión de estudio:', error);
      BaseController.error(res, error.message, 500);
    }
  }),

  /**
   * Obtener la siguiente card en la sesión
   * GET /api/study/:sessionId/next
   */
  getNextCard: BaseController.wrap(async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId) {
      return BaseController.error(res, 'El sessionId es requerido', 400);
    }

    try {
      const result = await StudyService.getNextCard(sessionId);

      // Si la sesión terminó, devolver respuesta especial
      if (result.sessionFinished) {
        return BaseController.success(res, {
          sessionFinished: true,
          message: result.message,
          finalStats: result.finalStats
        }, 'Sesión completada');
      }

      BaseController.success(res, {
        currentCard: result.currentCard,
        queueLength: result.queueLength,
        progress: result.progress
      }, 'Siguiente card obtenida exitosamente');

    } catch (error) {
      console.error('Error al obtener siguiente card:', error);

      if (error.message.includes('Sesión de estudio no encontrada')) {
        return BaseController.error(res, 'Sesión no encontrada o expirada', 404);
      }

      if (error.message.includes('No hay más cards')) {
        return BaseController.error(res, 'No hay más cards en esta sesión', 400);
      }

      BaseController.error(res, error.message, 500);
    }
  }),

  /**
   * Marcar una card como revisada
   * POST /api/study/:sessionId/review
   */
  reviewCard: BaseController.wrap(async (req, res) => {
    const { sessionId } = req.params;
    const { cardId, difficulty } = req.body;

    // Validaciones
    if (!sessionId) {
      return BaseController.error(res, 'El sessionId es requerido', 400);
    }

    if (!cardId) {
      return BaseController.error(res, 'El cardId es requerido', 400);
    }

    if (!difficulty || ![1, 2, 3].includes(difficulty)) {
      return BaseController.error(res, 'La dificultad debe ser 1 (fácil), 2 (normal) o 3 (difícil)', 400);
    }

    try {
      const result = await StudyService.reviewCard(sessionId, cardId, difficulty);

      BaseController.success(res, {
        cardUpdated: result.cardUpdated,
        sessionStats: result.sessionStats
      }, 'Card marcada como revisada exitosamente');

    } catch (error) {
      console.error('Error al marcar card como revisada:', error);

      if (error.message.includes('Sesión de estudio no encontrada')) {
        return BaseController.error(res, 'Sesión no encontrada o expirada', 404);
      }

      if (error.message.includes('La dificultad debe ser')) {
        return BaseController.error(res, error.message, 400);
      }

      BaseController.error(res, error.message, 500);
    }
  }),

  /**
   * Obtener el estado actual de la sesión
   * GET /api/study/:sessionId/status
   */
  getSessionStatus: BaseController.wrap(async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId) {
      return BaseController.error(res, 'El sessionId es requerido', 400);
    }

    try {
      const result = await StudyService.getSessionStatus(sessionId);

      BaseController.success(res, {
        sessionId: result.sessionId,
        status: result.status,
        totalCards: result.totalCards,
        cardsReviewed: result.cardsReviewed,
        remainingCards: result.remainingCards,
        progress: result.progress,
        sessionStats: result.sessionStats,
        currentCard: result.currentCard
      }, 'Estado de sesión obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener estado de sesión:', error);

      if (error.message.includes('Sesión de estudio no encontrada')) {
        return BaseController.error(res, 'Sesión no encontrada o expirada', 404);
      }

      BaseController.error(res, error.message, 500);
    }
  }),

  /**
   * Finalizar la sesión de estudio
   * POST /api/study/:sessionId/finish
   */
  finishSession: BaseController.wrap(async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId) {
      return BaseController.error(res, 'El sessionId es requerido', 400);
    }

    try {
      const result = await StudyService.finishSession(sessionId);

      BaseController.success(res, {
        sessionId: result.sessionId,
        finalStats: result.finalStats
      }, result.message);

    } catch (error) {
      console.error('Error al finalizar sesión:', error);

      if (error.message.includes('Sesión de estudio no encontrada')) {
        return BaseController.error(res, 'Sesión no encontrada o expirada', 404);
      }

      BaseController.error(res, error.message, 500);
    }
  }),

  /**
   * Obtener estadísticas globales del sistema de estudio (para admin/debug)
   * GET /api/study/stats
   */
  getGlobalStats: BaseController.wrap(async (req, res) => {
    try {
      const stats = StudyService.getGlobalStats();

      BaseController.success(res, stats, 'Estadísticas globales obtenidas exitosamente');

    } catch (error) {
      console.error('Error al obtener estadísticas globales:', error);
      BaseController.error(res, error.message, 500);
    }
  })
};
