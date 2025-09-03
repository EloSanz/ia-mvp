import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import deckRoutes from './routes/deck.routes.js';
import flashcardRoutes from './routes/flashcard.routes.js';
import syncRoutes from './routes/sync.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/sync', syncRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Permitimos este console.log para información de inicio del servidor
  // eslint-disable-next-line no-console
  console.log(`API on :${PORT}`);
});
