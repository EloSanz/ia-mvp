/**
 * LibraryController - Controlador para endpoints de biblioteca pública de decks
 * Maneja la obtención de decks públicos y sus previews
 */

import { DeckRepository } from '../repositories/deck.repository.js';
import { BaseController } from './base.controller.js';

export const LibraryController = {
  /**
   * Obtener todos los decks públicos
   * GET /api/library
   */
  getAllPublicDecks: BaseController.wrap(async (req, res) => {
    try {
      const { search = '', sortBy = 'recent' } = req.query;

      // Validar sortBy
      if (!['recent', 'popularity'].includes(sortBy)) {
        return BaseController.error(res, 'sortBy debe ser "recent" o "popularity"', 400);
      }

      const decks = await DeckRepository.findAllPublic(search, sortBy);

      BaseController.success(res, decks, 'Decks públicos obtenidos exitosamente');
    } catch (error) {
      console.error('Error al obtener decks públicos:', error);
      BaseController.error(res, error.message, 500);
    }
  }),

  /**
   * Obtener preview de un deck público
   * GET /api/library/:deckId
   */
  getPublicDeckPreview: BaseController.wrap(async (req, res) => {
    try {
      const { deckId } = req.params;

      if (!deckId) {
        return BaseController.error(res, 'El deckId es requerido', 400);
      }

      const deck = await DeckRepository.findPublicById(deckId);

      if (!deck) {
        return BaseController.error(res, 'Deck no encontrado o no es público', 404);
      }

      BaseController.success(res, deck, 'Preview de deck público obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener preview de deck público:', error);
      BaseController.error(res, error.message, 500);
    }
  })
};

