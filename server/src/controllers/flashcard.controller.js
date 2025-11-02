import { Flashcard } from '../models/flashcard.js';
import { FlashcardDto } from '../dtos/flashcard.dto.js';
import { BaseController } from './base.controller.js';
import { generateFromAI } from '../services/flashcard.service.js';

export const FlashcardController = {
  /**
   * @swagger
   * /api/flashcards/deck/{deckId}/search:
   *   get:
   *     summary: Search flashcards by front content within a deck
   *     description: Searches for flashcards in a specific deck by their front (question) content
   *     tags: [Flashcards]
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to search in
   *         example: 1
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query for flashcard front content
   *         example: "hello"
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Page number for pagination
   *         example: 0
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 15
   *         description: Number of items per page
   *         example: 15
   *     responses:
   *       200:
   *         description: Search completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Flashcard'
   *                 total:
   *                   type: integer
   *                   example: 25
   *                 page:
   *                   type: integer
   *                   example: 0
   *                 pageSize:
   *                   type: integer
   *                   example: 15
   *                 message:
   *                   type: string
   *                   example: Búsqueda de flashcards en deck
   *       400:
   *         description: Bad request - Invalid deck ID or parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  searchFlashcardsInDeck: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const q = req.query.q || '';
    const page = parseInt(req.query.page || '0');
    const pageSize = parseInt(req.query.pageSize || '15');
    const parsedDeckId = BaseController.validateId(deckId);
    const { items, total } = await Flashcard.searchByDeckIdAndFront(parsedDeckId, q, {
      page,
      pageSize
    });
    res.json({
      success: true,
      data: items,
      total,
      page,
      pageSize,
      message: 'Búsqueda de flashcards en deck'
    });
  }),
  /**
   * @swagger
   * /api/flashcards:
   *   get:
   *     summary: Get all flashcards
   *     description: Retrieves all flashcards for the authenticated user
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Flashcards retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Flashcards obtenidas exitosamente
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Flashcard'
   *                 count:
   *                   type: integer
   *                   example: 150
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: Unauthorized - Token not provided or invalid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getAllFlashcards: BaseController.wrap(async (req, res) => {
    const flashcards = await Flashcard.findAll();
    BaseController.successList(res, flashcards, 'Flashcards obtenidas exitosamente');
  }),

  /**
   * @swagger
   * /api/flashcards/{id}:
   *   get:
   *     summary: Get a flashcard by ID
   *     description: Retrieves a specific flashcard by its ID
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Flashcard ID to retrieve
   *         example: 1
   *     responses:
   *       200:
   *         description: Flashcard retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Flashcard obtenida exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Flashcard'
   *       401:
   *         description: Unauthorized - Token not provided or invalid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Flashcard not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
   * @swagger
   * /api/flashcards:
   *   post:
   *     summary: Create a new flashcard
   *     description: Creates a new flashcard with front/back content and associates it with a deck
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateFlashcardRequest'
   *           example:
   *             front: "Hello"
   *             back: "Hola"
   *             deckId: 1
   *             difficulty: 2
   *             tags: ["greeting", "basic"]
   *     responses:
   *       201:
   *         description: Flashcard created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Flashcard creada exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Flashcard'
   *       400:
   *         description: Bad request - Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - Token not provided or invalid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
   * @swagger
   * /api/flashcards/{id}:
   *   put:
   *     summary: Update an existing flashcard
   *     description: Updates a flashcard's information
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Flashcard ID to update
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateFlashcardRequest'
   *     responses:
   *       200:
   *         description: Flashcard updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Flashcard actualizada exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Flashcard'
   *       400:
   *         description: Bad request - Invalid input data
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Flashcard not found
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
   * @swagger
   * /api/flashcards/{id}:
   *   delete:
   *     summary: Delete a flashcard
   *     description: Deletes a flashcard by its ID
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Flashcard ID to delete
   *         example: 1
   *     responses:
   *       200:
   *         description: Flashcard deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Flashcard eliminada exitosamente
   *                 data:
   *                   type: null
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Flashcard not found
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
      BaseController.success(res, undefined, result.message);
    }
  }),

  /**
   * Obtiene flashcards por deckId, opcionalmente filtradas por tagId
   */
  getFlashcardsByDeck: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const parsedDeckId = BaseController.validateId(deckId);
    const page = parseInt(req.query.page || '0');
    const pageSize = parseInt(req.query.pageSize || '15');
    const tagId = req.query.tagId ? parseInt(req.query.tagId) : null;

    let items, total;
    if (tagId) {
      // Filtrar por deck y tag
      const flashcards = await Flashcard.findByDeckIdAndTag(parsedDeckId, tagId);
      // Implementar paginación manual para resultados filtrados
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      items = flashcards.slice(startIndex, endIndex);
      total = flashcards.length;
    } else {
      // Obtener todas las cards del deck
      ({ items, total } = await Flashcard.findByDeckId(parsedDeckId, { page, pageSize }));
    }

    res.json({
      success: true,
      data: items,
      total,
      page,
      pageSize,
      message: tagId ? 'Flashcards del deck filtradas por tag obtenidas exitosamente' : 'Flashcards del deck obtenidas exitosamente'
    });
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
  generateAIFlashcards: async (req, res, _next) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Texto requerido para generar flashcards.' });
      }

      // Llama al servicio que integra OpenAI
      const generatedCards = await generateFromAI(text);
      console.log("🚀 ~ generateAIFlashcards:", generatedCards)
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
    // Ayuda de depuración: muestra cómo llega el cuerpo
    console.log('POST /api/flashcards/batch req.body:', req.body);

    const { flashcards } = req.body;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      // Mensaje adicional para ayudar al frontend
      console.warn('⚠️ Estructura esperada: { flashcards: [ ... ] }');
      return BaseController.error(res, 'Se requiere un array de flashcards en la propiedad "flashcards" del body. Ejemplo: { flashcards: [ ... ] }', 400, [
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
        return BaseController.error(
          res,
          'Error de validación en una o más flashcards',
          400,
          err.errors
        );
      }
    }

    // Crear todas las flashcards
    const createdFlashcards = await Promise.all(
      validatedFlashcards.map((flashcard) => Flashcard.create(flashcard))
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
