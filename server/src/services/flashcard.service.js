import { openaiService } from './openai.service.js';
/**
 * Genera flashcards usando OpenAI a partir de texto
 * @param {string} text
 * @returns {Promise<Array<{front: string, back: string}>>}
 */
export async function generateFromAI(text) {
  return await openaiService.generateFlashcards(text);
}
import { AnkiAdapter } from '../adapters/anki.adapter.js';
import { Flashcard } from '../models/flashcard.js';

/**
 * FlashcardService - Servicio para operaciones complejas con flashcards
 * Maneja la integración con adapters externos como Anki
 */
export class FlashcardService {
  constructor() {
    this.ankiAdapter = new AnkiAdapter();
  }

  /**
   * Verifica la conexión con Anki
   */
  async checkAnkiConnection() {
    const isAvailable = await this.ankiAdapter.isAvailable();
    const info = await this.ankiAdapter.getInfo();

    return {
      connected: isAvailable,
      info,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Sincroniza flashcards con Anki
   * @param {number} deckId - ID del deck a sincronizar (opcional)
   */
  async syncWithAnki(deckId = null) {
    try {
      // Obtener flashcards a sincronizar
      let flashcards;
      if (deckId) {
        flashcards = await Flashcard.findByDeckId(deckId);
      } else {
        flashcards = await Flashcard.findAll();
      }

      if (flashcards.length === 0) {
        return {
          success: true,
          message: 'No hay flashcards para sincronizar',
          synced: 0
        };
      }

      // Sincronizar con Anki
      const syncResults = await this.ankiAdapter.syncFlashcards(flashcards);

      return {
        success: true,
        message: `Sincronización completada: ${syncResults.success.length} exitosas, ${syncResults.failed.length} fallidas`,
        results: syncResults,
        total: flashcards.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Error en sincronización: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Importa flashcards desde Anki
   * @param {number} targetDeckId - ID del deck local donde importar
   */
  async importFromAnki(targetDeckId) {
    try {
      const importResults = await this.ankiAdapter.importFlashcards(targetDeckId);

      return {
        success: true,
        message: `Importación completada: ${importResults.imported} flashcards importadas`,
        results: importResults
      };
    } catch (error) {
      return {
        success: false,
        message: `Error en importación: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Exporta flashcards específicas a Anki
   * @param {Array} flashcardIds - IDs de las flashcards a exportar
   */
  async exportToAnki(flashcardIds) {
    try {
      if (!Array.isArray(flashcardIds) || flashcardIds.length === 0) {
        throw new Error('Se requieren IDs de flashcards válidas');
      }

      const exportResults = await this.ankiAdapter.exportFlashcards(flashcardIds);

      return {
        success: true,
        message: `Exportación completada: ${exportResults.success.length} exitosas, ${exportResults.failed.length} fallidas`,
        results: exportResults
      };
    } catch (error) {
      return {
        success: false,
        message: `Error en exportación: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Obtiene estadísticas de estudio
   * @param {number} deckId - ID del deck (opcional)
   */
  async getStudyStats(deckId = null) {
    try {
      const flashcards = deckId ? await Flashcard.findByDeckId(deckId) : await Flashcard.findAll();

      const stats = {
        total: flashcards.length,
        reviewed: flashcards.filter((f) => f.lastReviewed).length,
        due: flashcards.filter((f) => f.isDueForReview()).length,
        byDifficulty: {
          easy: flashcards.filter((f) => f.difficulty === 1).length,
          normal: flashcards.filter((f) => f.difficulty === 2).length,
          hard: flashcards.filter((f) => f.difficulty === 3).length
        },
        averageReviews:
          flashcards.length > 0
            ? flashcards.reduce((sum, f) => sum + f.reviewCount, 0) / flashcards.length
            : 0
      };

      return {
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo estadísticas: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Inicia una sesión de estudio
   * @param {number} deckId - ID del deck (opcional)
   * @param {number} limit - Número máximo de tarjetas (opcional)
   */
  async startStudySession(deckId = null, limit = 20) {
    try {
      const dueCards = await Flashcard.findDueForReview(deckId);

      // Ordenar por prioridad (menos revisadas primero)
      const studyCards = dueCards.sort((a, b) => a.reviewCount - b.reviewCount).slice(0, limit);

      return {
        success: true,
        message: `Sesión de estudio iniciada con ${studyCards.length} tarjetas`,
        data: {
          sessionId: Date.now().toString(),
          totalDue: dueCards.length,
          studyCards: studyCards.length,
          cards: studyCards
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error iniciando sesión de estudio: ${error.message}`,
        error: error.message
      };
    }
  }
}
