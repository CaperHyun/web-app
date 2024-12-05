import { Request, Response } from 'express';
import { ItemModel, Item } from '../models/itemModel';
import { parse } from 'csv-parse';

export const BulkController = {
    async importItems(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const items = await parseFile(req.file.buffer);
            let imported = 0;

            // Process items in chunks to avoid memory issues
            const chunkSize = 100;
            for (let i = 0; i < items.length; i += chunkSize) {
                const chunk = items.slice(i, i + chunkSize);
                await Promise.all(chunk.map(item => ItemModel.create(item)));
                imported += chunk.length;
            }

            res.json({ message: 'Import successful', imported });
        } catch (error) {
            console.error('Import error:', error);
            res.status(500).json({ error: 'Failed to import items' });
        }
    }
};

async function parseFile(buffer: Buffer): Promise<Item[]> {
    return new Promise((resolve, reject) => {
        const items: Item[] = [];
        const parser = parse({
            columns: true,
            skip_empty_lines: true
        });

        parser.on('readable', function() {
            let record;
            while ((record = parser.read())) {
                // Validate and clean the record
                const item: Item = {
                    name: record.name?.trim(),
                    category: record.category?.trim(),
                    color: record.color?.trim(),
                    description: record.description?.trim(),
                    image_url: record.image_url?.trim()
                };

                if (item.name && item.category && item.color) {
                    items.push(item);
                }
            }
        });

        parser.on('error', reject);
        parser.on('end', () => resolve(items));

        parser.write(buffer);
        parser.end();
    });
} 