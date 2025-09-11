import { Flashcard } from '../models/flashcard.js';
import { FlashcardDto } from '../dtos/flashcard.dto.js';
import { BaseController } from './base.controller.js';
import { generateFromAI } from '../services/flashcard.service.js';

export const FlashcardController = {
  /**
   * Busca flashcards por consigna (front) dentro de un deck
   */
  searchFlashcardsInDeck: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const q = req.query.q || '';
    const page = parseInt(req.query.page || '0');
    const pageSize = parseInt(req.query.pageSize || '15');
    const parsedDeckId = BaseController.validateId(deckId);
    const { items, total } = await Flashcard.searchByDeckIdAndFront(parsedDeckId, q, { page, pageSize });
    res.json({ success: true, data: items, total, page, pageSize, message: 'Búsqueda de flashcards en deck' });
  }),
  /**
   * Obtiene todas las flashcards
   */
  getAllFlashcards: BaseController.wrap(async (req, res) => {
    const flashcards = await Flashcard.findAll();
    BaseController.successList(res, flashcards, 'Flashcards obtenidas exitosamente');
  }),

  /**
   * Obtiene una flashcard por ID
   */
  getFlashcardById: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const result = await BaseController.findAndExecute(
      Flashcard.findById.bind(Flashcard),
      id,
      (flashcard) => flashcard,
      'Flashcard obtenida exitosamente'
    );

    if (result.success) {
      BaseController.success(res, result.data, result.message);
    }
  }),

  /**
   * Crea una nueva flashcard
   */
  createFlashcard: BaseController.wrap(async (req, res) => {
    const result = await BaseController.createWithValidation(
      FlashcardDto.validateCreate.bind(FlashcardDto),
      Flashcard.create.bind(Flashcard),
      req.body,
      'Flashcard creada exitosamente'
    );

    BaseController.success(res, result.data, result.message, 201);
  }),

  /**
   * Actualiza una flashcard existente
   */
  updateFlashcard: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const result = await BaseController.updateWithValidation(

      Flashcard.findById.bind(Flashcard),
      FlashcardDto.validateUpdate.bind(FlashcardDto),
      Flashcard.update.bind(Flashcard),
      id,
      req.body,
      'Flashcard actualizada exitosamente'
    );

    BaseController.success(res, result.data, result.message);
  }),

  /**
   * Elimina una flashcard
   */
  deleteFlashcard: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const result = await BaseController.findAndExecute(
      Flashcard.findById.bind(Flashcard),
      id,
      () => Flashcard.delete(BaseController.validateId(id)),
      'Flashcard eliminada exitosamente'
    );

    if (result.success) {
      BaseController.success(res, null, result.message);
    }
  }),

  /**
   * Obtiene flashcards por deckId
   */
  getFlashcardsByDeck: BaseController.wrap(async (req, res) => {
  const { deckId } = req.params;
  const parsedDeckId = BaseController.validateId(deckId);
  const page = parseInt(req.query.page || '0');
  const pageSize = parseInt(req.query.pageSize || '15');
  const { items, total } = await Flashcard.findByDeckId(parsedDeckId, { page, pageSize });
  res.json({ success: true, data: items, total, page, pageSize, message: 'Flashcards del deck obtenidas exitosamente' });
  }),

  /**
   * Obtiene flashcards que necesitan revisión
   */
  getDueFlashcards: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    let flashcards;

    if (deckId) {
      const parsedDeckId = BaseController.validateId(deckId);
      flashcards = await Flashcard.findDueForReview(parsedDeckId);
    } else {
      flashcards = await Flashcard.findDueForReview();
    }

    BaseController.successList(res, flashcards, 'Flashcards para revisión obtenidas exitosamente');
  }),

  /**
   * Marca una flashcard como revisada
   */
  markAsReviewed: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const { difficulty } = req.body;

    // Validar dificultad si se proporciona
    if (difficulty !== undefined && (difficulty < 1 || difficulty > 3)) {
      return BaseController.error(res, 'La dificultad debe estar entre 1 y 3', 400, [
        'Dificultad inválida'
      ]);
    }

    const reviewedFlashcard = await Flashcard.markAsReviewed(
      BaseController.validateId(id),
      difficulty
    );
    BaseController.success(res, reviewedFlashcard, 'Flashcard marcada como revisada exitosamente');
  }),

  /**
   * Genera flashcards usando OpenAI a partir de texto
   */
  generateAIFlashcards: async (req, res, next) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Texto requerido para generar flashcards.' });
      }

      // Llama al servicio que integra OpenAI
      const generatedCards = await generateFromAI(text);
      return res.status(200).json({ flashcards: generatedCards });
    } catch (error) {
      console.error('Error generando flashcards con IA:', error);
      return res.status(500).json({ error: 'Error generando flashcards con IA.' });
    }
  },

  /**
   * Busca flashcards por contenido
   */
  /**
   * Crea múltiples flashcards
   */
  createManyFlashcards: BaseController.wrap(async (req, res) => {
    const { flashcards } = req.body;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return BaseController.error(res, 'Se requiere un array de flashcards', 400, [
        'Array de flashcards vacío o inválido'
      ]);
    }

    // Validar cada flashcard
    const validatedFlashcards = [];
    for (const flashcard of flashcards) {
      try {
        const validatedData = await FlashcardDto.validateCreate(flashcard);
        validatedFlashcards.push(validatedData);
      } catch (err) {
        return BaseController.error(res, 'Error de validación en una o más flashcards', 400, err.errors);
      }
    }

    // Crear todas las flashcards
    const createdFlashcards = await Promise.all(
      validatedFlashcards.map(flashcard => Flashcard.create(flashcard))
    );

    BaseController.success(
      res,
      createdFlashcards,
      `${createdFlashcards.length} flashcards creadas exitosamente`,
      201
    );
  }),

  searchFlashcards: BaseController.wrap(async (req, res) => {
    const { q: searchTerm, deckId } = req.query;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return BaseController.error(res, 'El término de búsqueda es requerido', 400, [
        'Término de búsqueda vacío'
      ]);
    }

    let flashcards;
    if (deckId) {
      const parsedDeckId = BaseController.validateId(deckId);
      flashcards = await Flashcard.findByDeckId(parsedDeckId).then((cards) =>
        cards.filter(
          (card) =>
            card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.back.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      // Buscar en todas las flashcards (implementación simplificada)
      const allFlashcards = await Flashcard.findAll();
      flashcards = allFlashcards.filter(
        (card) =>
          card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.back.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    BaseController.successList(res, flashcards, 'Búsqueda completada exitosamente');
  })
};
