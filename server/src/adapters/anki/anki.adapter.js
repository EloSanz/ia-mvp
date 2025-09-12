import { BaseAdapter } from '../base.adapter.js';
import { servicesConfig } from '../../config/services.config.js';
import { AnkiConnectError } from './anki.errors.js';
import { ankiMapper } from './anki.mapper.js';

export class AnkiAdapter extends BaseAdapter {
  constructor() {
    super();
    this.config = servicesConfig.anki;
    this.baseUrl = `http://${this.config.host}:${this.config.port}`;
  }

  /**
   * Realiza una llamada a la API de Anki Connect
   */
  async _invoke(action, params = {}, version = 6) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey })
        },
        body: JSON.stringify({ action, version, params })
      });

      const data = await response.json();

      if (data.error) {
        throw new AnkiConnectError(data.error);
      }

      return data.result;
    } catch (error) {
      if (error instanceof AnkiConnectError) {
        throw error;
      }
      throw new AnkiConnectError('Error connecting to Anki', { cause: error });
    }
  }

  async isAvailable() {
    if (!this.config.enabled) {
      return false;
    }

    try {
      await this._invoke('version');
      return true;
    } catch {
      return false;
    }
  }

  async getInfo() {
    const [version, decks, models] = await Promise.all([
      this._invoke('version'),
      this._invoke('deckNames'),
      this._invoke('modelNames')
    ]);

    return {
      version,
      decks,
      models,
      isConnected: true
    };
  }

  async syncFlashcards(flashcards) {
    const ankiNotes = flashcards.map(ankiMapper.toAnkiNote);

    // Asegurarse de que el deck existe
    const deckName = this.config.defaultDeckName;
    await this._invoke('createDeck', { deck: deckName });

    // Crear las notas en Anki
    const result = await this._invoke('addNotes', {
      notes: ankiNotes.map((note) => ({
        ...note,
        deckName
      }))
    });

    return result;
  }

  async importFlashcards(deckId) {
    // Obtener notas del deck en Anki
    const notes = await this._invoke('findNotes', {
      query: `deck:${this.config.defaultDeckName}`
    });

    // Obtener información detallada de las notas
    const notesInfo = await this._invoke('notesInfo', {
      notes
    });

    // Convertir notas de Anki a nuestro formato
    return notesInfo.map((note) => ankiMapper.fromAnkiNote(note, deckId));
  }

  async exportFlashcards(_flashcardIds) {
    // Implementar exportación específica a Anki
    throw new Error('Método no implementado');
  }

  async updateReviewProgress(_flashcardId, _difficulty) {
    // Implementar actualización de progreso en Anki
    throw new Error('Método no implementado');
  }
}
