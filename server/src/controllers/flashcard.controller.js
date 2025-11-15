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
   *           default: 50
   *         description: Number of items per page
   *         example: 50
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
   *                   example: 50
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
   *                   example: 500
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
    // Validar datos de entrada
    const validation = FlashcardDto.validateCreate(req.body);

    if (!validation.success) {
      return BaseController.error(res, validation.message, 400, validation.errors);
    }

    // Crear flashcard
    const newFlashcard = await Flashcard.create(validation.data.toModel());

    BaseController.success(res, newFlashcard, 'Flashcard creada exitosamente', 201);
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

    // Verificar que la flashcard existe
    const existingFlashcard = await Flashcard.findById(id);
    if (!existingFlashcard) {
      return BaseController.error(res, 'Flashcard no encontrada', 404);
    }

    // Validar datos de entrada
    const validation = FlashcardDto.validateUpdate(req.body, id);

    if (!validation.success) {
      return BaseController.error(res, validation.message, 400, validation.errors);
    }

    // Actualizar flashcard
    const updatedFlashcard = await Flashcard.update(id, validation.data.toUpdateModel());

    BaseController.success(res, updatedFlashcard, 'Flashcard actualizada exitosamente');
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
   * @swagger
   * /api/flashcards/deck/{deckId}:
   *   get:
   *     summary: Get flashcards by deck ID
   *     description: Retrieves flashcards for a specific deck with optional pagination and tag filtering
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to get flashcards for
   *         example: 1
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
   *           default: 50
   *         description: Number of items per page
   *         example: 50
   *       - in: query
   *         name: all
   *         schema:
   *           type: string
   *           enum: [true]
   *         description: Set to 'true' to get ALL flashcards without pagination
   *         example: true
   *       - in: query
   *         name: tagId
   *         schema:
   *           type: integer
   *         description: Filter flashcards by tag ID
   *         example: 1
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
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Flashcard'
   *                 total:
   *                   type: integer
   *                   example: 63
   *                 page:
   *                   type: integer
   *                   example: 0
   *                 pageSize:
   *                   type: integer
   *                   example: 50
   *                 message:
   *                   type: string
   *                   example: Flashcards obtenidas exitosamente
   *       401:
   *         description: Unauthorized - Token not provided or invalid
   *       404:
   *         description: Deck not found
   */
  getFlashcardsByDeck: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const parsedDeckId = BaseController.validateId(deckId);
    const page = parseInt(req.query.page || '0');
    const pageSize = req.query.all === 'true' ? null : parseInt(req.query.pageSize || '50');
    const tagId = req.query.tagId ? parseInt(req.query.tagId) : null;

    let items, total;
    if (tagId) {
      // Filtrar por deck y tag
      const flashcards = await Flashcard.findByDeckIdAndTag(parsedDeckId, tagId);
      // Implementar paginación manual para resultados filtrados
      if (pageSize === null) {
        // Devolver todas las flashcards sin paginado
        items = flashcards;
        total = flashcards.length;
      } else {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        items = flashcards.slice(startIndex, endIndex);
        total = flashcards.length;
      }
    } else {
      // Obtener todas las cards del deck
      if (pageSize === null) {
        // Devolver todas las flashcards sin paginado
        const allFlashcards = await Flashcard.findByDeckIdAll(parsedDeckId);
        items = allFlashcards;
        total = allFlashcards.length;
      } else {
        ({ items, total } = await Flashcard.findByDeckId(parsedDeckId, { page, pageSize }));
      }
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
   * @swagger
   * /api/flashcards/bulk:
   *   post:
   *     summary: Create multiple flashcards
   *     description: Creates multiple flashcards at once. If the deck doesn't exist, it will be created automatically.
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - deck_name
   *               - flashcards
   *             properties:
   *               deck_name:
   *                 type: string
   *                 description: Name of the deck (will be created if it doesn't exist)
   *                 example: "Japanese Learning"
   *               flashcards:
   *                 type: array
   *                 description: Array of flashcards to create
   *                 items:
   *                   type: object
   *                   required:
   *                     - front
   *                     - back
   *                   properties:
   *                     front:
   *                       type: string
   *                       description: Front side of the flashcard
   *                       example: "こんにちは"
   *                     back:
   *                       type: string
   *                       description: Back side of the flashcard
   *                       example: "Hola / Buenos días"
   *                     difficulty:
   *                       type: integer
   *                       minimum: 1
   *                       maximum: 3
   *                       default: 2
   *                       description: Difficulty level (1=easy, 2=normal, 3=hard)
   *                       example: 1
   *           example:
   *             deck_name: "Japanese Learning"
   *             flashcards: [
   *               {
   *                 "front": "こんにちは",
   *                 "back": "Hola / Buenos días",
   *                 "difficulty": 1
   *               },
   *               {
   *                 "front": "ありがとうございます",
   *                 "back": "Muchas gracias",
   *                 "difficulty": 1
   *               }
   *             ]
   *     responses:
   *       201:
   *         description: Flashcards created successfully
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
   *                   example: "20 flashcards creadas exitosamente en el deck \"Japanese Learning\""
   *                 data:
   *                   type: object
   *                   properties:
   *                     deck:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 1
   *                         name:
   *                           type: string
   *                           example: "Japanese Learning"
   *                         description:
   *                           type: string
   *                           example: "Deck creado automáticamente para importar flashcards"
   *                     flashcards:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Flashcard'
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
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */

  /**
   * Crea múltiples flashcards
   */
  createManyFlashcards: BaseController.wrap(async (req, res) => {
    // Ayuda de depuración: muestra cómo llega el cuerpo
    console.log('POST /api/flashcards/batch req.body:', req.body);

    const { deck_name, flashcards } = req.body;

    if (!deck_name || typeof deck_name !== 'string' || deck_name.trim().length === 0) {
      return BaseController.error(res, 'Se requiere un "deck_name" válido', 400, [
        'Nombre del deck requerido'
      ]);
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      // Mensaje adicional para ayudar al frontend
      console.warn('⚠️ Estructura esperada: { deck_name: "...", flashcards: [ ... ] }');
      return BaseController.error(res, 'Se requiere un array de flashcards en la propiedad "flashcards" del body. Ejemplo: { deck_name: "...", flashcards: [ ... ] }', 400, [
        'Array de flashcards vacío o inválido'
      ]);
    }

    // Buscar o crear el deck
    let deck;
    try {
      // Intentar encontrar el deck por nombre para este usuario
      const { DeckRepository } = await import('../repositories/deck.repository.js');
      const decks = await DeckRepository.findAll({ userId: req.userId, name: deck_name.trim() });

      if (decks.length > 0) {
        deck = decks[0];
      } else {
        // Crear nuevo deck si no existe
        const { Deck } = await import('../models/deck.js');
        deck = await Deck.create({
          name: deck_name.trim(),
          description: `Deck creado automáticamente para importar flashcards`,
          userId: req.userId,
          visibility: 'private'
        });
      }
    } catch (error) {
      console.error('Error al buscar/crear deck:', error);
      return BaseController.error(res, 'Error al procesar el deck', 500, [error.message]);
    }

    // Preparar flashcards con el deckId encontrado
    const flashcardsWithDeckId = flashcards.map(flashcard => ({
      ...flashcard,
      deckId: deck.id
    }));

    // Validar cada flashcard
    const validatedFlashcards = [];
    for (const [index, flashcard] of flashcardsWithDeckId.entries()) {
      const validation = FlashcardDto.validateCreate(flashcard);

      if (!validation.success) {
        return BaseController.error(
          res,
          `Error de validación en la flashcard #${index + 1}`,
          400,
          validation.errors
        );
      }

      validatedFlashcards.push(validation.data);
    }

    // Crear todas las flashcards
    const createdFlashcards = await Promise.all(
      validatedFlashcards.map((flashcard) => Flashcard.create(flashcard))
    );

    BaseController.success(
      res,
      {
        deck: {
          id: deck.id,
          name: deck.name,
          description: deck.description
        },
        flashcards: createdFlashcards
      },
      `${createdFlashcards.length} flashcards creadas exitosamente en el deck "${deck.name}"`,
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
