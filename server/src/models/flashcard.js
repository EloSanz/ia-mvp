import { FlashcardEntity } from '../entities/flashcard.entity.js';
import { FlashcardRepository } from '../repositories/flashcard.repository.js';
import { Deck } from './deck.js';

/**
 * Flashcard - Modelo de dominio con lógica de negocio
 * Maneja las reglas de negocio y orquesta las operaciones
 */
export class Flashcard {
  /**
   * Busca flashcards por deckId y consigna (front)
   */
  static async searchByDeckIdAndFront(deckId, query, { page = 0, pageSize = 15 } = {}) {
    const { items, total } = await FlashcardRepository.searchByDeckIdAndFront(deckId, query, { page, pageSize });
    return {
      items: items.map((entity) => Flashcard.fromEntity(entity)),
      total
    };
  }
  constructor(data = {}) {
  this.id = data.id || null;
  this.front = data.front || '';
  this.back = data.back || '';
  this.deckId = data.deckId || null;
  this.difficulty = data.difficulty || 2;
  this.lastReviewed = data.lastReviewed || null;
  this.nextReview = data.nextReview || null;
  this.reviewCount = data.reviewCount || 0;
  this.tagId = data.tagId || null;
  this.tag = data.tag || null;
  this.createdAt = data.createdAt || new Date();
  this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Crea una nueva flashcard aplicando reglas de negocio
   */
  static async create(flashcardData) {
    const flashcard = new Flashcard(flashcardData);

    // Aplicar reglas de negocio
    flashcard.front = flashcard.front.trim();
    flashcard.back = flashcard.back.trim();
    flashcard.updatedAt = new Date();

    // Verificar que el deck existe
    const deck = await Deck.findById(flashcard.deckId);
    if (!deck) {
      throw new Error('El deck especificado no existe');
    }

    // Convertir a entidad para persistir
    const entity = new FlashcardEntity(flashcard);
    entity.validate();

    // Persistir
    const savedEntity = await FlashcardRepository.create(entity);
    return Flashcard.fromEntity(savedEntity);
  }

  /**
   * Busca una flashcard por ID
   */
  static async findById(id) {
    const entity = await FlashcardRepository.findById(id);
    if (!entity) {
      return null;
    }
    return Flashcard.fromEntity(entity);
  }

  /**
   * Obtiene todas las flashcards
   */
  static async findAll() {
    const entities = await FlashcardRepository.findAll();
    return entities.map((entity) => Flashcard.fromEntity(entity));
  }

  /**
   * Busca flashcards por deckId
   */
  static async findByDeckId(deckId) {
    const { items, total } = await FlashcardRepository.findByDeckId(deckId, arguments[1]);
    return {
      items: items.map((entity) => Flashcard.fromEntity(entity)),
      total
    };
  }

  /**
   * Busca flashcards que necesitan revisión (nextReview <= ahora)
   */
  static async findDueForReview(deckId = null) {
    const entities = await FlashcardRepository.findDueForReview(deckId);
    return entities.map((entity) => Flashcard.fromEntity(entity));
  }

  /**
   * Actualiza una flashcard existente
   */
  static async update(id, updateData) {
    const existingFlashcard = await Flashcard.findById(id);
    if (!existingFlashcard) {
      throw new Error('Flashcard no encontrada');
    }

    // Aplicar reglas de negocio
    const updatedFlashcard = new Flashcard({
      ...existingFlashcard,
      ...updateData,
      updatedAt: new Date()
    });

    updatedFlashcard.front = updatedFlashcard.front.trim();
    updatedFlashcard.back = updatedFlashcard.back.trim();

    // Convertir a entidad y validar
    const entity = new FlashcardEntity(updatedFlashcard);
    entity.validate();

    // Actualizar
    const savedEntity = await FlashcardRepository.update(id, entity);
    return Flashcard.fromEntity(savedEntity);
  }

  /**
   * Marca una flashcard como revisada
   */
  static async markAsReviewed(id, difficulty) {
    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      throw new Error('Flashcard no encontrada');
    }

    // Marcar como revisada
    const flashcardEntity = new FlashcardEntity(flashcard);
    flashcardEntity.markAsReviewed(difficulty);

    // Actualizar en la base de datos
    const savedEntity = await FlashcardRepository.update(id, flashcardEntity);
    return Flashcard.fromEntity(savedEntity);
  }

  /**
   * Elimina una flashcard
   */
  static async delete(id) {
    const existingFlashcard = await Flashcard.findById(id);
    if (!existingFlashcard) {
      throw new Error('Flashcard no encontrada');
    }

    await FlashcardRepository.delete(id);
  }

  /**
   * Convierte una entidad a modelo
   */
  static fromEntity(entity) {
    return new Flashcard({
      id: entity.id,
      front: entity.front,
      back: entity.back,
      deckId: entity.deckId,
      difficulty: entity.difficulty,
      lastReviewed: entity.lastReviewed,
      nextReview: entity.nextReview,
      reviewCount: entity.reviewCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  /**
   * Convierte el modelo a un objeto plano
   */
  toJSON() {
    return {
      id: this.id,
      front: this.front,
      back: this.back,
      deckId: this.deckId,
      difficulty: this.difficulty,
      lastReviewed: this.lastReviewed,
      nextReview: this.nextReview,
      reviewCount: this.reviewCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Verifica si la flashcard está lista para revisión
   */
  isDueForReview() {
    if (!this.nextReview) {
      return true; // Nunca revisada, está lista
    }
    return new Date() >= new Date(this.nextReview);
  }
}
