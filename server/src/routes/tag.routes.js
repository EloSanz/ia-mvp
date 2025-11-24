import { Router } from 'express';
import { TagController } from '../controllers/tag.controller.js';

// Creamos un router con mergeParams: true para que pueda acceder a los parámetros de la ruta padre (ej: :id de /decks/:id)
const router = Router({ mergeParams: true });

// Rutas para tags anidadas bajo /api/decks/:id/tags
router.get('/', TagController.getByDeckId);
router.post('/', TagController.create);
router.get('/:tagId', TagController.getById);
router.put('/:tagId', TagController.update);
router.delete('/:tagId', TagController.delete);

export default router;
