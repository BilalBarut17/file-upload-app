import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // 

     //---- MongoDB login
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB bağlantısı başarılı.'))
    .catch(err => console.error('MongoDB bağlantısı hatası:', err));

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// AWS S3 configiration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Max 5MB
});

       //------ Health check endpoint
app.get("/health", (req: Request, res: Response) => {
    return res.status(200).json({ state: "Healthy!" });
});

       //------- File upload endpoint
app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

         //------ UUID update
    const uniqueFileName = `${uuidv4()}-${req.file.originalname}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? "bilal-file-upload", 
        Key: uniqueFileName, 
        Body: req.file.buffer, 
        ACL: 'public-read', 
    };

    s3.upload(params, (err: any, data: any) => {
        if (err) {
            console.error(err);
            return res.status(500).json('S3 upload error: ' + err.message);
        }
        const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
        return res.status(200).json({ location: fileUrl });    //----- uppdate files return
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
