import { Router } from 'express';
import { uploadFile, listFiles, healthCheck } from '../controllers/fileController';
import multer from 'multer';


const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 5 } }); // Max 5MB

const router = Router();


router.get('/health', healthCheck);


router.post('/upload', upload.single('file'), uploadFile);

router.get('/files', listFiles);

export default router;
