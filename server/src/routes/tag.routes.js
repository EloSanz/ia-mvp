import express from 'express';
import { TagController } from '../controllers/tag.controller.js';

const router = express.Router();

router.get('/', TagController.getAll);
router.get('/:id', TagController.getById);
router.post('/', TagController.create);
router.put('/:id', TagController.update);
router.delete('/:id', TagController.delete);

export default router;
