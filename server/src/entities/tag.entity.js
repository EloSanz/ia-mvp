/**
 * TagEntity - Entidad para persistencia en base de datos
 * Representa la estructura exacta de la tabla en la base de datos
 */
export class TagEntity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.deckId = data.deckId || null;
    this.deck = data.deck || null;
    this.flashcards = data.flashcards || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static validate(data) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      throw new Error('Tag name is required and must be a non-empty string');
    }
    
    if (!data.deckId || !Number.isInteger(Number(data.deckId))) {
      throw new Error('Deck ID is required and must be a valid integer');
    }

    return {
      name: data.name.trim(),
      deckId: Number(data.deckId)
    };
  }

  toPrisma() {
    return {
      name: this.name,
      deckId: this.deckId
    };
  }
}
