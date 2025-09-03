/**
 * FlashcardDto - Data Transfer Object para transferencia de datos
 * Define la estructura de datos que se envía/recibe por las rutas
 */
export class FlashcardDto {
  constructor(data = {}) {
    this.id = data.id || null;
    this.front = data.front || '';
    this.back = data.back || '';
    this.deckId = data.deckId || null;
    this.difficulty = data.difficulty || 2;
    this.lastReviewed = data.lastReviewed || null;
    this.nextReview = data.nextReview || null;
    this.reviewCount = data.reviewCount || 0;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.deck = data.deck || null; // Información del deck relacionado
  }

  /**
   * Crea un DTO desde un modelo de dominio
   */
  static fromModel(flashcardModel) {
    return new FlashcardDto({
      id: flashcardModel.id,
      front: flashcardModel.front,
      back: flashcardModel.back,
      deckId: flashcardModel.deckId,
      difficulty: flashcardModel.difficulty,
      lastReviewed: flashcardModel.lastReviewed,
      nextReview: flashcardModel.nextReview,
      reviewCount: flashcardModel.reviewCount,
      createdAt: flashcardModel.createdAt,
      updatedAt: flashcardModel.updatedAt
    });
  }

  /**
   * Convierte una lista de modelos a DTOs
   */
  static fromModels(flashcardModels) {
    return flashcardModels.map((model) => FlashcardDto.fromModel(model));
  }

  /**
   * Valida los datos de entrada para crear una flashcard
   */
  static validateCreate(data) {
    const errors = [];

    if (!data.front || typeof data.front !== 'string') {
      errors.push('El anverso (front) es requerido y debe ser una cadena de texto');
    } else if (data.front.trim().length === 0) {
      errors.push('El anverso no puede estar vacío');
    } else if (data.front.length > 1000) {
      errors.push('El anverso no puede tener más de 1000 caracteres');
    }

    if (!data.back || typeof data.back !== 'string') {
      errors.push('El reverso (back) es requerido y debe ser una cadena de texto');
    } else if (data.back.trim().length === 0) {
      errors.push('El reverso no puede estar vacío');
    } else if (data.back.length > 1000) {
      errors.push('El reverso no puede tener más de 1000 caracteres');
    }

    if (!data.deckId || typeof data.deckId !== 'number' || data.deckId <= 0) {
      errors.push('El deckId es requerido y debe ser un número positivo');
    }

    if (data.difficulty !== undefined && (data.difficulty < 1 || data.difficulty > 3)) {
      errors.push('La dificultad debe estar entre 1 y 3');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }

    return new FlashcardDto({
      front: data.front.trim(),
      back: data.back.trim(),
      deckId: data.deckId,
      difficulty: data.difficulty || 2
    });
  }

  /**
   * Valida los datos de entrada para actualizar una flashcard
   */
  static validateUpdate(data) {
    const errors = [];

    if (data.front !== undefined) {
      if (typeof data.front !== 'string') {
        errors.push('El anverso debe ser una cadena de texto');
      } else if (data.front.trim().length === 0) {
        errors.push('El anverso no puede estar vacío');
      } else if (data.front.length > 1000) {
        errors.push('El anverso no puede tener más de 1000 caracteres');
      }
    }

    if (data.back !== undefined) {
      if (typeof data.back !== 'string') {
        errors.push('El reverso debe ser una cadena de texto');
      } else if (data.back.trim().length === 0) {
        errors.push('El reverso no puede estar vacío');
      } else if (data.back.length > 1000) {
        errors.push('El reverso no puede tener más de 1000 caracteres');
      }
    }

    if (data.deckId !== undefined) {
      if (typeof data.deckId !== 'number' || data.deckId <= 0) {
        errors.push('El deckId debe ser un número positivo');
      }
    }

    if (data.difficulty !== undefined && (data.difficulty < 1 || data.difficulty > 3)) {
      errors.push('La dificultad debe estar entre 1 y 3');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }

    const updateData = {};
    if (data.front !== undefined) updateData.front = data.front.trim();
    if (data.back !== undefined) updateData.back = data.back.trim();
    if (data.deckId !== undefined) updateData.deckId = data.deckId;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;

    return new FlashcardDto(updateData);
  }

  /**
   * Convierte el DTO a un objeto plano para respuesta JSON
   */
  toResponse() {
    return {
      id: this.id,
      front: this.front,
      back: this.back,
      deckId: this.deckId,
      difficulty: this.difficulty,
      lastReviewed: this.lastReviewed,
      nextReview: this.nextReview,
      reviewCount: this.reviewCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deck: this.deck
    };
  }

  /**
   * Convierte el DTO a formato para el modelo de dominio
   */
  toModel() {
    return {
      id: this.id,
      front: this.front,
      back: this.back,
      deckId: this.deckId,
      difficulty: this.difficulty,
      lastReviewed: this.lastReviewed,
      nextReview: this.nextReview,
      reviewCount: this.reviewCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * DTOs específicos para respuestas de la API
 */
export class FlashcardResponseDto extends FlashcardDto {
  constructor(data = {}) {
    super(data);
  }

  static success(flashcardModel, message = 'Operación exitosa') {
    return {
      success: true,
      message,
      data: FlashcardDto.fromModel(flashcardModel).toResponse()
    };
  }

  static successList(flashcardModels, message = 'Flashcards obtenidas exitosamente') {
    return {
      success: true,
      message,
      data: FlashcardDto.fromModels(flashcardModels).map((dto) => dto.toResponse()),
      count: flashcardModels.length
    };
  }

  static successStats(stats, message = 'Estadísticas obtenidas exitosamente') {
    return {
      success: true,
      message,
      data: stats
    };
  }
}

export class FlashcardErrorDto {
  static error(message, statusCode = 400) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }

  static notFound(resource = 'Flashcard') {
    return FlashcardErrorDto.error(`${resource} no encontrada`, 404);
  }

  static validationError(errors) {
    return {
      success: false,
      message: 'Errores de validación',
      errors: Array.isArray(errors) ? errors : [errors],
      statusCode: 400,
      timestamp: new Date().toISOString()
    };
  }

  static deckNotFound() {
    return FlashcardErrorDto.error('El deck especificado no existe', 400);
  }
}
