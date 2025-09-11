import { PrismaClient } from '@prisma/client';
import { DeckEntity } from '../entities/deck.entity.js';

const prisma = new PrismaClient();

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
      return decks.map((deck) => DeckEntity.fromPrisma(deck));
    } catch (error) {
      throw new Error(`Error al obtener decks: ${error.message}`);
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
}
