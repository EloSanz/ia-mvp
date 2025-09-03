import { BaseAdapter } from './base.adapter.js';
import { Flashcard } from '../models/flashcard.js';

/**
 * AnkiAdapter - Adapter para integración con Anki/AnkiConnect
 * Implementa la interfaz BaseAdapter para Anki
 */
export class AnkiAdapter extends BaseAdapter {
  constructor(options = {}) {
    super();
    this.host = options.host || 'http://localhost:8765';
    this.version = options.version || 6;
    this.timeout = options.timeout || 5000;
  }

  /**
   * Verifica si AnkiConnect está disponible
   */
  async isAvailable() {
    try {
      const response = await this._makeRequest('version', {});
      return response !== null;
    } catch (error) {
      console.warn('AnkiConnect no está disponible:', error.message);
      return false;
    }
  }

  /**
   * Obtiene información de Anki
   */
  async getInfo() {
    try {
      const version = await this._makeRequest('version', {});
      const decks = await this._makeRequest('deckNames', {});
      const modelNames = await this._makeRequest('modelNames', {});

      return {
        version,
        decks,
        models: modelNames,
        available: true
      };
    } catch (error) {
      return {
        error: error.message,
        available: false
      };
    }
  }

  /**
   * Sincroniza flashcards con Anki
   * @param {Array} flashcards - Array de flashcards locales
   */
  async syncFlashcards(flashcards) {
    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (const flashcard of flashcards) {
      try {
        // Verificar si la flashcard ya existe en Anki
        const existingCard = await this._findCardInAnki(flashcard);

        if (existingCard) {
          // Actualizar flashcard existente
          await this._updateCardInAnki(existingCard, flashcard);
          results.success.push({
            id: flashcard.id,
            action: 'updated',
            ankiId: existingCard.cardId
          });
        } else {
          // Crear nueva flashcard en Anki
          const ankiCardId = await this._createCardInAnki(flashcard);
          results.success.push({
            id: flashcard.id,
            action: 'created',
            ankiId: ankiCardId
          });
        }
      } catch (error) {
        results.failed.push({
          id: flashcard.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Importa flashcards desde Anki
   * @param {number} deckId - ID del deck local donde importar
   */
  async importFlashcards(deckId) {
    try {
      // Obtener todos los decks de Anki
      const ankiDecks = await this._makeRequest('deckNames', {});

      if (!ankiDecks || ankiDecks.length === 0) {
        throw new Error('No se encontraron decks en Anki');
      }

      const importedCards = [];

      for (const ankiDeckName of ankiDecks) {
        // Obtener tarjetas del deck
        const cardsInfo = await this._makeRequest('findCards', {
          query: `deck:"${ankiDeckName}"`
        });

        if (!cardsInfo || cardsInfo.length === 0) {
          continue;
        }

        // Obtener información detallada de cada tarjeta
        const cardsDetails = await this._makeRequest('cardsInfo', {
          cards: cardsInfo.slice(0, 10) // Limitar para evitar sobrecarga
        });

        for (const cardDetail of cardsDetails) {
          try {
            // Crear flashcard local desde la tarjeta de Anki
            const flashcardData = {
              front: cardDetail.fields.Front?.value || 'Sin frente',
              back: cardDetail.fields.Back?.value || 'Sin reverso',
              deckId: deckId,
              difficulty: this._mapAnkiIntervalToDifficulty(cardDetail.interval),
              reviewCount: cardDetail.reps || 0
            };

            const newFlashcard = await Flashcard.create(flashcardData);
            importedCards.push(newFlashcard);
          } catch (error) {
            console.warn(`Error importando tarjeta ${cardDetail.cardId}:`, error.message);
          }
        }
      }

      return {
        success: true,
        imported: importedCards.length,
        cards: importedCards
      };
    } catch (error) {
      throw new Error(`Error importando desde Anki: ${error.message}`);
    }
  }

  /**
   * Exporta flashcards locales a Anki
   * @param {Array} flashcardIds - IDs de las flashcards a exportar
   */
  async exportFlashcards(flashcardIds) {
    const results = {
      success: [],
      failed: []
    };

    for (const flashcardId of flashcardIds) {
      try {
        const flashcard = await Flashcard.findById(flashcardId);
        if (!flashcard) {
          results.failed.push({
            id: flashcardId,
            error: 'Flashcard no encontrada'
          });
          continue;
        }

        const ankiCardId = await this._createCardInAnki(flashcard);
        results.success.push({
          id: flashcardId,
          ankiId: ankiCardId
        });
      } catch (error) {
        results.failed.push({
          id: flashcardId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Actualiza el progreso de revisión en Anki
   * @param {number} flashcardId - ID de la flashcard local
   * @param {number} difficulty - Dificultad percibida (1-3)
   */
  async updateReviewProgress(flashcardId, difficulty) {
    try {
      const flashcard = await Flashcard.findById(flashcardId);
      if (!flashcard) {
        throw new Error('Flashcard no encontrada');
      }

      // Buscar la tarjeta correspondiente en Anki
      const ankiCard = await this._findCardInAnki(flashcard);
      if (!ankiCard) {
        throw new Error('Tarjeta no encontrada en Anki');
      }

      // Actualizar el progreso en Anki
      const ease = this._mapDifficultyToAnkiEase(difficulty);
      await this._makeRequest('answerCards', {
        answers: [
          {
            cardId: ankiCard.cardId,
            ease: ease
          }
        ]
      });

      // Marcar como revisada localmente
      const updatedFlashcard = await Flashcard.markAsReviewed(flashcardId, difficulty);

      return {
        success: true,
        flashcard: updatedFlashcard,
        ankiCardId: ankiCard.cardId
      };
    } catch (error) {
      throw new Error(`Error actualizando progreso en Anki: ${error.message}`);
    }
  }

  /**
   * Método privado para hacer requests a AnkiConnect
   */
  async _makeRequest(action, params = {}) {
    try {
      const response = await fetch(this.host, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          version: this.version,
          params
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.result;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error('Timeout conectando con AnkiConnect');
      }
      throw error;
    }
  }

  /**
   * Busca una flashcard en Anki por contenido
   */
  async _findCardInAnki(flashcard) {
    try {
      // Buscar por contenido del frente
      const cards = await this._makeRequest('findCards', {
        query: `"${flashcard.front.substring(0, 50)}"`
      });

      if (cards && cards.length > 0) {
        return {
          cardId: cards[0],
          found: true
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Crea una nueva tarjeta en Anki
   */
  async _createCardInAnki(flashcard) {
    // Asegurarse de que existe el deck en Anki
    await this._ensureDeckExists(flashcard);

    const note = {
      deckName: `Deck_${flashcard.deckId}`,
      modelName: 'Basic',
      fields: {
        Front: flashcard.front,
        Back: flashcard.back
      },
      tags: [`flashcard_${flashcard.id}`, `deck_${flashcard.deckId}`]
    };

    const result = await this._makeRequest('addNote', { note });
    return result;
  }

  /**
   * Actualiza una tarjeta existente en Anki
   */
  async _updateCardInAnki(ankiCard, flashcard) {
    await this._makeRequest('updateNoteFields', {
      note: {
        id: ankiCard.cardId,
        fields: {
          Front: flashcard.front,
          Back: flashcard.back
        }
      }
    });
  }

  /**
   * Asegura que el deck existe en Anki
   */
  async _ensureDeckExists(flashcard) {
    const deckName = `Deck_${flashcard.deckId}`;

    try {
      await this._makeRequest('createDeck', { deck: deckName });
    } catch (error) {
      // El deck ya existe o error creando, continuar
    }
  }

  /**
   * Mapea dificultad local (1-3) a ease de Anki (1-4)
   */
  _mapDifficultyToAnkiEase(difficulty) {
    const easeMap = {
      1: 1, // Again
      2: 2, // Hard
      3: 3 // Good
    };
    return easeMap[difficulty] || 2;
  }

  /**
   * Mapea intervalo de Anki a dificultad local
   */
  _mapAnkiIntervalToDifficulty(interval) {
    if (interval <= 1) return 3; // Nueva o fácil
    if (interval <= 7) return 2; // Normal
    return 1; // Difícil
  }
}
