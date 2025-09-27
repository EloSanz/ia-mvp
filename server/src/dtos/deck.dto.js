/**
 * DeckDto - Data Transfer Object para transferencia de datos
 * Define la estructura de datos que se envía/recibe por las rutas
 */
export class DeckDto {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.coverUrl = data.coverUrl || null;
    this.generateCover = data.generateCover ?? false;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Crea un DTO desde un modelo de dominio
   */
  static fromModel(deckModel) {
    return new DeckDto({
      id: deckModel.id,
      name: deckModel.name,
      description: deckModel.description,
      coverUrl: deckModel.coverUrl,
      createdAt: deckModel.createdAt,
      updatedAt: deckModel.updatedAt
    });
  }

  /**
   * Convierte una lista de modelos a DTOs
   */
  static fromModels(deckModels) {
    return deckModels.map((model) => DeckDto.fromModel(model));
  }

  /**
   * Valida los datos de entrada para crear un deck
   */
  static validateCreate(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string') {
      errors.push('El nombre es requerido y debe ser una cadena de texto');
    } else if (data.name.trim().length === 0) {
      errors.push('El nombre no puede estar vacío');
    } else if (data.name.length > 255) {
      errors.push('El nombre no puede tener más de 255 caracteres');
    }

    if (data.description && typeof data.description !== 'string') {
      errors.push('La descripción debe ser una cadena de texto');
    } else if (data.description && data.description.length > 1000) {
      errors.push('La descripción no puede tener más de 1000 caracteres');
    }

    if (typeof data.generateCover !== 'undefined' && typeof data.generateCover !== 'boolean') {
      errors.push('El parámetro generateCover debe ser booleano');
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }

    return new DeckDto({
      name: data.name.trim(),
      description: data.description ? data.description.trim() : ''
    });
  }

  /**
   * Valida los datos de entrada para actualizar un deck
   */
  static validateUpdate(data) {
    const errors = [];

    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        errors.push('El nombre debe ser una cadena de texto');
      } else if (data.name.trim().length === 0) {
        errors.push('El nombre no puede estar vacío');
      } else if (data.name.length > 255) {
        errors.push('El nombre no puede tener más de 255 caracteres');
      }
    }

    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('La descripción debe ser una cadena de texto');
      } else if (data.description.length > 1000) {
        errors.push('La descripción no puede tener más de 1000 caracteres');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();

    return new DeckDto(updateData);
  }

  /**
   * Convierte el DTO a un objeto plano para respuesta JSON
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convierte el DTO a formato para el modelo de dominio
   */
  toModel() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * DTOs específicos para respuestas de la API
 */
export class DeckResponseDto extends DeckDto {
  constructor(data = {}) {
    super(data);
  }

  static success(deckModel, message = 'Operación exitosa') {
    return {
      success: true,
      message,
      data: DeckDto.fromModel(deckModel).toResponse()
    };
  }

  static successList(deckModels, message = 'Operación exitosa') {
    return {
      success: true,
      message,
      data: DeckDto.fromModels(deckModels).map((dto) => dto.toResponse()),
      count: deckModels.length
    };
  }
}

export class DeckErrorDto {
  static error(message, statusCode = 400) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }

  static notFound(resource = 'Deck') {
    return DeckErrorDto.error(`${resource} no encontrado`, 404);
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
}
