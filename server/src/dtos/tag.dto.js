/**
 * TagDto - Data Transfer Object para transferencia de datos
 * Define la estructura de datos que se envía/recibe por las rutas
 */
export class TagDto {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.deckId = data.deckId || null;
    this.flashcardCount = data.flashcards ? data.flashcards.length : 0;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static fromModel(tagModel) {
    return new TagDto({
      id: tagModel.id,
      name: tagModel.name,
      deckId: tagModel.deckId,
      flashcards: tagModel.flashcards,
      createdAt: tagModel.createdAt,
      updatedAt: tagModel.updatedAt
    });
  }
}
