/**
 * Middleware de logging para requests HTTP y responses
 * Proporciona información detallada sobre las requests entrantes y salientes
 */

import { performance } from 'perf_hooks';
import { loggingConfig, shouldLog, formatLogMessage, shouldExcludePath, truncateString } from '../config/logging.config.js';

/**
 * Colores para los logs en consola (usando configuración centralizada)
 */
const colors = loggingConfig?.colors?.themes || {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

/**
 * Formatea la información del request para logging
 */
const formatRequestLog = (req, startTime) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  const contentLength = req.get('Content-Length') || '0';
  const responseTime = startTime ? `${Date.now() - startTime}ms` : 'N/A';

  return {
    timestamp,
    method,
    url,
    userAgent: userAgent.substring(0, 100), // Limitar longitud
    ip,
    contentLength,
    responseTime,
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[PRESENT]' : '[NOT PRESENT]',
      'user-agent': userAgent
    }
  };
};

/**
 * Formatea la información del response para logging
 */
const formatResponseLog = (res, startTime) => {
  const statusCode = res.statusCode;
  const contentLength = res.get('Content-Length') || '0';
  const responseTime = startTime ? `${Date.now() - startTime}ms` : 'N/A';

  return {
    statusCode,
    contentLength,
    responseTime,
    statusColor: getStatusColor(statusCode)
  };
};

/**
 * Obtiene el color apropiado para el código de estado HTTP
 */
const getStatusColor = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) return colors.green;
  if (statusCode >= 300 && statusCode < 400) return colors.yellow;
  if (statusCode >= 400 && statusCode < 500) return colors.red;
  if (statusCode >= 500) return colors.red;
  return colors.white;
};

/**
 * Middleware principal de logging para requests HTTP
 * Registra información detallada de cada request y response
 */
export const requestLogger = (req, res, next) => {
  // Excluir requests OPTIONS (CORS preflight) y paths específicos
  if (req.method === 'OPTIONS' || shouldExcludePath(req.path)) {
    return next();
  }

  const startTime = performance.now();
  const startTimestamp = Date.now();

  // Interceptar el final de la response para logging
  const originalEnd = res.end;

  res.end = function(chunk) {
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // Loggear TODOS los métodos HTTP (GET, POST, PUT, DELETE) con info mínima
    const shouldLogRequest = (
      req.method === 'GET' ||
      req.method === 'POST' ||
      req.method === 'PUT' ||
      req.method === 'DELETE'
    );

    if (shouldLogRequest && loggingConfig?.http?.enabled && shouldLog('info')) {
      // Log mínimo: método URL status
      const statusColor = statusCode >= 400 ? colors.red :
                         statusCode >= 300 ? colors.yellow : colors.green;

      console.log(`${colors.cyan}${method}${colors.reset} ${url} ${statusColor}${statusCode}${colors.reset}`);
    }

    return originalEnd.apply(this, arguments);
  };

  next();
};

/**
 * Middleware para logging específico de rutas de API
 * Solo loggea requests que van a /api/* y son importantes
 */
export const apiLogger = (req, res, next) => {
  // Solo procesar rutas de API y excluir health checks
  if (!req.path.startsWith('/api/') || req.path.includes('/health')) {
    return next();
  }

  // Interceptar la response para logging de errores de API
  const originalJson = res.json;
  res.json = function(data) {
    // Solo loggear errores de API
    if (data && typeof data === 'object' && data.success === false) {
      const statusCode = res.statusCode;
      const method = req.method;
      const url = req.originalUrl || req.url;

      console.log(`${colors.red}API ERROR${colors.reset} ${method} ${url} ${statusCode} - ${data.message || 'Unknown error'}`);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Middleware para logging de errores detallado
 */
export const errorLogger = (error, req, res, next) => {
  // Solo loggear errores críticos (no 404, etc.)
  if (error.statusCode && error.statusCode < 500) {
    return next(error);
  }

  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';

  console.error(`${colors.red}ERROR${colors.reset} ${method} ${url} ${ip} - ${error.message}`);

  // Solo mostrar stack trace en desarrollo
  if (process.env.NODE_ENV === 'development' && error.stack) {
    console.error(`${colors.gray}${error.stack.split('\n')[1]}${colors.reset}`);
  }

  next(error);
};

/**
 * Función helper para logging personalizado
 */
export const customLogger = {
  info: (message, data = null) => {
    if (data) {
      console.log(`${colors.blue}INFO${colors.reset} ${message} - ${JSON.stringify(data)}`);
    } else {
      console.log(`${colors.blue}INFO${colors.reset} ${message}`);
    }
  },

  warn: (message, data = null) => {
    if (data) {
      console.log(`${colors.yellow}WARN${colors.reset} ${message} - ${JSON.stringify(data)}`);
    } else {
      console.log(`${colors.yellow}WARN${colors.reset} ${message}`);
    }
  },

  error: (message, error = null) => {
    if (error instanceof Error) {
      console.error(`${colors.red}ERROR${colors.reset} ${message} - ${error.message}`);
    } else if (error) {
      console.error(`${colors.red}ERROR${colors.reset} ${message} - ${error}`);
    } else {
      console.error(`${colors.red}ERROR${colors.reset} ${message}`);
    }
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      if (data) {
        console.log(`${colors.magenta}DEBUG${colors.reset} ${message} - ${JSON.stringify(data)}`);
      } else {
        console.log(`${colors.magenta}DEBUG${colors.reset} ${message}`);
      }
    }
  }
};

export default {
  requestLogger,
  apiLogger,
  errorLogger,
  customLogger
};
