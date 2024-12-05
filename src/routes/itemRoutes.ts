import { Router } from 'express';
import { ItemController } from '../controllers/itemController';

const router = Router();

// GET all items
router.get('/', ItemController.getAllItems);

// GET single item
router.get('/:id', ItemController.getItem);

// POST new item
router.post('/', ItemController.createItem);

// PUT update item (requires all fields)
router.put('/:id', ItemController.updateItem);

// PATCH update item (allows partial updates)
router.patch('/:id', ItemController.updateItem);

// DELETE item
router.delete('/:id', ItemController.deleteItem);

export default router; 