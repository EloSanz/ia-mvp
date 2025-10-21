import { Deck } from '../models/deck.js';
import { DeckDto } from '../dtos/deck.dto.js';
import { BaseController } from './base.controller.js';
import { ForbiddenError, NotFoundError } from '../utils/custom.errors.js';

export const DeckController = {
  /**
   * Obtiene todos los decks del usuario
   */
  getAllDecks: BaseController.wrap(async (req, res) => {
    const decks = await Deck.findAll({ userId: req.userId });
    BaseController.successList(res, decks, 'Decks obtenidos exitosamente');
  }),

  /**
   * Obtiene un deck por ID
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
   * Crea un nuevo deck
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
   * Actualiza un deck existente
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
   * Elimina un deck
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
  })
};
