import express from 'express';
import { LibraryController } from '../controllers/library.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/library - Obtener todos los decks públicos
router.get('/', LibraryController.getAllPublicDecks);

// GET /api/library/:deckId - Obtener preview de un deck público
router.get('/:deckId', LibraryController.getPublicDeckPreview);

export default router;

