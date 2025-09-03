/**
 * Mapea entre el formato de nuestras flashcards y el formato de Anki
 */
export const ankiMapper = {
  /**
   * Convierte una flashcard nuestra a una nota de Anki
   */
  toAnkiNote(flashcard) {
    return {
      modelName: 'Basic', // Usar el modelo básico de Anki
      fields: {
        Front: flashcard.front,
        Back: flashcard.back
      },
      options: {
        allowDuplicate: false,
        duplicateScope: 'deck'
      },
      tags: ['ia-flashcards']
    };
  },

  /**
   * Convierte una nota de Anki a nuestro formato de flashcard
   */
  fromAnkiNote(ankiNote, deckId) {
    return {
      front: ankiNote.fields.Front.value,
      back: ankiNote.fields.Back.value,
      deckId: deckId,
      externalId: ankiNote.noteId.toString(),
      reviewCount: ankiNote.reviews || 0,
      difficulty: this._mapAnkiDifficulty(ankiNote.factor)
    };
  },

  /**
   * Mapea el factor de dificultad de Anki a nuestra escala
   * Anki usa un factor de 1300-2500, nosotros usamos 1-3
   */
  _mapAnkiDifficulty(ankiFactor) {
    if (!ankiFactor) return 2; // default
    if (ankiFactor < 1800) return 3; // difícil
    if (ankiFactor > 2200) return 1; // fácil
    return 2; // normal
  }
};
