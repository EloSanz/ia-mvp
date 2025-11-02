import { Deck } from '../models/deck.js';
import { DeckDto } from '../dtos/deck.dto.js';
import { BaseController } from './base.controller.js';
import { ForbiddenError, NotFoundError } from '../utils/custom.errors.js';
import { deckGeneratorService } from '../services/deckGenerator.service.js';

export const DeckController = {
  /**
   * @swagger
   * /api/decks:
   *   get:
   *     summary: Get all decks for the authenticated user
   *     description: Retrieves all flashcard decks owned by the authenticated user, including statistics
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Decks retrieved successfully
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
   *                   example: Decks obtenidos exitosamente
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Deck'
   *                 count:
   *                   type: integer
   *                   example: 5
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
  getAllDecks: BaseController.wrap(async (req, res) => {
    const decks = await Deck.findAll({ userId: req.userId });
    BaseController.successList(res, decks, 'Decks obtenidos exitosamente');
  }),

  /**
   * @swagger
   * /api/decks/mcp:
   *   get:
   *     summary: Get all decks for the authenticated user (MCP optimized)
   *     description: Retrieves all flashcard decks owned by the authenticated user without cover images, optimized for MCP tools
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Decks retrieved successfully (without cover images)
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
   *                   example: Decks obtenidos exitosamente (sin coverUrl)
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/DeckMCP'
   *                 count:
   *                   type: integer
   *                   example: 5
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
  getAllDecksForMcp: BaseController.wrap(async (req, res) => {
    const decks = await Deck.findAllWithoutCoverUrl({ userId: req.userId });
    BaseController.successList(res, decks, 'Decks obtenidos exitosamente (sin coverUrl)');
  }),

  /**
   * @swagger
   * /api/decks/{id}:
   *   get:
   *     summary: Get a specific deck by ID
   *     description: Retrieves a single deck with ownership verification
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to retrieve
   *         example: 1
   *     responses:
   *       200:
   *         description: Deck retrieved successfully
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
   *                   example: Deck obtenido exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Deck'
   *       401:
   *         description: Unauthorized - Token not provided or invalid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User does not own this deck
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deck not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getDeckById: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const deck = await Deck.findById(id);

    if (deck && deck.userId !== req.userId) {
      throw new ForbiddenError('No tienes permiso para ver este deck');
    }

    BaseController.success(res, deck, 'Deck obtenido exitosamente');
  }),

  /**
   * @swagger
   * /api/decks:
   *   post:
   *     summary: Create a new deck
   *     description: Creates a new flashcard deck with optional AI-generated cover image
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateDeckRequest'
   *           example:
   *             name: "Spanish Vocabulary"
   *             description: "Basic Spanish words and phrases"
   *             generateCover: true
   *     responses:
   *       201:
   *         description: Deck created successfully
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
   *                   example: Deck creado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Deck'
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
  createDeck: BaseController.wrap(async (req, res) => {

    const { name, description, generateCover } = req.body;
    const userId = parseInt(req.userId);

    try {

      const deck = await Deck.create({
        name,
        description,
        userId,
        coverUrl: null
      });

      BaseController.success(res, deck, "Deck creado exitosamente", 201);

      let coverBase64 = null;

      if (generateCover) {
        (async () => {
          const { generateDeckCoverBase64 } = await import("../services/aiImage.service.js");
          const result = await generateDeckCoverBase64(name, description);

          if (result.base64) {
            coverBase64 = result.base64
            await Deck.update(deck.id, { coverUrl: result.base64 });
            // TODO: emitir evento con socket.io o notificación al front
            console.log("Portada generada correctamente");
          } else {
            console.error("❌ Error al generar portada IA:", result.error);
          }
        })();
      }


    } catch (error) {
      console.error("Error creating deck:", error);
      throw error;
    }

  }),

  /**
   * @swagger
   * /api/decks/{id}:
   *   put:
   *     summary: Update an existing deck
   *     description: Updates a deck's information with ownership verification
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to update
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateDeckRequest'
   *           example:
   *             name: "Advanced Spanish"
   *             description: "Advanced Spanish vocabulary and grammar"
   *     responses:
   *       200:
   *         description: Deck updated successfully
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
   *                   example: Deck actualizado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Deck'
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
   *       403:
   *         description: Forbidden - User does not own this deck
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deck not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  updateDeck: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const existingDeck = await Deck.findById(id);

    if (!existingDeck) {
      throw new NotFoundError('Deck no encontrado');
    }

    if (existingDeck.userId !== req.userId) {
      throw new ForbiddenError('No tienes permiso para modificar este deck');
    }

    const validatedData = await DeckDto.validateUpdate(req.body);
    const deck = await Deck.update(id, validatedData);

    BaseController.success(res, deck, 'Deck actualizado exitosamente');
  }),

  /**
   * @swagger
   * /api/decks/{id}:
   *   delete:
   *     summary: Delete a deck
   *     description: Deletes a deck with ownership verification
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to delete
   *         example: 1
   *     responses:
   *       200:
   *         description: Deck deleted successfully
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
   *                   example: Deck eliminado exitosamente
   *                 data:
   *                   type: null
   *       401:
   *         description: Unauthorized - Token not provided or invalid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - User does not own this deck
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Deck not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  deleteDeck: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const existingDeck = await Deck.findById(id);

    if (!existingDeck) {
      throw new NotFoundError('Deck no encontrado');
    }

    if (existingDeck.userId !== req.userId) {
      throw new ForbiddenError('No tienes permiso para eliminar este deck');
    }

    await Deck.delete(id);
    BaseController.success(res, null, 'Deck eliminado exitosamente');
  }),

  /**
   * @swagger
   * /api/decks/suggest-topics:
   *   post:
   *     summary: Suggest deck topics based on user history
   *     description: Generates topic suggestions for new decks based on the user's existing decks
   *     tags: [Decks, AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               count:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 10
   *                 default: 3
   *                 example: 3
   *                 description: Number of topics to suggest
   *           example:
   *             count: 3
   *     responses:
   *       200:
   *         description: Topics suggested successfully
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
   *                   example: Temas sugeridos exitosamente
   *                 data:
   *                   type: object
   *                   properties:
   *                     topics:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["Advanced JavaScript", "React Patterns", "Database Design"]
   *       401:
   *         description: Unauthorized - Token not provided or invalid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  suggestTopics: BaseController.wrap(async (req, res) => {
    const userId = parseInt(req.userId);
    const { count = 3 } = req.body;

    const suggestions = await deckGeneratorService.suggestTopicsFromUserDecks(userId, count);

    BaseController.success(res, { topics: suggestions }, 'Temas sugeridos exitosamente');
  }),

  /**
   * @swagger
   * /api/decks/generate-with-ai:
   *   post:
   *     summary: Generate a complete deck with AI
   *     description: Creates a full flashcard deck using AI based on topic, difficulty, and other parameters
   *     tags: [Decks, AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mode
   *               - topic
   *             properties:
   *               mode:
   *                 type: string
   *                 enum: [free, configured, suggested]
   *                 example: configured
   *                 description: Generation mode
   *               topic:
   *                 type: string
   *                 minLength: 1
   *                 example: "Spanish Vocabulary"
   *                 description: Topic for the deck
   *               flashcardCount:
   *                 type: integer
   *                 minimum: 5
   *                 maximum: 50
   *                 default: 10
   *                 example: 15
   *                 description: Number of flashcards to generate
   *               difficulty:
   *                 type: string
   *                 enum: [beginner, intermediate, advanced]
   *                 example: intermediate
   *                 description: Difficulty level
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["grammar", "vocabulary"]
   *                 description: Tags for the flashcards
   *               generateCover:
   *                 type: boolean
   *                 default: true
   *                 example: true
   *                 description: Whether to generate AI cover image
   *           examples:
   *             free:
   *               summary: Free topic generation
   *               value:
   *                 mode: "free"
   *                 topic: "Machine Learning"
   *                 flashcardCount: 10
   *                 generateCover: true
   *             configured:
   *               summary: Configured generation
   *               value:
   *                 mode: "configured"
   *                 topic: "React Components"
   *                 flashcardCount: 15
   *                 difficulty: "intermediate"
   *                 tags: ["react", "frontend"]
   *                 generateCover: false
   *     responses:
   *       201:
   *         description: Deck generated successfully
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
   *                   example: Deck generado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Deck'
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
   *         description: Internal server error - AI generation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  generateDeckWithAI: BaseController.wrap(async (req, res) => {
    const userId = parseInt(req.userId);
    const { mode, topic, flashcardCount, difficulty, tags, generateCover = true } = req.body;

    if (!topic || !topic.trim()) {
      return BaseController.error(res, 'El tema es requerido', 400, ['Tema vacío']);
    }

    let result;

    try {
      if (mode === 'free') {
        // Modo tema libre
        result = await deckGeneratorService.generateDeckFromTopic(userId, topic, {
          flashcardCount: flashcardCount || 10,
          generateCover
        });
      } else if (mode === 'configured') {
        // Modo con configuración
        result = await deckGeneratorService.generateDeckFromConfig(userId, {
          topic,
          flashcardCount: flashcardCount || 10,
          difficulty: difficulty || 'intermediate',
          tags: tags || [],
          generateCover
        });
      } else if (mode === 'suggested') {
        // Modo sugerido (usa el tema como está)
        result = await deckGeneratorService.generateDeckFromTopic(userId, topic, {
          flashcardCount: flashcardCount || 10,
          generateCover
        });
      } else {
        return BaseController.error(res, 'Modo inválido', 400, ['Modo debe ser: free, configured, o suggested']);
      }

      BaseController.success(res, result, result.message, 201);
    } catch (error) {
      console.error('Error generando deck con IA:', error);
      BaseController.error(res, `Error generando deck: ${error.message}`, 500, [error.message]);
    }
  })
};
