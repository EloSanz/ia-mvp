/**
 * Configuración centralizada de la base de datos con Prisma
 * Incluye logging detallado de queries para debugging y monitoreo
 */

import { PrismaClient } from '@prisma/client';
import { customLogger } from '../middlewares/logging.middleware.js';

// Configuración de logging de Prisma
const prismaConfig = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
};

// Crear instancia de Prisma con configuración de logging
const prisma = new PrismaClient(prismaConfig);

// Variables para tracking de queries
let queryCount = 0;
let slowQueries = [];

// Event listener para queries
prisma.$on('query', (e) => {
  queryCount++;
  const duration = e.duration;
  const query = e.query;
  const params = e.params;

  // Log de queries normales
  customLogger.info(`[DB QUERY] #${queryCount} - ${duration}ms`, {
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    duration,
    timestamp: new Date().toISOString()
  });

  // Log detallado si está en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`  ${'\x1b[36m'}SQL:${'\x1b[0m'} ${query}`);
    if (params && params !== '[]') {
      console.log(`  ${'\x1b[35m'}Params:${'\x1b[0m'} ${params}`);
    }
  }

  // Track de queries lentas (>100ms)
  if (duration > 100) {
    slowQueries.push({
      query: query.substring(0, 200),
      duration,
      timestamp: new Date().toISOString()
    });

    customLogger.warn(`[SLOW QUERY] ${duration}ms - ${query.substring(0, 50)}...`);
  }

  // Limpiar slow queries antiguas (mantener solo las últimas 50)
  if (slowQueries.length > 50) {
    slowQueries = slowQueries.slice(-25);
  }
});

// Event listener para errores de DB
prisma.$on('error', (e) => {
  customLogger.error('[DB ERROR]', {
    message: e.message,
    target: e.target,
    timestamp: new Date().toISOString()
  });
});

// Event listener para información general
prisma.$on('info', (e) => {
  customLogger.info('[DB INFO]', e.message);
});

// Event listener para warnings
prisma.$on('warn', (e) => {
  customLogger.warn('[DB WARN]', e.message);
});

// Función para obtener estadísticas de queries
export const getQueryStats = () => {
  return {
    totalQueries: queryCount,
    slowQueriesCount: slowQueries.length,
    recentSlowQueries: slowQueries.slice(-5), // Últimas 5 queries lentas
    timestamp: new Date().toISOString()
  };
};

// Función para resetear estadísticas
export const resetQueryStats = () => {
  queryCount = 0;
  slowQueries = [];
  customLogger.info('[DB STATS] Estadísticas reseteadas');
};

// Función para loggear estadísticas periódicamente
export const logPeriodicStats = () => {
  const stats = getQueryStats();
  customLogger.info('[DB STATS] Estadísticas periódicas', stats);

  // Log detallado de queries lentas si hay
  if (stats.slowQueriesCount > 0) {
    console.log(`\x1b[33m[DB STATS] Últimas queries lentas:\x1b[0m`);
    stats.recentSlowQueries.forEach((query, index) => {
      console.log(`  ${index + 1}. ${query.duration}ms - ${query.query.substring(0, 60)}...`);
    });
  }
};

// Logging periódico de estadísticas
const LOGGING_INTERVAL = process.env.LOGGING_STATS_INTERVAL || 5 * 60 * 1000; // 5 minutos por defecto

if (LOGGING_INTERVAL > 0) {
  setInterval(() => {
    logPeriodicStats();
  }, LOGGING_INTERVAL);

  customLogger.info(`[DB] Logging periódico de estadísticas activado cada ${LOGGING_INTERVAL / 1000} segundos`);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  customLogger.info('[DB] Cerrando conexión a la base de datos...');
  await prisma.$disconnect();
});

process.on('SIGTERM', async () => {
  customLogger.info('[DB] Cerrando conexión a la base de datos...');
  await prisma.$disconnect();
});

// Exportar la instancia configurada
export default prisma;
