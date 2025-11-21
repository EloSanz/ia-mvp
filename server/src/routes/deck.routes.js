import { Router } from 'express';
import { DeckController } from '../controllers/deck.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload, handleMulterError } from '../config/multer.config.js';

const router = Router();

// Proteger todas las rutas de decks
router.use(authMiddleware);

router.get('/', DeckController.getAllDecks);
router.get('/mcp', DeckController.getAllDecksForMcp);
router.get('/flashcards-count', DeckController.getAllFlashcardsCount);
router.get('/untagged-flashcards-count', DeckController.getAllUntaggedFlashcardsCount);
router.get('/:deckId/tag-count', DeckController.getDeckTagCount);
router.get('/:deckId/flashcards-by-tag', DeckController.getDeckFlashcardsByTag);
router.get('/:deckId/untagged-flashcards-count', DeckController.getDeckUntaggedFlashcardsCount);
router.get('/:id', DeckController.getDeckById);
router.post('/', DeckController.createDeck);
router.put('/:id', DeckController.updateDeck);
router.delete('/:id', DeckController.deleteDeck);

// Rutas para generación con IA
router.post('/suggest-topics', DeckController.suggestTopics);
router.post('/generate-with-ai', DeckController.generateDeckWithAI);

// Ruta para generación desde documento (PDF/Word)
router.post('/generate-from-document', 
  upload.single('document'), 
  handleMulterError,
  DeckController.generateDeckFromDocument
);

// Rutas para biblioteca
router.patch('/:id/visibility', DeckController.updateVisibility);
router.post('/:id/clone', DeckController.cloneDeck);

export default router;
