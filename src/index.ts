import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; 
import { File } from './controllers/models/file'; // File modelini import et

dotenv.config(); 

      //---- MongoDB connection
const mongoURI = process.env.MONGO_CONNECTION_URL || 'mongodb://localhost:27017/your_database_name';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB bağlantısı başarılı.'))
    .catch(err => console.error('MongoDB bağlantısı hatası:', err));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

    // AWS S3 konfigiration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

     // Eğer uploads dizini yoksa oluştur
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer settings
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Maksimum 5MB
});

//    Sağlık kontrolü endpoint'i
app.get("/health", (req: Request, res: Response) => {
    return res.status(200).json({ state: "Healthy!" });
});

// Dosya upload endpoint'i
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    //     UUID ile benzersiz dosya ismi oluşturuluyor
    const uniqueFileName = `${uuidv4()}-${req.file.originalname}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? "bilal-file-upload", 
        Key: uniqueFileName, 
        Body: req.file.buffer, 
        ACL: 'public-read', 
    };

    try {
        // const s3Data = await s3.upload(params).promise(); // S3'e dosyayı yükle ve promisify ile bekle
        const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;

        // MongoDB'ye dosya bilgilerini kaydet
        const newFile = new File({
            fileName: uniqueFileName,  // Dosya adı
            filePath: fileUrl,         // S3'teki dosya URL'si
            uploadDate: new Date(),    // Yükleme tarihi
        });

        await newFile.save();  // Dosya bilgisini MongoDB'ye kaydet

        const result = await File.findById(newFile.id)

        return res.status(200).json({
            location: fileUrl, 
            message: "File uploaded and saved to MongoDB successfully!",
            result,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json('Error uploading file');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
