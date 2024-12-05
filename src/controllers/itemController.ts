import { Request, Response } from 'express';
import { ItemModel, Item, QueryOptions } from '../models/itemModel';

export const ItemController = {
  async getAllItems(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = req.query;

      const items = await ItemModel.getAll({
        search: search as string,
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: Number(page),
        limit: Number(limit)
      });

      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  },

  async getItem(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const item = await ItemModel.getById(id);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  },

  async createItem(req: Request, res: Response) {
    try {
      const { name, category, color, description, image_url } = req.body;
      
      if (!name || !category || !color) {
        return res.status(400).json({ error: 'Name, category, and color are required' });
      }

      const newItemId = await ItemModel.create({ 
        name, 
        category, 
        color, 
        description, 
        image_url 
      });

      res.status(201).json({ 
        id: newItemId, 
        name, 
        category, 
        color, 
        description, 
        image_url 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create item' });
    }
  },

  async updateItem(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, category, color, description, image_url } = req.body;
      
      if (req.method === 'PUT' && (!name || !category || !color)) {
        return res.status(400).json({ 
          error: 'Name, category, and color are required for PUT request' 
        });
      }

      const existingItem = await ItemModel.getById(id);
      if (!existingItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const updatedItem = req.method === 'PUT'
        ? { name, category, color, description, image_url }
        : {
            name: name ?? existingItem.name,
            category: category ?? existingItem.category,
            color: color ?? existingItem.color,
            description: description ?? existingItem.description,
            image_url: image_url ?? existingItem.image_url
          };

      await ItemModel.update(id, updatedItem);
      res.json({ 
        message: 'Item updated successfully',
        item: { id, ...updatedItem }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update item' });
    }
  },

  async deleteItem(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await ItemModel.delete(id);
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
}; 