/**
 * Configuración centralizada del sistema de logging
 * Permite configurar niveles de logging, formatos y destinos
 */

import dotenv from 'dotenv';
dotenv.config();

export const loggingConfig = {
  // Nivel general de logging
  level: process.env.LOG_LEVEL || 'info', // 'error', 'warn', 'info', 'debug'

  // Configuración de logging HTTP
  http: {
    enabled: process.env.HTTP_LOGGING_ENABLED !== 'false',
    logRequestBody: process.env.LOG_REQUEST_BODY === 'true',
    logResponseBody: process.env.LOG_RESPONSE_BODY === 'true',
    maxBodyLogLength: parseInt(process.env.MAX_BODY_LOG_LENGTH || '1000'),
    excludePaths: ['/api/health', '/favicon.ico'], // Paths a excluir del logging detallado
  },

  // Configuración de logging de base de datos
  database: {
    enabled: process.env.DB_LOGGING_ENABLED !== 'false',
    logQueries: process.env.DB_LOG_QUERIES !== 'false',
    logSlowQueries: process.env.DB_LOG_SLOW_QUERIES !== 'false',
    slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '100'), // ms
    maxLoggedQueries: parseInt(process.env.DB_MAX_LOGGED_QUERIES || '1000'),
  },

  // Configuración de logging de errores
  errors: {
    enabled: process.env.ERROR_LOGGING_ENABLED !== 'false',
    logStackTrace: process.env.LOG_STACK_TRACE !== 'false',
    includeRequestInfo: process.env.LOG_ERROR_REQUEST_INFO !== 'false',
  },

  // Configuración de colores para consola
  colors: {
    enabled: process.env.LOG_COLORS_ENABLED !== 'false',
    themes: {
      error: '\x1b[31m',    // Rojo
      warn: '\x1b[33m',     // Amarillo
      info: '\x1b[36m',     // Cyan
      debug: '\x1b[35m',    // Magenta
      success: '\x1b[32m',  // Verde
      reset: '\x1b[0m',     // Reset
      bright: '\x1b[1m',    // Bright
    }
  },

  // Configuración de formato
  format: {
    timestampFormat: 'ISO', // 'ISO', 'locale', 'epoch'
    includeTimestamp: true,
    includeLevel: true,
    includeSource: true,
  },

  // Configuración de archivos de log (futuro)
  files: {
    enabled: process.env.LOG_TO_FILES === 'true',
    directory: process.env.LOG_DIRECTORY || './logs',
    maxFileSize: process.env.LOG_MAX_FILE_SIZE || '10mb',
    maxFiles: process.env.LOG_MAX_FILES || '7d', // 7 días
    compress: process.env.LOG_COMPRESS === 'true',
  },

  // Configuración de logging estructurado (JSON)
  structured: {
    enabled: process.env.STRUCTURED_LOGGING === 'true',
    format: 'json', // 'json', 'logfmt', 'text'
  },

  // Configuración de métricas y monitoreo
  metrics: {
    enabled: process.env.LOG_METRICS === 'true',
    collectSystemMetrics: process.env.COLLECT_SYSTEM_METRICS !== 'false',
    collectQueryMetrics: process.env.COLLECT_QUERY_METRICS !== 'false',
  }
};

/**
 * Función helper para determinar si se debe loggear basado en el nivel
 */
export const shouldLog = (messageLevel, configLevel = loggingConfig.level) => {
  const levels = ['error', 'warn', 'info', 'debug'];
  const messageLevelIndex = levels.indexOf(messageLevel);
  const configLevelIndex = levels.indexOf(configLevel);

  return messageLevelIndex <= configLevelIndex;
};

/**
 * Función helper para formatear mensajes de log
 */
export const formatLogMessage = (level, message, data = null, source = null) => {
  const timestamp = new Date().toISOString();
  const colors = loggingConfig.colors.enabled ? loggingConfig.colors.themes : {};
  const levelColor = colors[level] || colors.reset;
  const resetColor = colors.reset;

  let formattedMessage = '';

  if (loggingConfig.structured.enabled) {
    // Formato JSON estructurado
    const logEntry = {
      timestamp,
      level,
      message,
      ...(source && { source }),
      ...(data && { data })
    };
    formattedMessage = JSON.stringify(logEntry);
  } else {
    // Formato de texto legible
    const levelUpper = level.toUpperCase().padEnd(5);
    const sourceInfo = source ? `[${source}]` : '';

    formattedMessage = `${levelColor}${levelUpper}${resetColor} ${timestamp} ${sourceInfo} ${message}`;

    if (data && Object.keys(data).length > 0) {
      formattedMessage += `\n${colors.bright}Data:${resetColor} ${JSON.stringify(data, null, 2)}`;
    }
  }

  return formattedMessage;
};

/**
 * Función helper para determinar si una ruta debe ser excluida del logging
 */
export const shouldExcludePath = (path) => {
  return loggingConfig.http.excludePaths.some(excludePath =>
    path.startsWith(excludePath) || path === excludePath
  );
};

/**
 * Función helper para truncar strings largos
 */
export const truncateString = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

export default loggingConfig;
