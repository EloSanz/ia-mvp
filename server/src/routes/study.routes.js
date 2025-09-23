/**
 * Study Routes - Rutas para el sistema de estudio de flashcards
 * Define los endpoints para gestionar sesiones de estudio
 */

import { Router } from 'express';
import { StudyController } from '../controllers/study.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route POST /api/study/start
 * @desc Iniciar una nueva sesión de estudio
 * @access Private
 * @body {number} deckId - ID del deck a estudiar (requerido)
 * @body {number} limit - Límite de cards por sesión (opcional, max 50)
 */
router.post('/start', StudyController.startStudySession);

/**
 * @route GET /api/study/:sessionId/next
 * @desc Obtener la siguiente card en la sesión
 * @access Private
 * @param {string} sessionId - ID de la sesión de estudio
 */
router.get('/:sessionId/next', StudyController.getNextCard);

/**
 * @route POST /api/study/:sessionId/review
 * @desc Marcar una card como revisada
 * @access Private
 * @param {string} sessionId - ID de la sesión de estudio
 * @body {number} cardId - ID de la card revisada (requerido)
 * @body {number} difficulty - Dificultad percibida (1=fácil, 2=normal, 3=difícil)
 */
router.post('/:sessionId/review', StudyController.reviewCard);

/**
 * @route GET /api/study/:sessionId/status
 * @desc Obtener el estado actual de la sesión
 * @access Private
 * @param {string} sessionId - ID de la sesión de estudio
 */
router.get('/:sessionId/status', StudyController.getSessionStatus);

/**
 * @route POST /api/study/:sessionId/finish
 * @desc Finalizar la sesión de estudio
 * @access Private
 * @param {string} sessionId - ID de la sesión de estudio
 */
router.post('/:sessionId/finish', StudyController.finishSession);

/**
 * @route GET /api/study/stats
 * @desc Obtener estadísticas globales del sistema (admin/debug)
 * @access Private
 */
router.get('/stats', StudyController.getGlobalStats);

export default router;
