import Joi from 'joi';

/**
 * FlashcardDto - Data Transfer Object para transferencia de datos
 * Define la estructura de datos que se envía/recibe por las rutas
 */
export class FlashcardDto {
  // Esquemas de validación con Joi
  static createSchema = Joi.object({
    front: Joi.string()
      .trim()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'El anverso (front) es requerido y no puede estar vacío',
        'string.max': 'El anverso no puede tener más de 1000 caracteres',
        'any.required': 'El anverso (front) es requerido'
      }),

    back: Joi.string()
      .trim()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'El reverso (back) es requerido y no puede estar vacío',
        'string.max': 'El reverso no puede tener más de 1000 caracteres',
        'any.required': 'El reverso (back) es requerido'
      }),

    deckId: Joi.alternatives()
      .try(
        Joi.number().integer().positive(),
        Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value))
      )
      .required()
      .messages({
        'number.base': 'El deckId debe ser un número positivo',
        'number.integer': 'El deckId debe ser un número entero',
        'number.positive': 'El deckId debe ser un número positivo',
        'any.required': 'El deckId es requerido'
      }),

    difficulty: Joi.number()
      .integer()
      .min(1)
      .max(3)
      .default(2)
      .messages({
        'number.base': 'La dificultad debe ser un número',
        'number.integer': 'La dificultad debe ser un número entero',
        'number.min': 'La dificultad debe estar entre 1 y 3 (1=fácil, 2=normal, 3=difícil)',
        'number.max': 'La dificultad debe estar entre 1 y 3 (1=fácil, 2=normal, 3=difícil)'
      }),

    tagId: Joi.alternatives()
      .try(
        Joi.number().integer().positive().allow(null),
        Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value)).allow(null)
      )
      .optional()
      .messages({
        'number.base': 'El tagId debe ser un número positivo o null',
        'number.integer': 'El tagId debe ser un número entero',
        'number.positive': 'El tagId debe ser un número positivo'
      })
  });

  static updateSchema = Joi.object({
    front: Joi.string()
      .trim()
      .min(1)
      .max(1000)
      .messages({
        'string.empty': 'El anverso no puede estar vacío',
        'string.max': 'El anverso no puede tener más de 1000 caracteres'
      }),

    back: Joi.string()
      .trim()
      .min(1)
      .max(1000)
      .messages({
        'string.empty': 'El reverso no puede estar vacío',
        'string.max': 'El reverso no puede tener más de 1000 caracteres'
      }),

    deckId: Joi.alternatives()
      .try(
        Joi.number().integer().positive(),
        Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value))
      )
      .messages({
        'number.base': 'El deckId debe ser un número positivo',
        'number.integer': 'El deckId debe ser un número entero',
        'number.positive': 'El deckId debe ser un número positivo'
      }),

    difficulty: Joi.number()
      .integer()
      .min(1)
      .max(3)
      .messages({
        'number.base': 'La dificultad debe ser un número',
        'number.integer': 'La dificultad debe ser un número entero',
        'number.min': 'La dificultad debe estar entre 1 y 3 (1=fácil, 2=normal, 3=difícil)',
        'number.max': 'La dificultad debe estar entre 1 y 3 (1=fácil, 2=normal, 3=difícil)'
      }),

    tagId: Joi.alternatives()
      .try(
        Joi.number().integer().positive().allow(null),
        Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value)).allow(null)
      )
      .messages({
        'number.base': 'El tagId debe ser un número positivo o null',
        'number.integer': 'El tagId debe ser un número entero',
        'number.positive': 'El tagId debe ser un número positivo'
      })
  }).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

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
    this.tag = data.tag || null; // Objeto TagDto
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
      tagId: flashcardModel.tagId,
      tag: flashcardModel.tag,
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
   * Valida los datos de entrada para crear una flashcard usando Joi
   */
  static validateCreate(data) {
    const { error, value } = this.createSchema.validate(data, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return {
        success: false,
        errors: errors,
        message: 'Errores de validación en los datos enviados'
      };
    }

    return {
      success: true,
      data: new FlashcardDto(value)
    };
  }

  /**
   * Valida los datos de entrada para actualizar una flashcard usando Joi
   */
  static validateUpdate(data, existingId = null) {
    const { error, value } = this.updateSchema.validate(data, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return {
        success: false,
        errors: errors,
        message: 'Errores de validación en los datos enviados'
      };
    }

    // Para update, necesitamos incluir el ID existente
    return {
      success: true,
      data: new FlashcardDto({ ...value, id: existingId })
    };
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
      deck: this.deck,
      tagId: this.tagId,
      tag: this.tag
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
      tagId: this.tagId,
      difficulty: this.difficulty,
      lastReviewed: this.lastReviewed,
      nextReview: this.nextReview,
      reviewCount: this.reviewCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convierte el DTO a un objeto para update (sin ID)
   */
  toUpdateModel() {
    const model = this.toModel();
    // No incluir el ID en updates para evitar conflictos
    delete model.id;
    delete model.createdAt; // Tampoco incluir createdAt
    return model;
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
