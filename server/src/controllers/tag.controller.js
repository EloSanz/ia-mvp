import { TagRepository } from '../repositories/tag.repository.js';
import { TagEntity } from '../entities/tag.entity.js';
import { TagDto } from '../dtos/tag.dto.js';

export class TagController {
  static async getAll(req, res) {
    const tags = await TagRepository.findAll();
    res.json(tags.map(tag => new TagDto(tag)));
  }

  static async getById(req, res) {
    const tag = await TagRepository.findById(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag no encontrada' });
    res.json(new TagDto(tag));
  }

  static async create(req, res) {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
  const tag = await TagRepository.create(new TagEntity({ name: name.trim() }));
  res.status(201).json(new TagDto(tag));
  }

  static async update(req, res) {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
  const tag = await TagRepository.update(req.params.id, new TagEntity({ name: name.trim() }));
  res.json(new TagDto(tag));
  }

  static async delete(req, res) {
    await TagRepository.delete(req.params.id);
    res.status(204).end();
  }
}
