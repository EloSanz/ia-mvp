import { CustomError } from '../utils/custom.errors.js';

/**
 * Middleware global para manejo de errores
 */
export const errorHandler = (error, req, res, next) => {
  // Log interno para debug, nunca mostrar al usuario
  if (process.env.NODE_ENV === 'development') {
    console.error('Error capturado por middleware:', error);
  }

  if (res.headersSent) {
    return next(error);
  }

  // Error personalizado
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      ...(error.errors ? { errors: error.errors } : {})
    });
  }

  // Prisma: recurso no encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado',
      statusCode: 404,
      timestamp: new Date().toISOString()
    });
  }

  // Errores de autenticación y validación
  if (error.name === 'AuthError' || error.name === 'ValidationError') {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Error de autenticación/validación',
      statusCode: error.statusCode || 400,
      timestamp: new Date().toISOString(),
      ...(error.errors ? { errors: error.errors } : {})
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    statusCode: 500,
    timestamp: new Date().toISOString()
  });
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
