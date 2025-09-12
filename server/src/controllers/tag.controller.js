import { TagRepository } from '../repositories/tag.repository.js';
import { TagEntity } from '../entities/tag.entity.js';
import { TagDto } from '../dtos/tag.dto.js';

export class TagController {
  static async getAll(req, res) {
    try {
      // Devuelve todas las tags, sin filtrar por usuario
      const tags = await TagRepository.findAll();
      res.json(tags.map((tag) => new TagDto(tag)));
    } catch (error) {
      console.error('Error getting tags:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async getById(req, res) {
    try {
      const tag = await TagRepository.findById(req.params.id);
      if (!tag) return res.status(404).json({ error: 'Tag no encontrada' });
      res.json(new TagDto(tag));
    } catch (error) {
      console.error('Error getting tag by id:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const tag = await TagRepository.create(new TagEntity({ name: name.trim() }));
      res.status(201).json(new TagDto(tag));
    } catch (error) {
      console.error('Error creating tag:', error);

      // Manejar errores específicos de base de datos
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe una tag con ese nombre' });
      }

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const tag = await TagRepository.update(req.params.id, new TagEntity({ name: name.trim() }));
      res.json(new TagDto(tag));
    } catch (error) {
      console.error('Error updating tag:', error);

      // Manejar errores específicos de base de datos
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe una tag con ese nombre' });
      }

      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Tag no encontrada' });
      }

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      await TagRepository.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting tag:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Tag no encontrada' });
      }

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
