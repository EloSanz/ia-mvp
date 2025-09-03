/**
 * BaseAdapter - Clase base para todos los adapters
 * Define la interfaz común que deben implementar todos los adapters
 */
export class BaseAdapter {
  constructor() {
    if (this.constructor === BaseAdapter) {
      throw new Error('BaseAdapter no puede ser instanciado directamente');
    }
  }

  /**
   * Verifica si el adapter está disponible/conectado
   */
  async isAvailable() {
    throw new Error('Método isAvailable debe ser implementado por la subclase');
  }

  /**
   * Obtiene información del adapter
   */
  async getInfo() {
    throw new Error('Método getInfo debe ser implementado por la subclase');
  }

  /**
   * Sincroniza flashcards locales con el servicio externo
   */
  async syncFlashcards(_flashcards) {
    throw new Error('Método syncFlashcards debe ser implementado por la subclase');
  }

  /**
   * Importa flashcards desde el servicio externo
   */
  async importFlashcards(_deckId) {
    throw new Error('Método importFlashcards debe ser implementado por la subclase');
  }

  /**
   * Exporta flashcards locales al servicio externo
   */
  async exportFlashcards(_flashcardIds) {
    throw new Error('Método exportFlashcards debe ser implementado por la subclase');
  }

  /**
   * Actualiza el progreso de revisión en el servicio externo
   */
  async updateReviewProgress(_flashcardId, _difficulty) {
    throw new Error('Método updateReviewProgress debe ser implementado por la subclase');
  }
}
