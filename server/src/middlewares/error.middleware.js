import { DeckErrorDto } from '../dtos/deck.dto.js';

/**
 * Middleware global para manejo de errores
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Error capturado por middleware:', error);

  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return next(error);
  }

  // Manejar diferentes tipos de errores
  if (error.message && error.message.includes('Errores de validación')) {
    // Errores de validación de DTO
    const errorResponse = DeckErrorDto.validationError(error.message);
    return res.status(400).json(errorResponse);
  }

  if (error.message && error.message.includes('Deck no encontrado')) {
    // Errores de recursos no encontrados
    const errorResponse = DeckErrorDto.notFound();
    return res.status(404).json(errorResponse);
  }

  if (error.code === 'P2025') {
    // Error de Prisma: registro no encontrado
    const errorResponse = DeckErrorDto.notFound();
    return res.status(404).json(errorResponse);
  }

  // Error genérico del servidor
  const errorResponse = DeckErrorDto.error(
    process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  );
  res.status(500).json(errorResponse);
};

/**
 * Wrapper para funciones asíncronas que captura errores automáticamente
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Función helper para crear respuestas de éxito consistentes
 */
export const createSuccessResponse = (
  res,
  data,
  message = 'Operación exitosa',
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  // Agregar data si existe
  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Función helper para crear respuestas de lista con conteo
 */
export const createListResponse = (res, items, message = 'Elementos obtenidos exitosamente') => {
  const response = {
    success: true,
    message,
    data: items,
    count: Array.isArray(items) ? items.length : 0,
    timestamp: new Date().toISOString()
  };

  return res.json(response);
};

/**
 * Función helper para crear respuestas de error
 */
export const createErrorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  return res.status(statusCode).json(response);
};
