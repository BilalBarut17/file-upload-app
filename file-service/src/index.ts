import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// AWS S3 yapılandırması
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();


const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Maksimum 5MB
});

app.get('/health', (req: Request, res: Response) => {
    return res.status(200).json({ state: 'Healthy!' });
});

// Dosya yükleme (S3'e)
app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    
    const uniqueFileName = `${uuidv4()}-${req.file.originalname}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? 'your-bucket-name',
        Key: uniqueFileName, 
        Body: req.file.buffer, 
        ACL: 'public-read', 
    };

    s3.upload(params, (err: any, data: any) => {
        if (err) {
            console.error('S3 upload error:', err);
            return res.status(500).json({ message: 'Error uploading file' });
        }

        return res.status(200).json({
            message: 'File uploaded successfully',
            location: data.Location, 
        });
    });
});


app.get('/files', (req: Request, res: Response) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? 'your-bucket-name',
    };

    s3.listObjectsV2(params, (err: any, data: any) => {
        if (err) {
            console.error('S3 list error:', err);
            return res.status(500).json({ message: 'Error retrieving files' });
        }

        const files = data.Contents?.map((file: any) => {
            return {
                fileName: file.Key,
                size: file.Size,
                lastModified: file.LastModified,
            };
        });

        return res.status(200).json(files);
    });
});

app.listen(PORT, () => {
    console.log(`File service is running on http://localhost:${PORT}`);
});
