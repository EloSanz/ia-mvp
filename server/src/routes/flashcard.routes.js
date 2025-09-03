import { Router } from 'express';
import { FlashcardController } from '../controllers/flashcard.controller.js';

const router = Router();

/**
 * @route GET /api/flashcards
 * @desc Obtiene todas las flashcards
 * @access Public
 */
router.get('/', FlashcardController.getAllFlashcards);

/**
 * @route GET /api/flashcards/search?q=termino&deckId=1
 * @desc Busca flashcards por contenido
 * @access Public
 */
router.get('/search', FlashcardController.searchFlashcards);

/**
 * @route GET /api/flashcards/due
 * @desc Obtiene flashcards que necesitan revisión
 * @access Public
 */
router.get('/due', FlashcardController.getDueFlashcards);

/**
 * @route GET /api/flashcards/due/:deckId
 * @desc Obtiene flashcards que necesitan revisión por deck
 * @access Public
 */
router.get('/due/:deckId', FlashcardController.getDueFlashcards);

/**
 * @route GET /api/flashcards/deck/:deckId
 * @desc Obtiene todas las flashcards de un deck específico
 * @access Public
 */
router.get('/deck/:deckId', FlashcardController.getFlashcardsByDeck);

/**
 * @route GET /api/flashcards/:id
 * @desc Obtiene una flashcard por ID
 * @access Public
 */
router.get('/:id', FlashcardController.getFlashcardById);

/**
 * @route POST /api/flashcards
 * @desc Crea una nueva flashcard
 * @access Public
 * @body {string} front - Anverso de la flashcard (requerido)
 * @body {string} back - Reverso de la flashcard (requerido)
 * @body {number} deckId - ID del deck (requerido)
 * @body {number} difficulty - Dificultad (1-3, opcional, default: 2)
 */
router.post('/', FlashcardController.createFlashcard);
router.post('/batch', FlashcardController.createManyFlashcards);

/**
 * @route PUT /api/flashcards/:id
 * @desc Actualiza una flashcard existente
 * @access Public
 * @body {string} front - Anverso de la flashcard
 * @body {string} back - Reverso de la flashcard
 * @body {number} deckId - ID del deck
 * @body {number} difficulty - Dificultad (1-3)
 */
router.put('/:id', FlashcardController.updateFlashcard);

/**
 * @route PUT /api/flashcards/:id/review
 * @desc Marca una flashcard como revisada
 * @access Public
 * @body {number} difficulty - Dificultad percibida (1-3)
 */
router.put('/:id/review', FlashcardController.markAsReviewed);

/**
 * @route DELETE /api/flashcards/:id
 * @desc Elimina una flashcard
 * @access Public
 */
router.delete('/:id', FlashcardController.deleteFlashcard);

export default router;
