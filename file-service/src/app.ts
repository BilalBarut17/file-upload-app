import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fileRoutes from './routes/fileRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

     // MongoDB bağlantısı
mongoose.connect(process.env.MONGO_CONNECTION_URL ?? '')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json()); // JSON gövdesini işlemek için

       // Rotalar
app.use('/api/files', fileRoutes);

// Hata yönetim middleware'i
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
