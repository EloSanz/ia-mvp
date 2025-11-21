import { TagRepository } from '../repositories/tag.repository.js';
import { TagEntity } from '../entities/tag.entity.js';
import { TagDto } from '../dtos/tag.dto.js';

export class TagController {
  /**
   * @swagger
   * /api/decks/{deckId}/tags:
   *   get:
   *     summary: Get all tags for a specific deck
   *     description: Retrieves all tags associated with a specific deck
   *     tags: [Tags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to get tags for
   *         example: 1
   *     responses:
   *       200:
   *         description: Tags retrieved successfully
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
   *                     $ref: '#/components/schemas/Tag'
   *                 total:
   *                   type: integer
   *                   example: 5
   *                 message:
   *                   type: string
   *                   example: Tags retrieved successfully
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
   */
  // GET /api/decks/:deckId/tags - Obtener todas las tags de un deck
  static async getByDeckId(req, res) {
    try {
      const { id: deckId } = req.params; // Leer 'id' y renombrarlo a 'deckId'
      const userId = req.userId;

      // Verificar que el deck pertenece al usuario
      const isOwner = await TagRepository.validateDeckOwnership(parseInt(deckId), userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Deck does not belong to user.'
        });
      }

      const tags = await TagRepository.findByDeckId(parseInt(deckId));
      const tagDtos = tags.map(tag => new TagDto(tag));

      res.json({
        success: true,
        data: tagDtos,
        total: tagDtos.length,
        message: 'Tags retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting tags by deck:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // GET /api/decks/:deckId/tags/:tagId - Obtener tag específica
  static async getById(req, res) {
    try {
      const { id: deckId, tagId } = req.params; // Leer 'id' y renombrarlo a 'deckId'
      const userId = req.userId;

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(parseInt(deckId), userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Deck does not belong to user.'
        });
      }

      const tag = await TagRepository.findById(parseInt(tagId), parseInt(deckId));
      if (!tag) {
        return res.status(404).json({
          success: false,
          error: 'Tag not found in this deck'
        });
      }

      res.json({
        success: true,
        data: new TagDto(tag),
        message: 'Tag retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting tag by id:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/decks/{deckId}/tags:
   *   post:
   *     summary: Create a new tag for a deck
   *     description: Creates a new tag and associates it with a specific deck
   *     tags: [Tags]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Deck ID to create tag for
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTagRequest'
   *           example:
   *             name: "Grammar"
   *             color: "#FF6B6B"
   *     responses:
   *       201:
   *         description: Tag created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Tag'
   *                 message:
   *                   type: string
   *                   example: Tag created successfully
   *       400:
   *         description: Bad request - Invalid input data
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - User does not own this deck
   */
  // POST /api/decks/:deckId/tags - Crear nueva tag en un deck
  static async create(req, res) {
    try {
      const { id: deckId } = req.params; // Leer 'id' y renombrarlo a 'deckId'
      const userId = req.userId;
      const tagData = { ...req.body, deckId: parseInt(deckId) };

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(parseInt(deckId), userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Deck does not belong to user.'
        });
      }

      const tag = await TagRepository.create(tagData);

      res.status(201).json({
        success: true,
        data: new TagDto(tag),
        message: 'Tag created successfully'
      });
    } catch (error) {
      console.error('Error creating tag:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'Tag name already exists in this deck'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // PUT /api/decks/:deckId/tags/:tagId - Actualizar tag
  static async update(req, res) {
    try {
      const { id: deckId, tagId } = req.params; // Leer 'id' y renombrarlo a 'deckId'
      const userId = req.userId;

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(parseInt(deckId), userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Deck does not belong to user.'
        });
      }

      const tag = await TagRepository.update(parseInt(tagId), parseInt(deckId), req.body);

      res.json({
        success: true,
        data: new TagDto(tag),
        message: 'Tag updated successfully'
      });
    } catch (error) {
      console.error('Error updating tag:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'Tag name already exists in this deck'
        });
      }

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Tag not found in this deck'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // DELETE /api/decks/:deckId/tags/:tagId - Eliminar tag
  static async delete(req, res) {
    try {
      const { id: deckId, tagId } = req.params; // Leer 'id' y renombrarlo a 'deckId'
      const userId = req.userId;

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(parseInt(deckId), userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Deck does not belong to user.'
        });
      }

      await TagRepository.delete(parseInt(tagId), parseInt(deckId));

      res.json({
        success: true,
        message: 'Tag deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting tag:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Tag not found in this deck'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Métodos legacy para compatibilidad (deprecated)
  static async getAll(req, res) {
    console.warn('TagController.getAll() is deprecated. Use getByDeckId() instead.');
    try {
      const tags = await TagRepository.findAll();
      res.json({
        success: true,
        data: tags.map((tag) => new TagDto(tag)),
        message: 'Tags retrieved successfully (deprecated endpoint)'
      });
    } catch (error) {
      console.error('Error getting tags:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
