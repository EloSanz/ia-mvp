import { Deck } from '../models/deck.js';
import { DeckDto } from '../dtos/deck.dto.js';
import { BaseController } from './base.controller.js';
import { ForbiddenError, NotFoundError } from '../utils/custom.errors.js';
import fs from "fs";
import { generateDeckCoverURL } from '../services/aiImage.service.js';
import { deckGeneratorService } from '../services/deckGenerator.service.js';

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
  }),

  /**
   * Sugiere temas de decks basados en los decks existentes del usuario
   */
  suggestTopics: BaseController.wrap(async (req, res) => {
    const userId = parseInt(req.userId);
    const { count = 3 } = req.body;

    const suggestions = await deckGeneratorService.suggestTopicsFromUserDecks(userId, count);
    
    BaseController.success(res, { topics: suggestions }, 'Temas sugeridos exitosamente');
  }),

  /**
   * Genera un deck completo con IA
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
