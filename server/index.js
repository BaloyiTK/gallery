import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import imageRoutes from './routes/imageRoutes.js';

const app = express();

// Enable CORS for Vite frontend
app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use(express.json());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Prefix all routes in imageRoutes with /images
app.use('/images', imageRoutes);

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
