/**
 * Middleware de logging para requests HTTP y responses
 * Proporciona información detallada sobre las requests entrantes y salientes
 */

import { performance } from 'perf_hooks';
import { loggingConfig, shouldLog, formatLogMessage, shouldExcludePath, truncateString } from '../config/logging.config.js';

/**
 * Colores para los logs en consola (usando configuración centralizada)
 */
const colors = loggingConfig.colors.themes;

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
  // Verificar si el path debe ser excluido
  if (shouldExcludePath(req.path)) {
    return next();
  }

  const startTime = performance.now();
  const startTimestamp = Date.now();

  // Guardar referencia original del método end
  const originalEnd = res.end;
  const originalWrite = res.write;
  const chunks = [];

  // Interceptar la escritura de la response
  res.write = function(chunk) {
    if (chunk) chunks.push(chunk);
    return originalWrite.apply(this, arguments);
  };

  // Interceptar el final de la response para logging
  res.end = function(chunk) {
    if (chunk) chunks.push(chunk);

    // Calcular tamaño de la response
    const responseSize = chunks.reduce((total, chunk) => {
      return total + (Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk.toString(), 'utf8'));
    }, 0);

    const requestInfo = formatRequestLog(req, startTimestamp);
    const responseInfo = formatResponseLog(res, startTimestamp);

    // Solo loggear si está habilitado
    if (loggingConfig.http.enabled && shouldLog('info')) {
      // Log detallado del request
      console.log(`${colors.cyan}[REQUEST]${colors.reset} ${colors.bright}${requestInfo.method}${colors.reset} ${requestInfo.url}`);
      console.log(`  ${colors.yellow}→${colors.reset} IP: ${requestInfo.ip}`);
      console.log(`  ${colors.yellow}→${colors.reset} User-Agent: ${truncateString(requestInfo.userAgent, 50)}`);
      console.log(`  ${colors.yellow}→${colors.reset} Content-Length: ${requestInfo.contentLength} bytes`);
      console.log(`  ${colors.yellow}→${colors.reset} Timestamp: ${requestInfo.timestamp}`);

      // Log detallado de la response
      console.log(`${responseInfo.statusColor}[RESPONSE]${colors.reset} ${responseInfo.statusCode} ${colors.bright}${requestInfo.url}${colors.reset}`);
      console.log(`  ${colors.green}←${colors.reset} Response-Time: ${responseInfo.responseTime}`);
      console.log(`  ${colors.green}←${colors.reset} Content-Length: ${responseSize} bytes`);
      console.log(`  ${colors.green}←${colors.reset} Timestamp: ${new Date().toISOString()}`);
      console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    }

    // Restaurar método original y llamar
    return originalEnd.apply(this, arguments);
  };

  next();
};

/**
 * Middleware para logging específico de rutas de API
 * Solo loggea requests que van a /api/*
 */
export const apiLogger = (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const startTime = Date.now();

  // Log solo para rutas de API
  console.log(`${colors.blue}[API]${colors.reset} ${colors.bright}${req.method}${colors.reset} ${req.path}`);

  // Log de body si existe (útil para debugging)
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    const bodyLog = JSON.stringify(req.body, null, 2);
    console.log(`  ${colors.magenta}Body:${colors.reset} ${bodyLog.substring(0, 500)}${bodyLog.length > 500 ? '...' : ''}`);
  }

  // Log de query parameters si existen
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`  ${colors.cyan}Query:${colors.reset} ${JSON.stringify(req.query)}`);
  }

  // Log de route parameters si existen
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`  ${colors.yellow}Params:${colors.reset} ${JSON.stringify(req.params)}`);
  }

  // Interceptar la response para logging de API
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;

    if (data && typeof data === 'object') {
      const isSuccess = data.success !== false;
      const statusColor = isSuccess ? colors.green : colors.red;
      const statusIcon = isSuccess ? '✅' : '❌';

      console.log(`${statusColor}[API RESPONSE]${colors.reset} ${statusIcon} ${responseTime}ms`);

      // Log de datos de respuesta (limitado para evitar logs muy largos)
      if (data.message) {
        console.log(`  ${colors.white}Message:${colors.reset} ${data.message}`);
      }

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log(`  ${colors.white}Data:${colors.reset} Array with ${data.data.length} items`);
      } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        const dataKeys = Object.keys(data.data);
        console.log(`  ${colors.white}Data:${colors.reset} Object with keys: ${dataKeys.join(', ')}`);
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Middleware para logging de errores detallado
 */
export const errorLogger = (error, req, res, next) => {
  const timestamp = new Date().toISOString();

  console.error(`${colors.red}[ERROR]${colors.reset} ${colors.bright}${timestamp}${colors.reset}`);
  console.error(`  ${colors.red}→${colors.reset} Method: ${req.method}`);
  console.error(`  ${colors.red}→${colors.reset} URL: ${req.originalUrl || req.url}`);
  console.error(`  ${colors.red}→${colors.reset} IP: ${req.ip || req.connection.remoteAddress}`);
  console.error(`  ${colors.red}→${colors.reset} Error: ${error.message}`);
  console.error(`  ${colors.red}→${colors.reset} Stack: ${error.stack}`);
  console.error(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  next(error);
};

/**
 * Función helper para logging personalizado
 */
export const customLogger = {
  info: (message, data = null) => {
    console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
    if (data) console.log(`  ${colors.white}Data:${colors.reset}`, data);
  },

  warn: (message, data = null) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${message}`);
    if (data) console.warn(`  ${colors.white}Data:${colors.reset}`, data);
  },

  error: (message, error = null) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`  ${colors.red}→${colors.reset} Message: ${error.message}`);
        console.error(`  ${colors.red}→${colors.reset} Stack: ${error.stack}`);
      } else {
        console.error(`  ${colors.red}→${colors.reset}`, error);
      }
    }
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${colors.magenta}[DEBUG]${colors.reset} ${message}`);
      if (data) console.debug(`  ${colors.white}Data:${colors.reset}`, data);
    }
  }
};

export default {
  requestLogger,
  apiLogger,
  errorLogger,
  customLogger
};
