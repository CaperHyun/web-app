import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import itemRoutes from './routes/itemRoutes';
import bulkRoutes from './routes/bulkRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/items', bulkRoutes);

// Serve index.html for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 