import prisma from '../config/database.js';
import { TagEntity } from '../entities/tag.entity.js';

export class TagRepository {
  // Buscar todas las tags de un deck específico
  static async findByDeckId(deckId) {
    const tags = await prisma.tag.findMany({
      where: { deckId: Number(deckId) },
      include: {
        flashcards: true,
        deck: {
          select: { id: true, name: true, userId: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return tags.map(tag => new TagEntity(tag));
  }

  // Buscar tag por ID (con validación de deck)
  static async findById(tagId, deckId = null) {
    const where = { id: Number(tagId) };
    if (deckId) {
      where.deckId = Number(deckId);
    }

    const tag = await prisma.tag.findFirst({
      where,
      include: {
        flashcards: true,
        deck: {
          select: { id: true, name: true, userId: true }
        }
      }
    });

    return tag ? new TagEntity(tag) : null;
  }

  // Crear nueva tag en un deck
  static async create(tagData) {
    const validatedData = TagEntity.validate(tagData);
    
    const tag = await prisma.tag.create({
      data: validatedData,
      include: {
        flashcards: true,
        deck: {
          select: { id: true, name: true, userId: true }
        }
      }
    });

    return new TagEntity(tag);
  }

  // Actualizar tag (con validación de deck)
  static async update(tagId, deckId, tagData) {
    const validatedData = TagEntity.validate({ ...tagData, deckId });
    
    const tag = await prisma.tag.update({
      where: { 
        id: Number(tagId),
        deckId: Number(deckId) // Validación de pertenencia al deck
      },
      data: { name: validatedData.name }, // Solo actualizar name
      include: {
        flashcards: true,
        deck: {
          select: { id: true, name: true, userId: true }
        }
      }
    });

    return new TagEntity(tag);
  }

  // Eliminar tag (con validación de deck)
  static async delete(tagId, deckId) {
    await prisma.tag.delete({
      where: { 
        id: Number(tagId),
        deckId: Number(deckId) // Validación de pertenencia al deck
      }
    });
  }

  // Verificar si el deck pertenece al usuario
  static async validateDeckOwnership(deckId, userId) {
    const deck = await prisma.deck.findFirst({
      where: {
        id: Number(deckId),
        userId: Number(userId)
      }
    });

    return deck !== null;
  }

  // Método legacy para mantener compatibilidad (deprecated)
  static async findAll() {
    console.warn('TagRepository.findAll() is deprecated. Use findByDeckId() instead.');
    const tags = await prisma.tag.findMany({ 
      include: {
        flashcards: true,
        deck: {
          select: { id: true, name: true, userId: true }
        }
      },
      orderBy: { name: 'asc' } 
    });
    return tags.map((tag) => new TagEntity(tag));
  }
}
