import { TagRepository } from '../repositories/tag.repository.js';
import { TagEntity } from '../entities/tag.entity.js';
import { TagDto } from '../dtos/tag.dto.js';

export class TagController {
  // GET /api/decks/:deckId/tags - Obtener todas las tags de un deck
  static async getByDeckId(req, res) {
    try {
      const { deckId } = req.params;
      const userId = req.userId;

      // Verificar que el deck pertenece al usuario
      const isOwner = await TagRepository.validateDeckOwnership(deckId, userId);
      if (!isOwner) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied. Deck does not belong to user.' 
        });
      }

      const tags = await TagRepository.findByDeckId(deckId);
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
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  // GET /api/decks/:deckId/tags/:tagId - Obtener tag específica
  static async getById(req, res) {
    try {
      const { deckId, tagId } = req.params;
      const userId = req.userId;

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(deckId, userId);
      if (!isOwner) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied. Deck does not belong to user.' 
        });
      }

      const tag = await TagRepository.findById(tagId, deckId);
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
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  // POST /api/decks/:deckId/tags - Crear nueva tag en un deck
  static async create(req, res) {
    try {
      const { deckId } = req.params;
      const userId = req.userId;
      const tagData = { ...req.body, deckId };

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(deckId, userId);
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
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  // PUT /api/decks/:deckId/tags/:tagId - Actualizar tag
  static async update(req, res) {
    try {
      const { deckId, tagId } = req.params;
      const userId = req.userId;

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(deckId, userId);
      if (!isOwner) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied. Deck does not belong to user.' 
        });
      }

      const tag = await TagRepository.update(tagId, deckId, req.body);
      
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
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  // DELETE /api/decks/:deckId/tags/:tagId - Eliminar tag
  static async delete(req, res) {
    try {
      const { deckId, tagId } = req.params;
      const userId = req.userId;

      // Verificar ownership del deck
      const isOwner = await TagRepository.validateDeckOwnership(deckId, userId);
      if (!isOwner) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied. Deck does not belong to user.' 
        });
      }

      await TagRepository.delete(tagId, deckId);
      
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
        error: 'Error interno del servidor',
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
        error: 'Error interno del servidor' 
      });
    }
  }
}
