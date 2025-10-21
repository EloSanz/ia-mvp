import { Router } from 'express';
import { DeckController } from '../controllers/deck.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Proteger todas las rutas de decks
router.use(authMiddleware);

router.get('/', DeckController.getAllDecks);
router.get('/:id', DeckController.getDeckById);
router.post('/', DeckController.createDeck);
router.put('/:id', DeckController.updateDeck);
router.delete('/:id', DeckController.deleteDeck);

// Rutas para generación con IA
router.post('/suggest-topics', DeckController.suggestTopics);
router.post('/generate-with-ai', DeckController.generateDeckWithAI);

export default router;
