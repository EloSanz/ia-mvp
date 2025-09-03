import { Router } from 'express';
import { DeckController } from '../controllers/deck.controller.js';

const router = Router();

router.get('/', DeckController.getAllDecks);
router.get('/:id', DeckController.getDeckById);
router.post('/', DeckController.createDeck);
router.put('/:id', DeckController.updateDeck);
router.delete('/:id', DeckController.deleteDeck);

export default router;
