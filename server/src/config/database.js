/**
 * Configuración centralizada de la base de datos con Prisma
 * Incluye logging detallado de queries para debugging y monitoreo
 */

import { PrismaClient } from '@prisma/client';
import { customLogger } from '../middlewares/logging.middleware.js';
import { loggingConfig } from './logging.config.js';

// Configuración de logging de Prisma (solo si está habilitado)
const prismaConfig = loggingConfig.database.enabled ? {
  log: [
    ...(loggingConfig.database.logQueries ? [{
      emit: 'event',
      level: 'query',
    }] : []),
    {
      emit: 'event',
      level: 'error',
    },
    ...(process.env.NODE_ENV === 'development' ? [{
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    }] : []),
  ],
} : {};

// Crear instancia de Prisma con configuración de logging
const prisma = new PrismaClient(prismaConfig);

// Variables para tracking de queries
let queryCount = 0;
let slowQueries = [];

// Event listener para queries (solo si está habilitado)
if (loggingConfig.database.enabled) {
  prisma.$on('query', (e) => {
    queryCount++;
    const duration = e.duration;
    const query = e.query;

    // Solo loggear queries lentas según configuración
    if (loggingConfig.database.logSlowQueries && duration > loggingConfig.database.slowQueryThreshold) {
      slowQueries.push({
        query: query.substring(0, 100),
        duration,
        timestamp: new Date().toISOString()
      });

      customLogger.warn(`SLOW QUERY ${duration}ms - ${query.substring(0, 50)}...`);
    }

    // Limpiar slow queries antiguas
    if (slowQueries.length > loggingConfig.database.maxLoggedQueries) {
      slowQueries = slowQueries.slice(-Math.floor(loggingConfig.database.maxLoggedQueries / 2));
    }
  });
}

// Event listener para errores de DB
prisma.$on('error', (e) => {
  customLogger.error(`DB ERROR: ${e.message}`);
});

// Event listener para información general (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  prisma.$on('info', (e) => {
    customLogger.info(`DB INFO: ${e.message}`);
  });

  prisma.$on('warn', (e) => {
    customLogger.warn(`DB WARN: ${e.message}`);
  });
}

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

// Logging periódico de estadísticas (solo si está habilitado)
const LOGGING_INTERVAL = process.env.LOGGING_STATS_INTERVAL || 60 * 60 * 1000; // 1 hora por defecto

if (loggingConfig.database.enabled && LOGGING_INTERVAL > 0) {
  setInterval(() => {
    const stats = getQueryStats();
    if (stats.slowQueriesCount > 0) {
      customLogger.info(`DB STATS: ${stats.totalQueries} queries, ${stats.slowQueriesCount} slow`);
    }
  }, LOGGING_INTERVAL);
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
