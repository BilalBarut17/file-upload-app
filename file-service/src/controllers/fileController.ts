import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";
import File from '../models/fileModel';  //----- Dosya modelini içe aktar------//

dotenv.config();

      //------- AWS S3 yapılandırması------//
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

     //-------- Sağlık kontrolü---------//
export const healthCheck = (req: Request, res: Response) => {
    return res.status(200).json({ state: 'Healthy!' });
};

     //----------Dosya yükleme----------//
export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const uniqueFileName = `temp/${uuidv4()}-${req.file.originalname}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? 'your-bucket-name',
        Key: uniqueFileName, 
        Body: req.file.buffer, 
        ACL: 'public-read',
    };

    try {
        const data = await s3.upload(params).promise();

            //--------- Veritabanına kaydet--------//
        const newFile = new File({
            fileName: uniqueFileName,
            filePath: data.Location,    // Dosyanın S3'teki URL'i
            fileSize: req.file.size,
        });

        await newFile.save();

        return res.status(200).json({
            message: 'File uploaded successfully',
            location: data.Location, 
        });
    } catch (err) {
        console.error('S3 upload error:', err);
        return res.status(500).json({ message: 'Error uploading file' });
    }
};

     //-------- Yüklenen dosyaların listesini al--------//
export const listFiles = async (req: Request, res: Response) => {
    try {
        const files = await File.find();  //------- Veritabanındaki tüm dosyaları getir-----//

        return res.status(200).json(files);
    } catch (err) {
        console.error('Error retrieving files:', err);
        return res.status(500).json({ message: 'Error retrieving files' });
    }
};
