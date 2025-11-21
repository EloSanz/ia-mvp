import { Deck } from '../models/deck.js';
import { DeckDto } from '../dtos/deck.dto.js';
import { BaseController } from './base.controller.js';
import { ForbiddenError, NotFoundError } from '../utils/custom.errors.js';
import { deckGeneratorService } from '../services/deckGenerator.service.js';
import { TagRepository } from '../repositories/tag.repository.js';
import { FlashcardRepository } from '../repositories/flashcard.repository.js';
import { deleteImageFromCloudinary } from '../utils/cloudinary.js';

let folderCloudyinary = '';
if (process.env.CLOUDINARY_API_CARPETA && process.env.CLOUDINARY_API_CARPETA.trim() !== '') {
  folderCloudyinary = process.env.CLOUDINARY_API_CARPETA;
}

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
   *     description: Retrieves all flashcard decks owned by the authenticated user without cover images, optimized for MCP tools, including tags for each deck
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Decks retrieved successfully (without cover images, with tags)
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
   *     description: Creates a new flashcard deck with optional AI-generated cover image. If `generateCover` is true, the image will be uploaded to Cloudinary.
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
        coverUrl: null,
        // Si se solicita portada, el estado inicial es PENDING
        coverGenerationStatus: generateCover ? 'PENDING' : null
      });

      BaseController.success(res, deck, "Deck creado exitosamente", 201);

      // Si se solicita portada, se invoca el proceso asíncrono centralizado
      if (generateCover) {
        // No necesitamos `await` aquí, el proceso corre en segundo plano.
        deckGeneratorService.generateAndAssignCoverAsync(deck.id, name, description);
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

    // Eliminar la imagen de portada de Cloudinary si existe
    if (existingDeck.coverUrl) {
      console.log(`Eliminando imagen de portada para deck ${id}: ${existingDeck.coverUrl}`);
      await deleteImageFromCloudinary(existingDeck.coverUrl);
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
   * /api/decks/{deckId}/tag-count:
   *   get:
   *     summary: Get tag count for a specific deck
   *     description: Returns the total number of tags in a specific deck
   *     tags: [Decks, Tags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to count tags for
   *         example: 1
   *     responses:
   *       200:
   *         description: Tag count retrieved successfully
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
   *                   example: Tag count retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     deckId:
   *                       type: integer
   *                       example: 1
   *                     tagCount:
   *                       type: integer
   *                       example: 5
   */
  getDeckTagCount: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const userId = req.userId;

    // Verificar ownership del deck
    const deck = await Deck.findById(deckId);
    if (!deck || deck.userId !== userId) {
      throw new ForbiddenError('No tienes permiso para ver este deck');
    }

    const tagCount = await TagRepository.countByDeckId(deckId);

    BaseController.success(res, {
      deckId: parseInt(deckId),
      tagCount
    }, 'Tag count retrieved successfully');
  }),

  /**
   * @swagger
   * /api/decks/{deckId}/flashcards-by-tag:
   *   get:
   *     summary: Get flashcards count by tag for a specific deck
   *     description: Returns the count of flashcards for each tag in a specific deck
   *     tags: [Decks, Flashcards, Tags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to get flashcards by tag for
   *         example: 1
   *     responses:
   *       200:
   *         description: Flashcards by tag count retrieved successfully
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
   *                   example: Flashcards by tag count retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     deckId:
   *                       type: integer
   *                       example: 1
   *                     flashcardsByTag:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           tagId:
   *                             type: integer
   *                             example: 1
   *                           tagName:
   *                             type: string
   *                             example: "Grammar"
   *                           count:
   *                             type: integer
   *                             example: 10
   */
  getDeckFlashcardsByTag: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const userId = req.userId;

    // Verificar ownership del deck
    const deck = await Deck.findById(deckId);
    if (!deck || deck.userId !== userId) {
      throw new ForbiddenError('No tienes permiso para ver este deck');
    }

    const tags = await TagRepository.findByDeckId(deckId);
    const flashcardsByTag = await Promise.all(
      tags.map(async (tag) => ({
        tagId: tag.id,
        tagName: tag.name,
        count: await FlashcardRepository.countByTagId(tag.id)
      }))
    );

    BaseController.success(res, {
      deckId: parseInt(deckId),
      flashcardsByTag
    }, 'Flashcards by tag count retrieved successfully');
  }),

  /**
   * @swagger
   * /api/decks/{deckId}/untagged-flashcards-count:
   *   get:
   *     summary: Get count of untagged flashcards for a specific deck
   *     description: Returns the count of flashcards without tags in a specific deck
   *     tags: [Decks, Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to count untagged flashcards for
   *         example: 1
   *     responses:
   *       200:
   *         description: Untagged flashcards count retrieved successfully
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
   *                   example: Untagged flashcards count retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     deckId:
   *                       type: integer
   *                       example: 1
   *                     untaggedFlashcardsCount:
   *                       type: integer
   *                       example: 8
   */
  getDeckUntaggedFlashcardsCount: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const userId = req.userId;

    // Verificar ownership del deck
    const deck = await Deck.findById(deckId);
    if (!deck || deck.userId !== userId) {
      throw new ForbiddenError('No tienes permiso para ver este deck');
    }

    const untaggedFlashcardsCount = await FlashcardRepository.countUntaggedByDeckId(deckId);

    BaseController.success(res, {
      deckId: parseInt(deckId),
      untaggedFlashcardsCount
    }, 'Untagged flashcards count retrieved successfully');
  }),

  /**
   * @swagger
   * /api/decks/untagged-flashcards-count:
   *   get:
   *     summary: Get count of untagged flashcards across all user decks
   *     description: Returns the total count of flashcards without tags across all user decks
   *     tags: [Decks, Flashcards]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Untagged flashcards count across all decks retrieved successfully
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
   *                   example: Untagged flashcards count across all decks retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalUntaggedFlashcards:
   *                       type: integer
   *                       example: 25
   *                     byDeck:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           deckId:
   *                             type: integer
   *                             example: 1
   *                           deckName:
   *                             type: string
   *                             example: "Spanish Vocabulary"
   *                           untaggedCount:
   *                             type: integer
   *                             example: 8
   */
  getAllUntaggedFlashcardsCount: BaseController.wrap(async (req, res) => {
    const userId = req.userId;

    const decks = await Deck.findAll({ userId });
    let totalUntaggedFlashcards = 0;
    const byDeck = [];

    for (const deck of decks) {
      const untaggedCount = await FlashcardRepository.countUntaggedByDeckId(deck.id);
      totalUntaggedFlashcards += untaggedCount;

      byDeck.push({
        deckId: deck.id,
        deckName: deck.name,
        untaggedCount
      });
    }

    BaseController.success(res, {
      totalUntaggedFlashcards,
      byDeck
    }, 'Untagged flashcards count across all decks retrieved successfully');
  }),

  /**
   * @swagger
   * /api/decks/flashcards-count:
   *   get:
   *     summary: Get flashcards count for all user decks
   *     description: Returns the count of flashcards for each user deck
   *     tags: [Decks, Flashcards]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Flashcards count for all decks retrieved successfully
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
   *                   example: Flashcards count for all decks retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalFlashcards:
   *                       type: integer
   *                       example: 150
   *                     byDeck:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           deckId:
   *                             type: integer
   *                             example: 1
   *                           deckName:
   *                             type: string
   *                             example: "Spanish Vocabulary"
   *                           flashcardsCount:
   *                             type: integer
   *                             example: 50
   */
  getAllFlashcardsCount: BaseController.wrap(async (req, res) => {
    const userId = req.userId;

    const decks = await Deck.findAll({ userId });
    let totalFlashcards = 0;
    const byDeck = decks.map(deck => {
      const flashcardsCount = deck.stats.flashcardsCount;
      totalFlashcards += flashcardsCount;

      return {
        deckId: deck.id,
        deckName: deck.name,
        flashcardsCount
      };
    });

    BaseController.success(res, {
      totalFlashcards,
      byDeck
    }, 'Flashcards count for all decks retrieved successfully');
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
  }),

  /**
   * Actualiza la visibilidad de un deck
   * PATCH /api/decks/:id/visibility
   */
  updateVisibility: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const { visibility } = req.body;

    // Validar visibilidad
    if (!visibility || !['private', 'public'].includes(visibility)) {
      return BaseController.error(res, 'La visibilidad debe ser "private" o "public"', 400);
    }

    // Verificar que el deck existe y pertenece al usuario
    const existingDeck = await Deck.findById(id);

    if (!existingDeck) {
      throw new NotFoundError('Deck no encontrado');
    }

    if (existingDeck.userId !== req.userId) {
      throw new ForbiddenError('No tienes permiso para modificar este deck');
    }

    // Actualizar visibilidad usando el repositorio
    const { DeckRepository } = await import('../repositories/deck.repository.js');
    const updatedDeck = await DeckRepository.updateVisibility(id, visibility);

    BaseController.success(res, updatedDeck, `Deck ahora es ${visibility === 'public' ? 'público' : 'privado'}`);
  }),

  /**
   * Clona un deck público
   * POST /api/decks/:id/clone
   */
  cloneDeck: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(req.userId);

    // Obtener el deck público con todos sus datos
    const { DeckRepository } = await import('../repositories/deck.repository.js');
    const sourceDeck = await DeckRepository.findPublicById(id);

    if (!sourceDeck) {
      throw new NotFoundError('Deck no encontrado o no es público');
    }

    // Validar que el usuario no esté clonando su propio deck
    if (sourceDeck.userId === userId) {
      return BaseController.error(res, 'No puedes clonar tu propio deck', 400);
    }

    try {
      // Crear descripción con atribución
      const attribution = `\n\nClonado de "${sourceDeck.name}" por ${sourceDeck.user.username}`;
      const newDescription = sourceDeck.description + attribution;

      // Crear el nuevo deck (privado por defecto)
      const clonedDeck = await Deck.create({
        name: sourceDeck.name,
        description: newDescription,
        coverUrl: sourceDeck.coverUrl,
        userId,
        visibility: 'private'
      });

      // Clonar flashcards con tags
      const prisma = (await import('../config/database.js')).default;

      // Primero clonar los tags
      const tagMapping = new Map();
      if (sourceDeck.tags && sourceDeck.tags.length > 0) {
        for (const tag of sourceDeck.tags) {
          const newTag = await prisma.tag.create({
            data: {
              name: tag.name,
              deckId: clonedDeck.id
            }
          });
          tagMapping.set(tag.id, newTag.id);
        }
      }

      // Luego clonar las flashcards
      if (sourceDeck.flashcards && sourceDeck.flashcards.length > 0) {
        const flashcardsToCreate = sourceDeck.flashcards.map(fc => ({
          front: fc.front,
          back: fc.back,
          deckId: clonedDeck.id,
          difficulty: fc.difficulty || 2,
          tagId: fc.tagId ? tagMapping.get(fc.tagId) : null
        }));

        await prisma.flashcard.createMany({
          data: flashcardsToCreate
        });
      }

      // Incrementar contador de clones del deck original
      await DeckRepository.incrementClonesCount(id);

      BaseController.success(res, clonedDeck, 'Deck clonado exitosamente', 201);
    } catch (error) {
      console.error('Error clonando deck:', error);
      BaseController.error(res, `Error al clonar deck: ${error.message}`, 500);
    }
  }),

  /**
   * @swagger
   * /api/decks/{deckId}/stats:
   *   get:
   *     summary: Get detailed statistics for a specific deck
   *     description: Returns comprehensive statistics for a deck including content metrics, organization status, and study progress
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to get statistics for
   *         example: 1
   *     responses:
   *       200:
   *         description: Deck statistics retrieved successfully
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
   *                   example: "Estadísticas del deck obtenidas exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     deckId:
   *                       type: integer
   *                       example: 1
   *                     deckName:
   *                       type: string
   *                       example: "Japanese Learning"
   *                     stats:
   *                       type: object
   *                       properties:
   *                         totalFlashcards:
   *                           type: integer
   *                           example: 25
   *                         untaggedFlashcards:
   *                           type: integer
   *                           example: 5
   *                         taggedFlashcards:
   *                           type: integer
   *                           example: 20
   *                         flashcardsByDifficulty:
   *                           type: object
   *                           properties:
   *                             "1":
   *                               type: integer
   *                               example: 8
   *                             "2":
   *                               type: integer
   *                               example: 12
   *                             "3":
   *                               type: integer
   *                               example: 5
   *                         flashcardsByTag:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               tagId:
   *                                 type: integer
   *                                 example: 1
   *                               tagName:
   *                                 type: string
   *                                 example: "Grammar"
   *                               count:
   *                                 type: integer
   *                                 example: 10
   *                               percentage:
   *                                 type: number
   *                                 example: 40.0
   *                         organizationMetrics:
   *                           type: object
   *                           properties:
   *                             organizationPercentage:
   *                               type: number
   *                               example: 80.0
   *                             organizationStatus:
   *                               type: string
   *                               enum: [empty, needs_organization, organized]
   *                               example: "organized"
   *                             tagsCount:
   *                               type: integer
   *                               example: 3
   *                             averageTagsPerFlashcard:
   *                               type: number
   *                               example: 1.0
   *                         studyMetrics:
   *                           type: object
   *                           properties:
   *                             totalReviews:
   *                               type: integer
   *                               example: 150
   *                             averageDifficulty:
   *                               type: number
   *                               example: 2.1
   *                             lastStudied:
   *                               type: string
   *                               format: date-time
   *                               nullable: true
   *                               example: "2025-11-15T10:30:00Z"
   *                     lastUpdated:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-11-15T11:45:00Z"
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

  /**
   * Obtiene estadísticas detalladas de un deck
   */
  getDeckStats: BaseController.wrap(async (req, res) => {
    const { deckId } = req.params;
    const parsedDeckId = BaseController.validateId(deckId);

    // Verificar que el deck pertenece al usuario
    const deck = await Deck.findById(parsedDeckId);
    if (!deck || deck.userId !== req.userId) {
      throw new ForbiddenError('No tienes permiso para ver este deck');
    }

    // Obtener todas las flashcards del deck con sus tags
    const { FlashcardRepository } = await import('../repositories/flashcard.repository.js');
    const flashcards = await FlashcardRepository.findByDeckIdAll(parsedDeckId);

    // Estadísticas básicas
    const totalFlashcards = flashcards.length;
    const untaggedFlashcards = flashcards.filter(f => !f.tagId).length;
    const taggedFlashcards = totalFlashcards - untaggedFlashcards;

    // Distribución por dificultad
    const flashcardsByDifficulty = {
      1: flashcards.filter(f => f.difficulty === 1).length,
      2: flashcards.filter(f => f.difficulty === 2).length,
      3: flashcards.filter(f => f.difficulty === 3).length,
      4: 0, // No existe dificultad 4 en el esquema actual
      5: 0  // No existe dificultad 5 en el esquema actual
    };

    // Distribución por tags (cada flashcard tiene máximo 1 tag)
    const tagMap = new Map();
    flashcards.forEach(flashcard => {
      if (flashcard.tag) {
        const tagId = flashcard.tag.id;
        const tagName = flashcard.tag.name;
        if (tagMap.has(tagId)) {
          tagMap.get(tagId).count++;
        } else {
          tagMap.set(tagId, {
            tagId,
            tagName,
            count: 1
          });
        }
      }
    });

    const flashcardsByTag = Array.from(tagMap.values())
      .map(tag => ({
        ...tag,
        percentage: totalFlashcards > 0 ? Math.round((tag.count / totalFlashcards) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Métricas de organización
    const organizationPercentage = totalFlashcards > 0
      ? Math.round((taggedFlashcards / totalFlashcards) * 100 * 10) / 10
      : 0;

    const organizationStatus =
      totalFlashcards === 0 ? 'empty' :
        untaggedFlashcards > 0 ? 'needs_organization' :
          'organized';

    // Calcular promedio de tags por flashcard (máximo 1 en el esquema actual)
    const totalTagsAssigned = taggedFlashcards; // Ya que cada flashcard tagged tiene exactamente 1 tag
    const averageTagsPerFlashcard = totalFlashcards > 0
      ? Math.round((totalTagsAssigned / totalFlashcards) * 10) / 10
      : 0;

    // Métricas de estudio (basadas en campos disponibles)
    const totalReviews = flashcards.reduce((sum, f) => sum + (f.reviewCount || 0), 0);

    // Calcular dificultad promedio
    const averageDifficulty = totalFlashcards > 0
      ? flashcards.reduce((sum, f) => sum + (f.difficulty || 2), 0) / totalFlashcards
      : 0;

    // Encontrar última fecha de estudio
    const lastStudiedDates = flashcards
      .map(f => f.lastReviewed)
      .filter(date => date !== null);

    const lastStudied = lastStudiedDates.length > 0
      ? new Date(Math.max(...lastStudiedDates.map(d => new Date(d).getTime()))).toISOString()
      : null;

    // Nota: No podemos calcular accuracy, correctReviews, etc. sin modelo Review
    // Por ahora retornamos valores básicos o null

    const response = {
      deckId: parsedDeckId,
      deckName: deck.name,
      stats: {
        totalFlashcards,
        untaggedFlashcards,
        taggedFlashcards,
        flashcardsByDifficulty,
        flashcardsByTag,
        organizationMetrics: {
          organizationPercentage,
          organizationStatus,
          tagsCount: flashcardsByTag.length,
          averageTagsPerFlashcard
        },
        studyMetrics: {
          totalReviews,
          correctReviews: null, // No disponible sin modelo Review
          incorrectReviews: null, // No disponible sin modelo Review
          accuracyRate: null, // No disponible sin modelo Review
          averageDifficulty: Math.round(averageDifficulty * 10) / 10,
          lastStudied,
          currentStreak: null // No disponible sin modelo Review detallado
        }
      },
      lastUpdated: new Date().toISOString()
    };

    BaseController.success(res, response, 'Estadísticas del deck obtenidas exitosamente');
  })
};
