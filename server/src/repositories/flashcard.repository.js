import { PrismaClient } from '@prisma/client';
import { cacheAdapter } from '../adapters/cache.adapter.js';
import { CACHE_TTL_FLASHCARDS } from '../config/constants.js';
import { FlashcardEntity } from '../entities/flashcard.entity.js';

const prisma = new PrismaClient();

/**
 * FlashcardRepository - Repositorio para operaciones de persistencia
 * Maneja todas las operaciones de base de datos para flashcards
 */
export class FlashcardRepository {
  /**
   * Busca flashcards por deckId y consigna (front)
   */
  static async searchByDeckIdAndFront(deckId, query, { page = 0, pageSize = 15 } = {}) {
    try {
      const skip = page * pageSize;
      const take = pageSize;
      const where = {
        deckId: parseInt(deckId),
        front: {
          contains: query,
          mode: 'insensitive'
        }
      };
      const [flashcards, total] = await Promise.all([
        prisma.flashcard.findMany({
          where,
          include: {
            deck: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.flashcard.count({ where })
      ]);
      return {
        items: flashcards.map((card) => FlashcardEntity.fromPrisma(card)),
        total
      };
    } catch (error) {
      throw new Error(`Error al buscar flashcards por consigna: ${error.message}`);
    }
  }
  /**
   * Busca todas las flashcards
   */
  static async findAll() {
    try {
      const flashcards = await prisma.flashcard.findMany({
        include: {
          deck: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return flashcards.map((card) => FlashcardEntity.fromPrisma(card));
    } catch (error) {
      throw new Error(`Error al obtener flashcards: ${error.message}`);
    }
  }

  /**
   * Busca una flashcard por ID
   */
  static async findById(id) {
    try {
      const flashcard = await prisma.flashcard.findUnique({
        where: { id: parseInt(id) },
        include: {
          deck: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      return flashcard ? FlashcardEntity.fromPrisma(flashcard) : null;
    } catch (error) {
      throw new Error(`Error al buscar flashcard: ${error.message}`);
    }
  }

  /**
   * Busca flashcards por deckId
   */
  static async findByDeckId(deckId) {
    try {
      const { page = 0, pageSize = 15 } = arguments[1] || {};
      const cacheKey = `deck:${deckId}:page:${page}:size:${pageSize}`;

      const cached = cacheAdapter.get(cacheKey);
      if (cached) {
        return cached;
      } 

      const skip = page * pageSize;
      const take = pageSize;
      const [flashcards, total] = await Promise.all([
        prisma.flashcard.findMany({
          where: { deckId: parseInt(deckId) },
          include: {
            deck: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.flashcard.count({ where: { deckId: parseInt(deckId) } })
      ]);

      const result = {
        items: flashcards.map((card) => FlashcardEntity.fromPrisma(card)),
        total
      };
  cacheAdapter.set(cacheKey, result, CACHE_TTL_FLASHCARDS);

      // 5. Devolvemos el resultado
      return result;
    } catch (error) {
      throw new Error(`Error al buscar flashcards por deck: ${error.message}`);
    }
  }

  /**
   * Busca flashcards que necesitan revisión
   */
  static async findDueForReview(deckId = null) {
    try {
      const now = new Date();
      const whereClause = {
        OR: [
          { nextReview: null }, // Nunca revisadas
          { nextReview: { lte: now } } // Vencidas
        ]
      };

      if (deckId) {
        whereClause.deckId = parseInt(deckId);
      }

      const flashcards = await prisma.flashcard.findMany({
        where: whereClause,
        include: {
          deck: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { nextReview: 'asc' }
      });

      return flashcards.map((card) => FlashcardEntity.fromPrisma(card));
    } catch (error) {
      throw new Error(`Error al buscar flashcards para revisión: ${error.message}`);
    }
  }

  /**
   * Crea una nueva flashcard
   */
  static async create(flashcardEntity) {
    try {
      const prismaData = flashcardEntity.toPrisma();
      delete prismaData.id; // Remover ID para que sea auto-generado

      const createdFlashcard = await prisma.flashcard.create({
        data: prismaData,
        include: {
          deck: {
            select: {
              id: true,
              name: true
            }
          },
          tag: true
        }
      });

      return FlashcardEntity.fromPrisma(createdFlashcard);
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('El deck especificado no existe');
      }
      throw new Error(`Error al crear flashcard: ${error.message}`);
    }
  }

  /**
   * Actualiza una flashcard existente
   */
  static async update(id, flashcardEntity) {
    try {
      const prismaData = flashcardEntity.toPrisma();
      delete prismaData.id; // No actualizar el ID
      delete prismaData.createdAt; // No actualizar fecha de creación

      const updatedFlashcard = await prisma.flashcard.update({
        where: { id: parseInt(id) },
        data: prismaData,
        include: {
          deck: {
            select: {
              id: true,
              name: true
            }
          },
          tag: true
        }
      });

      return FlashcardEntity.fromPrisma(updatedFlashcard);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Flashcard no encontrada');
      }
      if (error.code === 'P2003') {
        throw new Error('El deck especificado no existe');
      }
      throw new Error(`Error al actualizar flashcard: ${error.message}`);
    }
  }

  /**
   * Elimina una flashcard
   */
  static async delete(id) {
    try {
      await prisma.flashcard.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Flashcard no encontrada');
      }
      throw new Error(`Error al eliminar flashcard: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de flashcards por deck
   */
  static async getStatsByDeck(deckId) {
    try {
      const stats = await prisma.flashcard.groupBy({
        by: ['deckId'],
        where: { deckId: parseInt(deckId) },
        _count: {
          id: true
        },
        _avg: {
          difficulty: true,
          reviewCount: true
        }
      });

      return stats.length > 0 ? stats[0] : null;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Busca flashcards por contenido (front/back)
   */
  static async searchByContent(searchTerm, deckId = null) {
    try {
      const whereClause = {
        OR: [
          { front: { contains: searchTerm, mode: 'insensitive' } },
          { back: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      if (deckId) {
        whereClause.deckId = parseInt(deckId);
      }

      const flashcards = await prisma.flashcard.findMany({
        where: whereClause,
        include: {
          deck: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return flashcards.map((card) => FlashcardEntity.fromPrisma(card));
    } catch (error) {
      throw new Error(`Error al buscar flashcards: ${error.message}`);
    }
  }

  /**
   * Obtiene el conteo total de flashcards
   */
  static async count(deckId = null) {
    try {
      const whereClause = deckId ? { deckId: parseInt(deckId) } : {};
      return await prisma.flashcard.count({ where: whereClause });
    } catch (error) {
      throw new Error(`Error al contar flashcards: ${error.message}`);
    }
  }
}
