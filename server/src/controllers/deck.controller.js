import { Deck } from '../models/deck.js';
import { DeckDto } from '../dtos/deck.dto.js';
import { BaseController } from './base.controller.js';

export const DeckController = {
  /**
   * Obtiene todos los decks
   */
  getAllDecks: BaseController.wrap(async (req, res) => {
    const decks = await Deck.findAll();
    BaseController.successList(res, decks, 'Decks obtenidos exitosamente');
  }),

  /**
   * Obtiene un deck por ID
   */
  getDeckById: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const result = await BaseController.findAndExecute(
      Deck.findById.bind(Deck),
      id,
      (deck) => deck,
      'Deck obtenido exitosamente'
    );

    if (result.success) {
      BaseController.success(res, result.data, result.message);
    }
  }),

  /**
   * Crea un nuevo deck
   */
  createDeck: BaseController.wrap(async (req, res) => {
    const result = await BaseController.createWithValidation(
      DeckDto.validateCreate.bind(DeckDto),
      Deck.create.bind(Deck),
      req.body,
      'Deck creado exitosamente'
    );

    BaseController.success(res, result.data, result.message, 201);
  }),

  /**
   * Actualiza un deck existente
   */
  updateDeck: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const result = await BaseController.updateWithValidation(
      Deck.findById.bind(Deck),
      DeckDto.validateUpdate.bind(DeckDto),
      Deck.update.bind(Deck),
      id,
      req.body,
      'Deck actualizado exitosamente'
    );

    BaseController.success(res, result.data, result.message);
  }),

  /**
   * Elimina un deck
   */
  deleteDeck: BaseController.wrap(async (req, res) => {
    const { id } = req.params;
    const result = await BaseController.findAndExecute(
      Deck.findById.bind(Deck),
      id,
      () => Deck.delete(BaseController.validateId(id)),
      'Deck eliminado exitosamente'
    );

    if (result.success) {
      BaseController.success(res, null, result.message);
    }
  })
};
