import express from 'express';
import { getQueryStats, resetQueryStats, logPeriodicStats } from '../config/database.js';
import { customLogger } from '../middlewares/logging.middleware.js';

const router = express.Router();

/**
 * @route GET /api/logging/stats
 * @desc Obtiene estadísticas de queries de base de datos
 * @access Private/Admin
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getQueryStats();
    customLogger.info('[API] Estadísticas de queries solicitadas', { ip: req.ip });

    res.json({
      success: true,
      message: 'Estadísticas de queries obtenidas exitosamente',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    customLogger.error('[API] Error obteniendo estadísticas', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

/**
 * @route POST /api/logging/reset-stats
 * @desc Resetea las estadísticas de queries
 * @access Private/Admin
 */
router.post('/reset-stats', (req, res) => {
  try {
    resetQueryStats();
    customLogger.info('[API] Estadísticas reseteadas manualmente', { ip: req.ip });

    res.json({
      success: true,
      message: 'Estadísticas reseteadas exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    customLogger.error('[API] Error reseteando estadísticas', error);
    res.status(500).json({
      success: false,
      message: 'Error reseteando estadísticas',
      error: error.message
    });
  }
});

/**
 * @route POST /api/logging/log-stats
 * @desc Fuerza el logging de estadísticas actuales
 * @access Private/Admin
 */
router.post('/log-stats', (req, res) => {
  try {
    logPeriodicStats();
    customLogger.info('[API] Logging de estadísticas forzado', { ip: req.ip });

    res.json({
      success: true,
      message: 'Estadísticas loggeadas exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    customLogger.error('[API] Error forzando logging de estadísticas', error);
    res.status(500).json({
      success: false,
      message: 'Error forzando logging de estadísticas',
      error: error.message
    });
  }
});

/**
 * @route GET /api/logging/health
 * @desc Endpoint de health check con información de logging
 * @access Public
 */
router.get('/health', (req, res) => {
  const stats = getQueryStats();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    message: 'Servicio de logging operativo',
    data: {
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      },
      database: {
        totalQueries: stats.totalQueries,
        slowQueries: stats.slowQueriesCount,
        status: 'connected'
      },
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
