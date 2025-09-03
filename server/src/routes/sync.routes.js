import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller.js';

const router = Router();

/**
 * @route GET /api/sync/anki/status
 * @desc Verifica la conexión con Anki
 * @access Public
 */
router.get('/anki/status', SyncController.checkAnkiConnection);

/**
 * @route POST /api/sync/anki/sync
 * @desc Sincroniza todas las flashcards con Anki
 * @access Public
 */
router.post('/anki/sync', SyncController.syncWithAnki);

/**
 * @route POST /api/sync/anki/sync/:deckId
 * @desc Sincroniza flashcards de un deck específico con Anki
 * @access Public
 */
router.post('/anki/sync/:deckId', SyncController.syncWithAnki);

/**
 * @route POST /api/sync/anki/import
 * @desc Importa flashcards desde Anki
 * @access Public
 * @body {number} deckId - ID del deck local donde importar
 */
router.post('/anki/import', SyncController.importFromAnki);

/**
 * @route POST /api/sync/anki/export
 * @desc Exporta flashcards específicas a Anki
 * @access Public
 * @body {number[]} flashcardIds - Array de IDs de flashcards a exportar
 */
router.post('/anki/export', SyncController.exportToAnki);

/**
 * @route GET /api/sync/stats
 * @desc Obtiene estadísticas generales de estudio
 * @access Public
 */
router.get('/stats', SyncController.getStudyStats);

/**
 * @route GET /api/sync/stats/:deckId
 * @desc Obtiene estadísticas de estudio por deck
 * @access Public
 */
router.get('/stats/:deckId', SyncController.getStudyStats);

/**
 * @route POST /api/sync/study
 * @desc Inicia una sesión de estudio
 * @access Public
 * @query {number} limit - Número máximo de tarjetas (default: 20)
 */
router.post('/study', SyncController.startStudySession);

/**
 * @route POST /api/sync/study/:deckId
 * @desc Inicia una sesión de estudio para un deck específico
 * @access Public
 * @query {number} limit - Número máximo de tarjetas (default: 20)
 */
router.post('/study/:deckId', SyncController.startStudySession);

export default router;
