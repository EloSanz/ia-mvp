import { FlashcardService } from '../services/flashcard.service.js';
import { BaseController } from './base.controller.js';

const flashcardService = new FlashcardService();

export const SyncController = {
  /**
   * Verifica la conexión con Anki
   */
  checkAnkiConnection: BaseController.wrap(async (req, res) => {
    const connectionStatus = await flashcardService.checkAnkiConnection();

    if (connectionStatus.connected) {
      BaseController.success(res, connectionStatus, 'Conexión con Anki verificada exitosamente');
    } else {
      BaseController.error(res, 'Anki no está disponible o AnkiConnect no está ejecutándose', 503);
    }
  }),

  /**
   * Sincroniza flashcards con Anki
   */
  syncWithAnki: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;

    if (deckId) {
      BaseController.validateId(deckId);
    }

    const syncResult = await flashcardService.syncWithAnki(deckId);

    if (syncResult.success) {
      BaseController.success(res, syncResult, syncResult.message);
    } else {
      BaseController.error(res, syncResult.message, 500);
    }
  }),

  /**
   * Importa flashcards desde Anki
   */
  importFromAnki: BaseController.wrap(async (req, res) => {
    const { deckId } = req.body;

    if (!deckId) {
      return BaseController.error(res, 'El deckId es requerido para la importación', 400);
    }

    BaseController.validateId(deckId);

    const importResult = await flashcardService.importFromAnki(deckId);

    if (importResult.success) {
      BaseController.success(res, importResult, importResult.message);
    } else {
      BaseController.error(res, importResult.message, 500);
    }
  }),

  /**
   * Exporta flashcards específicas a Anki
   */
  exportToAnki: BaseController.wrap(async (req, res) => {
    const { flashcardIds } = req.body;

    if (!Array.isArray(flashcardIds) || flashcardIds.length === 0) {
      return BaseController.error(res, 'Se requiere un array de flashcardIds válido', 400);
    }

    // Validar que todos los IDs sean números válidos
    for (const id of flashcardIds) {
      BaseController.validateId(id);
    }

    const exportResult = await flashcardService.exportToAnki(flashcardIds);

    if (exportResult.success) {
      BaseController.success(res, exportResult, exportResult.message);
    } else {
      BaseController.error(res, exportResult.message, 500);
    }
  }),

  /**
   * Obtiene estadísticas de estudio
   */
  getStudyStats: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;

    if (deckId) {
      BaseController.validateId(deckId);
    }

    const statsResult = await flashcardService.getStudyStats(deckId);

    if (statsResult.success) {
      BaseController.success(res, statsResult.data, statsResult.message);
    } else {
      BaseController.error(res, statsResult.message, 500);
    }
  }),

  /**
   * Inicia una sesión de estudio
   */
  startStudySession: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const { limit } = req.query;

    if (deckId) {
      BaseController.validateId(deckId);
    }

    const limitNum = limit ? parseInt(limit) : 20;
    if (limitNum < 1 || limitNum > 100) {
      return BaseController.error(res, 'El límite debe estar entre 1 y 100', 400);
    }

    const sessionResult = await flashcardService.startStudySession(deckId, limitNum);

    if (sessionResult.success) {
      BaseController.success(res, sessionResult.data, sessionResult.message);
    } else {
      BaseController.error(res, sessionResult.message, 500);
    }
  })
};
