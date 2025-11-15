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
import libraryRoutes from './routes/library.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { requestLogger, apiLogger, errorLogger } from './middlewares/logging.middleware.js';
import { getQueryStats } from './config/database.js';
import { swaggerUi, specs } from './config/swagger.config.js';
import { BaseController } from './controllers/base.controller.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';

// Define __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Root route for health checks
app.get('/', (_req, res) => res.status(200).send('API is running.'));

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
app.use('/api/library', libraryRoutes);
// Tags legacy (deprecated)
app.use('/api/tags', authMiddleware, tagRoutes);

// Middleware de logging de errores
app.use(errorLogger);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  // Permitimos este console.log para información de inicio del servidor
  // eslint-disable-next-line no-console
  console.log(`API on :${PORT}`);

  // Ejecutar la migración de imágenes en segundo plano DESPUÉS de que el servidor haya arrancado.
  runImageMigrationInBackground();
});

// Usamos el directorio temporal del sistema operativo (os.tmpdir()) para el archivo de bandera.
// Esto asegura que funcione tanto en Windows (local) como en Linux (Docker/Azure).
const migrationFlagPath = path.join(os.tmpdir(), 'icards_migration_done.txt');

async function runImageMigrationInBackground() {
  if (!fs.existsSync(migrationFlagPath)) {
    console.log('Ejecutando script de migración de imágenes a Cloudinary...');

    try {
      // Usamos un import() dinámico para ejecutar el script como un módulo separado.
      await import('../scripts/migrate_images_to_cloudinary.js');
      fs.writeFileSync(migrationFlagPath, 'La migración se ejecutó el ' + new Date().toISOString());
      console.log('Migración registrada y en proceso.');
      console.log('Proceso de verificación de migración completado y registrado.');
    } catch (error) {
      console.error('Error durante la migración:', error);
    }
  } else {
    console.log('La migración de sistema de imagenes ya se ejecutó previamente.');
  }
}

export default server; // Exportar el servidor para pruebas de integración
