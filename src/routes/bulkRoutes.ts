import { Router } from 'express';
import multer from 'multer';
import { BulkController } from '../controllers/bulkController';

const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

const router = Router();

router.post('/import', upload.single('file'), BulkController.importItems);

export default router; 