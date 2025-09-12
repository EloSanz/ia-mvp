/**
 * FlashcardEntity - Entidad para persistencia en base de datos
 * Representa la estructura exacta de la tabla en la base de datos
 */
export class FlashcardEntity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.front = data.front || '';
    this.back = data.back || '';
    this.deckId = data.deckId || null;
    this.difficulty = data.difficulty || 2;
    this.lastReviewed = data.lastReviewed || null;
    this.nextReview = data.nextReview || null;
    this.reviewCount = data.reviewCount || 0;
    this.tagId = data.tagId || null;
    this.tag = data.tag || null; // Objeto TagEntity
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Convierte la entidad a formato plano para Prisma
   */
  toPrisma() {
    return {
      id: this.id,
      front: this.front,
      back: this.back,
      deckId: this.deckId,
      difficulty: this.difficulty,
      lastReviewed: this.lastReviewed,
      nextReview: this.nextReview,
      reviewCount: this.reviewCount,
      tagId: this.tagId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Crea una instancia desde datos de Prisma
   */
  static fromPrisma(prismaData) {
    return new FlashcardEntity({
      id: prismaData.id,
      front: prismaData.front,
      back: prismaData.back,
      deckId: prismaData.deckId,
      difficulty: prismaData.difficulty,
      lastReviewed: prismaData.lastReviewed,
      nextReview: prismaData.nextReview,
      reviewCount: prismaData.reviewCount,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt
    });
  }

  /**
   * Valida los datos de la entidad
   */
  validate() {
    if (!this.front || this.front.trim().length === 0) {
      throw new Error('El anverso (front) de la flashcard es requerido');
    }
    if (!this.back || this.back.trim().length === 0) {
      throw new Error('El reverso (back) de la flashcard es requerido');
    }
    if (!this.deckId || this.deckId <= 0) {
      throw new Error('El deckId es requerido y debe ser un número positivo');
    }

    // Validar campos opcionales
    if (this.difficulty !== undefined && (this.difficulty < 1 || this.difficulty > 3)) {
      throw new Error('La dificultad debe estar entre 1 y 3');
    }
    if (this.reviewCount !== undefined && this.reviewCount < 0) {
      throw new Error('El conteo de revisiones no puede ser negativo');
    }

    // Limites de longitud
    if (this.front.length > 1000) {
      throw new Error('El anverso no puede tener más de 1000 caracteres');
    }
    if (this.back.length > 1000) {
      throw new Error('El reverso no puede tener más de 1000 caracteres');
    }
  }

  /**
   * Actualiza la fecha de última revisión y incrementa el contador
   */
  markAsReviewed(difficulty = null) {
    this.lastReviewed = new Date();
    this.reviewCount += 1;

    if (difficulty !== null && difficulty >= 1 && difficulty <= 3) {
      this.difficulty = difficulty;
    }

    // Calcular próxima revisión basada en dificultad (algoritmo simple)
    const daysMultiplier = {
      1: 1, // Fácil: revisar en 1 día
      2: 3, // Normal: revisar en 3 días
      3: 7 // Difícil: revisar en 7 días
    };

    const days = daysMultiplier[this.difficulty] || 3;
    this.nextReview = new Date();
    this.nextReview.setDate(this.nextReview.getDate() + days);
  }
}
