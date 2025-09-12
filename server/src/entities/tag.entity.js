/**
 * TagEntity - Entidad para persistencia en base de datos
 * Representa la estructura exacta de la tabla en la base de datos
 */
export class TagEntity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toPrisma() {
    return {
      name: this.name
    };
  }
}
