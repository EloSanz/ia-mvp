import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import deckRoutes from './routes/deck.routes.js';
import tagRoutes from './routes/tag.routes.js';
import flashcardRoutes from './routes/flashcard.routes.js';
import syncRoutes from './routes/sync.routes.js';
import authRoutes from './routes/auth.routes.js';
import studyRoutes from './routes/study.routes.js';
import loggingRoutes from './routes/logging.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { requestLogger, apiLogger, errorLogger } from './middlewares/logging.middleware.js';
import { getQueryStats } from './config/database.js';
import { swaggerUi, specs } from './config/swagger.config.js';
import { BaseController } from './controllers/base.controller.js';

const app = express();

// Middlewares de logging (deben ir antes de otros middlewares)
app.use(requestLogger); // Logging general de HTTP requests
app.use(apiLogger);     // Logging específico de API

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b4151 }
  `,
  customSiteTitle: 'iCards API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Health check route
app.get('/api/health', (_req, res) => BaseController.success(res, { ok: true }, 'Health check exitoso'));

// Enhanced health check with logging info
app.get('/api/health/detailed', (req, res) => {
  const stats = getQueryStats();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    message: 'Health check detallado',
    data: {
      server: {
        uptime: `${Math.floor(uptime)}s`,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      database: {
        totalQueries: stats.totalQueries,
        slowQueries: stats.slowQueriesCount,
        status: 'connected'
      },
      logging: {
        enabled: true,
        level: 'detailed',
        features: ['http_requests', 'db_queries', 'errors', 'api_responses']
      }
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes); // Middleware de auth aplicado dentro del router
app.use('/api/decks', authMiddleware, tagRoutes);  // Tags integradas con decks
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/logging', loggingRoutes);
// Tags legacy (deprecated)
app.use('/api/tags', authMiddleware, tagRoutes);

// Middleware de logging de errores
app.use(errorLogger);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Permitimos este console.log para información de inicio del servidor
  // eslint-disable-next-line no-console
  console.log(`API on :${PORT}`);
});
