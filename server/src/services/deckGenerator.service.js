import { openaiService } from './openai.service.js';
import { Deck } from '../models/deck.js';
import { Flashcard } from '../models/flashcard.js';
import { generateDeckCoverBase64 } from './aiImage.service.js';

/**
 * Servicio para generar decks completos con IA
 * Orquesta la creación de metadata, flashcards y portada
 */
export class DeckGeneratorService {
  /**
   * Genera un deck completo desde un tema libre
   * @param {number} userId - ID del usuario
   * @param {string} topic - Tema del deck
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Deck creado con flashcards
   */
  async generateDeckFromTopic(userId, topic, options = {}) {
    const { flashcardCount = 10, generateCover = true } = options;

    try {
      // 1. Generar metadata y flashcards con IA
      const aiResult = await openaiService.generateCompleteDeck(topic, flashcardCount);
      
      if (!aiResult.deck || !aiResult.flashcards) {
        throw new Error('Respuesta de IA inválida: faltan datos del deck o flashcards');
      }

      // 2. Crear deck en la base de datos
      const deck = await Deck.create({
        name: aiResult.deck.name,
        description: aiResult.deck.description,
        userId: userId,
        coverUrl: null
      });

      // 3. Crear flashcards en batch
      const flashcardsData = aiResult.flashcards.map(flashcard => ({
        front: flashcard.front,
        back: flashcard.back,
        deckId: deck.id,
        difficulty: 2 // Dificultad por defecto
      }));

      const createdFlashcards = await Promise.all(
        flashcardsData.map(flashcard => Flashcard.create(flashcard))
      );

      // 4. Generar portada en background (opcional)
      if (generateCover) {
        this.generateCoverAsync(deck.id, aiResult.deck.name, aiResult.deck.description);
      }

      return {
        success: true,
        deck: deck,
        flashcards: createdFlashcards,
        message: `Deck "${deck.name}" creado exitosamente con ${createdFlashcards.length} flashcards`
      };

    } catch (error) {
      console.error('Error generando deck desde tema:', error);
      throw new Error(`Error generando deck: ${error.message}`);
    }
  }

  /**
   * Genera un deck con configuración específica
   * @param {number} userId - ID del usuario
   * @param {Object} config - Configuración del deck
   * @returns {Promise<Object>} Deck creado con flashcards
   */
  async generateDeckFromConfig(userId, config) {
    const { 
      topic, 
      flashcardCount = 10, 
      difficulty = 'intermediate', 
      tags = [], 
      generateCover = true 
    } = config;

    try {
      // 1. Generar metadata y flashcards con IA usando configuración
      const aiResult = await openaiService.generateCompleteDeckWithConfig(
        topic, 
        flashcardCount, 
        difficulty, 
        tags
      );
      
      if (!aiResult.deck || !aiResult.flashcards) {
        throw new Error('Respuesta de IA inválida: faltan datos del deck o flashcards');
      }

      // 2. Crear deck en la base de datos
      const deck = await Deck.create({
        name: aiResult.deck.name,
        description: aiResult.deck.description,
        userId: userId,
        coverUrl: null
      });

      // 3. Crear flashcards en batch
      const flashcardsData = aiResult.flashcards.map(flashcard => ({
        front: flashcard.front,
        back: flashcard.back,
        deckId: deck.id,
        difficulty: this.mapDifficultyToNumber(difficulty)
      }));

      const createdFlashcards = await Promise.all(
        flashcardsData.map(flashcard => Flashcard.create(flashcard))
      );

      // 4. Generar portada en background (opcional)
      if (generateCover) {
        this.generateCoverAsync(deck.id, aiResult.deck.name, aiResult.deck.description);
      }

      return {
        success: true,
        deck: deck,
        flashcards: createdFlashcards,
        message: `Deck "${deck.name}" creado exitosamente con ${createdFlashcards.length} flashcards`
      };

    } catch (error) {
      console.error('Error generando deck con configuración:', error);
      throw new Error(`Error generando deck: ${error.message}`);
    }
  }

  /**
   * Sugiere temas basados en los decks existentes del usuario
   * @param {number} userId - ID del usuario
   * @param {number} count - Número de sugerencias
   * @returns {Promise<Array>} Lista de temas sugeridos
   */
  async suggestTopicsFromUserDecks(userId, count = 3) {
    try {
      // 1. Obtener decks existentes del usuario
      const userDecks = await Deck.findAll({ userId });
      
      if (userDecks.length === 0) {
        // Si no tiene decks, sugerir temas generales
        return this.getDefaultTopics();
      }

      // 2. Generar sugerencias basadas en sus decks
      const suggestions = await openaiService.suggestDeckTopics(userDecks, count);
      
      return suggestions || [];

    } catch (error) {
      console.error('Error generando sugerencias:', error);
      // Fallback a temas por defecto si falla la IA
      return this.getDefaultTopics();
    }
  }

  /**
   * Genera portada de forma asíncrona
   * @private
   */
  async generateCoverAsync(deckId, name, description) {
    try {
      const result = await generateDeckCoverBase64(name, description);
      
      if (result.base64) {
        await Deck.update(deckId, { coverUrl: result.base64 });
        console.log(`Portada generada para deck ${deckId}`);
      } else {
        console.error(`Error generando portada para deck ${deckId}:`, result.error);
      }
    } catch (error) {
      console.error(`Error generando portada para deck ${deckId}:`, error);
    }
  }

  /**
   * Mapea dificultad textual a número
   * @private
   */
  mapDifficultyToNumber(difficulty) {
    const difficultyMap = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    };
    return difficultyMap[difficulty] || 2;
  }

  /**
   * Temas por defecto cuando el usuario no tiene decks
   * @private
   */
  getDefaultTopics() {
    return [
      {
        title: "Fundamentos de Programación",
        description: "Conceptos básicos de programación, algoritmos y estructuras de datos",
        reasoning: "Un tema fundamental para cualquier persona interesada en tecnología"
      },
      {
        title: "Historia Universal",
        description: "Eventos históricos importantes y sus consecuencias",
        reasoning: "Conocimiento general que enriquece la cultura personal"
      },
      {
        title: "Anatomía Humana",
        description: "Sistema corporal humano, órganos y funciones básicas",
        reasoning: "Conocimiento esencial sobre nuestro propio cuerpo"
      }
    ];
  }
}

export const deckGeneratorService = new DeckGeneratorService();
