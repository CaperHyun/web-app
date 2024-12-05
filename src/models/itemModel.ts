import { db } from '../db/database';

interface Item {
  id?: number;
  name: string;
  category: string;
  color: string;
  description?: string;
  image_url?: string;
  date_created?: string;
}

interface QueryOptions {
  id?: number;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const ItemModel = {
  async getAll(options: QueryOptions = {}): Promise<{ items: Item[]; total: number }> {
    const {
      id,
      search = '',
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = options;

    const offset = (page - 1) * limit;
    const params: any[] = [];
    let whereClause = 'WHERE 1=1';

    if (id) {
      whereClause += ' AND id = ?';
      params.push(id);
    }

    if (search) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      whereClause += ' AND date_created >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND date_created <= ?';
      params.push(endDate);
    }

    const countQuery = `SELECT COUNT(*) as total FROM items ${whereClause}`;
    const itemsQuery = `
      SELECT * FROM items 
      ${whereClause}
      ORDER BY date_created DESC
      LIMIT ? OFFSET ?
    `;

    return new Promise((resolve, reject) => {
      db.get(countQuery, params, (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        const total = row.total;
        db.all(itemsQuery, [...params, limit, offset], (err, items) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ items: items as Item[], total });
        });
      });
    });
  },

  async getById(id: number): Promise<Item | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row as Item || null);
      });
    });
  },

  async create(item: Item): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO items (name, category, color, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [item.name, item.category, item.color, item.description, item.image_url],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  async update(id: number, item: Item): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE items SET name = ?, category = ?, color = ?, description = ?, image_url = ? WHERE id = ?',
        [item.name, item.category, item.color, item.description, item.image_url, id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  },

  async delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM items WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
};

export type { Item, QueryOptions };
