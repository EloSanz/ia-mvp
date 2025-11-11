import prisma from '../config/database.js';
import { DeckEntity } from '../entities/deck.entity.js';

/**
 * DeckRepository - Repositorio para operaciones de persistencia
 * Maneja todas las operaciones de base de datos para decks
 */
export class DeckRepository {
  /**
   * Busca todos los decks
   */
  static async findAll(filter = {}) {
    try {
      const decks = await prisma.deck.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' }
      });

      // Para cada deck, obtener estadísticas de flashcards
      const decksWithStats = await Promise.all(decks.map(async (deck) => {
        const entity = DeckEntity.fromPrisma(deck);

        // Obtener cantidad total de flashcards asociadas al deck
        const flashcardsCount = await prisma.flashcard.count({ where: { deckId: entity.id } });
        // Obtener cantidad de flashcards que no han sido revisadas
        const newFlashcardsCount = await prisma.flashcard.count({ where: { deckId: entity.id, reviewCount: 0 } });

        // Calcular las revisiones: se asume que las flashcards revisadas son la diferencia
        const revisionsCount = flashcardsCount - newFlashcardsCount;

        // Agregar el objeto stats a la entidad
        entity.stats = {
          flashcardsCount,
          newFlashcardsCount,
          revisionsCount
        };

        return entity;
      }));
      return decksWithStats;
    } catch (error) {
      throw new Error(`Error al obtener decks: ${error.message}`);
    }
  }

  /**
   * Busca todos los decks sin coverUrl (optimizado para MCP)
   */
  static async findAllWithoutCoverUrl(filter = {}) {
    try {
      const decks = await prisma.deck.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          userId: true,
          createdAt: true,
          updatedAt: true
          // Excluye coverUrl explícitamente
        }
      });

      // Para cada deck, obtener estadísticas de flashcards
      const decksWithStats = await Promise.all(decks.map(async (deck) => {
        const entity = DeckEntity.fromPrisma(deck);

        // Obtener cantidad total de flashcards asociadas al deck
        const flashcardsCount = await prisma.flashcard.count({ where: { deckId: entity.id } });
        // Obtener cantidad de flashcards que no han sido revisadas
        const newFlashcardsCount = await prisma.flashcard.count({ where: { deckId: entity.id, reviewCount: 0 } });

        // Calcular las revisiones: se asume que las flashcards revisadas son la diferencia
        const revisionsCount = flashcardsCount - newFlashcardsCount;

        // Agregar el objeto stats a la entidad
        entity.stats = {
          flashcardsCount,
          newFlashcardsCount,
          revisionsCount
        };

        return entity;
      }));
      return decksWithStats;
    } catch (error) {
      throw new Error(`Error al obtener decks sin coverUrl: ${error.message}`);
    }
  }

  /**
   * Busca un deck por ID
   */
  static async findById(id) {
    try {
      const deck = await prisma.deck.findUnique({
        where: { id: parseInt(id) }
      });
      return deck ? DeckEntity.fromPrisma(deck) : null;
    } catch (error) {
      throw new Error(`Error al buscar deck: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo deck
   */
  static async create(deckEntity) {
    try {
      const prismaData = deckEntity.toPrisma();
      delete prismaData.id; // Remover ID para que sea auto-generado

      const createdDeck = await prisma.deck.create({
        data: {
          ...prismaData,
          userId: parseInt(prismaData.userId)
        }
      });

      return DeckEntity.fromPrisma(createdDeck);
    } catch (error) {
      throw new Error(`Error al crear deck: ${error.message}`);
    }
  }

  /**
   * Actualiza un deck existente
   */
  static async update(id, deckEntity) {
    try {
      const prismaData = deckEntity.toPrisma();
      delete prismaData.id; // No actualizar el ID
      delete prismaData.createdAt; // No actualizar fecha de creación

      const updatedDeck = await prisma.deck.update({
        where: { id: parseInt(id) },
        data: prismaData
      });

      return DeckEntity.fromPrisma(updatedDeck);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Deck no encontrado');
      }
      throw new Error(`Error al actualizar deck: ${error.message}`);
    }
  }

  /**
   * Elimina un deck
   */
  static async delete(id) {
    try {
      await prisma.deck.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Deck no encontrado');
      }
      throw new Error(`Error al eliminar deck: ${error.message}`);
    }
  }

  /**
   * Busca decks por nombre (búsqueda parcial)
   */
  static async findByName(name) {
    try {
      const decks = await prisma.deck.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return decks.map((deck) => DeckEntity.fromPrisma(deck));
    } catch (error) {
      throw new Error(`Error al buscar decks por nombre: ${error.message}`);
    }
  }

  /**
   * Obtiene el conteo total de decks
   */
  static async count() {
    try {
      return await prisma.deck.count();
    } catch (error) {
      throw new Error(`Error al contar decks: ${error.message}`);
    }
  }

  /**
   * Busca todos los decks públicos con información del autor
   */
  static async findAllPublic(search = '', sortBy = 'recent') {
    try {
      const where = {
        visibility: 'public',
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      };

      const orderBy = sortBy === 'popularity' 
        ? { clonesCount: 'desc' }
        : { createdAt: 'desc' };

      const decks = await prisma.deck.findMany({
        where,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        }
      });

      // Agregar estadísticas de flashcards
      const decksWithStats = await Promise.all(decks.map(async (deck) => {
        const flashcardsCount = await prisma.flashcard.count({ where: { deckId: deck.id } });
        const newFlashcardsCount = await prisma.flashcard.count({ where: { deckId: deck.id, reviewCount: 0 } });
        
        return {
          ...deck,
          stats: {
            flashcardsCount,
            newFlashcardsCount,
            revisionsCount: flashcardsCount - newFlashcardsCount
          }
        };
      }));

      return decksWithStats;
    } catch (error) {
      throw new Error(`Error al obtener decks públicos: ${error.message}`);
    }
  }

  /**
   * Busca un deck público por ID con información completa
   */
  static async findPublicById(id) {
    try {
      const deck = await prisma.deck.findFirst({
        where: {
          id: parseInt(id),
          visibility: 'public'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          flashcards: {
            include: {
              tag: true
            },
            orderBy: { createdAt: 'asc' }
          },
          tags: true
        }
      });

      if (!deck) return null;

      // Agregar estadísticas
      const flashcardsCount = deck.flashcards.length;
      const newFlashcardsCount = deck.flashcards.filter(f => f.reviewCount === 0).length;

      return {
        ...deck,
        stats: {
          flashcardsCount,
          newFlashcardsCount,
          revisionsCount: flashcardsCount - newFlashcardsCount
        }
      };
    } catch (error) {
      throw new Error(`Error al buscar deck público: ${error.message}`);
    }
  }

  /**
   * Incrementa el contador de clones de un deck
   */
  static async incrementClonesCount(id) {
    try {
      const updatedDeck = await prisma.deck.update({
        where: { id: parseInt(id) },
        data: {
          clonesCount: {
            increment: 1
          }
        }
      });
      return DeckEntity.fromPrisma(updatedDeck);
    } catch (error) {
      throw new Error(`Error al incrementar contador de clones: ${error.message}`);
    }
  }

  /**
   * Actualiza la visibilidad de un deck
   */
  static async updateVisibility(id, visibility) {
    try {
      const updatedDeck = await prisma.deck.update({
        where: { id: parseInt(id) },
        data: { visibility }
      });
      return DeckEntity.fromPrisma(updatedDeck);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Deck no encontrado');
      }
      throw new Error(`Error al actualizar visibilidad: ${error.message}`);
    }
  }
}
