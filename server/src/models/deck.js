import { DeckEntity } from '../entities/deck.entity.js';
import { DeckRepository } from '../repositories/deck.repository.js';

/**
 * Deck - Modelo de dominio con lógica de negocio
 * Maneja las reglas de negocio y orquesta las operaciones
 */
export class Deck {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.coverUrl = data.coverUrl || null;
    this.userId = data.userId;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Crea un nuevo deck aplicando reglas de negocio
   */
  static async create(deckData) {
    const deck = new Deck(deckData);

    // Aplicar reglas de negocio
    deck.name = deck.name.trim();
    deck.description = deck.description.trim();
    deck.updatedAt = new Date();

    // Convertir a entidad para persistir
    const entity = new DeckEntity(deck);
    entity.validate();

    // Persistir
    const savedEntity = await DeckRepository.create(entity);
    return Deck.fromEntity(savedEntity);
  }

  /**
   * Busca un deck por ID
   */
  static async findById(id) {
    const entity = await DeckRepository.findById(id);
    if (!entity) {
      return null;
    }
    return Deck.fromEntity(entity);
  }

  /**
   * Obtiene todos los decks
   */
  static async findAll(filter = {}) {
    const entities = await DeckRepository.findAll(filter);
    return entities.map((entity) => Deck.fromEntity(entity));
  }

  /**
   * Actualiza un deck existente
   */
  static async update(id, updateData) {
    const existingDeck = await Deck.findById(id);
    if (!existingDeck) {
      throw new Error('Deck no encontrado');
    }

    // Aplicar reglas de negocio
    const updatedDeck = new Deck({
      ...existingDeck,
      ...updateData,
      updatedAt: new Date()
    });
    

    updatedDeck.name = updatedDeck.name.trim();
    updatedDeck.description = updatedDeck.description.trim();

    // Convertir a entidad y validar
    const entity = new DeckEntity(updatedDeck);
    entity.validate();

    // Actualizar
    const savedEntity = await DeckRepository.update(id, entity);
    return Deck.fromEntity(savedEntity);
  }

  /**
   * Elimina un deck
   */
  static async delete(id) {
    const existingDeck = await Deck.findById(id);
    if (!existingDeck) {
      throw new Error('Deck no encontrado');
    }

    await DeckRepository.delete(id);
  }

  /**
   * Convierte una entidad a modelo
   */
  static fromEntity(entity) {
    return new Deck({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      coverUrl: entity.coverUrl,
      userId: entity.userId,
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
      name: this.name,
      description: this.description,
      coverUrl: this.coverUrl,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
