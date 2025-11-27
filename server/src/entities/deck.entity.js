/**
 * DeckEntity - Entidad para persistencia en base de datos
 * Representa la estructura exacta de la tabla en la base de datos
 */
export class DeckEntity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.userId = data.userId;
    this.coverUrl = data.coverUrl || null;
    this.visibility = data.visibility || 'private';
    this.clonesCount = data.clonesCount || 0;
    this.clonedFromId = data.clonedFromId || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.tags = data.tags || [];
    this.coverGenerationStatus = data.coverGenerationStatus || null;
  }

  /**
   * Convierte la entidad a formato plano para Prisma
   */
  toPrisma() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      userId: this.userId,
      coverUrl: this.coverUrl,
      visibility: this.visibility,
      clonesCount: this.clonesCount,
      clonedFromId: this.clonedFromId,
      coverGenerationStatus: this.coverGenerationStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Crea una instancia desde datos de Prisma
   */
  static fromPrisma(prismaData) {
    return new DeckEntity({
      id: prismaData.id,
      name: prismaData.name,
      description: prismaData.description,
      userId: prismaData.userId,
      coverUrl: prismaData.coverUrl,
      visibility: prismaData.visibility,
      clonesCount: prismaData.clonesCount,
      clonedFromId: prismaData.clonedFromId,
      coverGenerationStatus: prismaData.coverGenerationStatus,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
      tags: prismaData.tags || []
    });
  }

  /**
   * Valida los datos de la entidad
   */
  validate() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del deck es requerido');
    }
    if (this.name.length > 255) {
      throw new Error('El nombre del deck no puede tener más de 255 caracteres');
    }
    if (this.description && this.description.length > 1000) {
      throw new Error('La descripción del deck no puede tener más de 1000 caracteres');
    }
  }
}
