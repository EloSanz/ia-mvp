import prisma from '../config/database.js';
import { TagEntity } from '../entities/tag.entity.js';

export class TagRepository {
  static async findAll() {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return tags.map((tag) => new TagEntity(tag));
  }

  static async findById(id) {
    const tag = await prisma.tag.findUnique({ where: { id: Number(id) } });
    return tag ? new TagEntity(tag) : null;
  }

  static async create(tagEntity) {
    const created = await prisma.tag.create({ data: tagEntity.toPrisma() });
    return new TagEntity(created);
  }

  static async update(id, tagEntity) {
    const updated = await prisma.tag.update({
      where: { id: Number(id) },
      data: tagEntity.toPrisma()
    });
    return new TagEntity(updated);
  }

  static async delete(id) {
    await prisma.tag.delete({ where: { id: Number(id) } });
    return true;
  }
}
