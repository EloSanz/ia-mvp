import express from 'express';
import { TagController } from '../controllers/tag.controller.js';

const router = express.Router();

// Nuevas rutas nested bajo /decks/:deckId
router.get('/:deckId/tags', TagController.getByDeckId);
router.get('/:deckId/tags/:tagId', TagController.getById);
router.post('/:deckId/tags', TagController.create);
router.put('/:deckId/tags/:tagId', TagController.update);
router.delete('/:deckId/tags/:tagId', TagController.delete);

// Rutas legacy (deprecated) - mantener temporalmente para compatibilidad
router.get('/tags', TagController.getAll);

export default router;
