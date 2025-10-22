import {
  asyncHandler,
  createSuccessResponse,
  createListResponse,
  createErrorResponse
} from '../middlewares/error.middleware.js';
import { NotFoundError } from '../utils/custom.errors.js';

/**
 * Controlador base con métodos comunes y manejo de errores
 */
export class BaseController {
  /**
   * Envuelve un método del controlador con asyncHandler
   */
  static wrap(method) {
    return asyncHandler(method);
  }

  /**
   * Respuesta de éxito genérica
   */
  static success(res, data, message = 'Operación exitosa', statusCode = 200) {
    return createSuccessResponse(res, data, message, statusCode);
  }

  /**
   * Respuesta de lista con conteo
   */
  static successList(res, items, message = 'Elementos obtenidos exitosamente') {
    return createListResponse(res, items, message);
  }

  /**
   * Respuesta de error
   */
  static error(res, message, statusCode = 400, errors = null) {
    return createErrorResponse(res, message, statusCode, errors);
  }

  /**
   * Valida y parsea ID de parámetros
   */
  static validateId(id) {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error('ID inválido: debe ser un número');
    }
    return parsedId;
  }

  /**
   * Maneja errores comunes de validación
   */
  static handleValidationError(error) {
    if (error.message && error.message.includes('Errores de validación')) {
      throw error; // Dejar que el middleware lo maneje
    }
    throw error;
  }

  /**
   * Maneja errores de recursos no encontrados
   */
  static handleNotFound(resource = 'Recurso') {
    throw new NotFoundError(resource);
  }

  /**
   * Ejecuta una operación y maneja errores comunes
   */
  static async execute(operation, successMessage = 'Operación exitosa') {
    try {
      const result = await operation();
      return { success: true, data: result, message: successMessage };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Patrón común: Buscar por ID y ejecutar operación
   */
  static async findAndExecute(findFn, id, operation, successMessage = 'Operación exitosa') {
    const entityId = this.validateId(id);
    const entity = await findFn(entityId);

    if (!entity) {
      return this.handleNotFound();
    }

    const result = await operation(entity);
    return { success: true, data: result, message: successMessage };
  }

  /**
   * Patrón común: Crear entidad con validación
   */
  static async createWithValidation(
    validateFn,
    createFn,
    data,
    successMessage = 'Entidad creada exitosamente'
  ) {
    const validatedData = validateFn(data);
    const entity = await createFn(validatedData.toModel());
    return { success: true, data: entity, message: successMessage };
  }

  /**
   * Patrón común: Actualizar entidad con validación
   */
  static async updateWithValidation(
    findFn,
    validateFn,
    updateFn,
    id,
    data,
    successMessage = 'Entidad actualizada exitosamente'
  ) {
    const entityId = this.validateId(id);
    const validatedData = validateFn(data);

    const updatedEntity = await updateFn(entityId, validatedData.toModel());
    return { success: true, data: updatedEntity, message: successMessage };
  }
}
