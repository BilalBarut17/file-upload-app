import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import File from '../models/fileModel';

     //-------- AWS S3 yapılandırması-------//
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

     //-------- Dosya yükleme işlemi-------//
export const uploadFileToS3 = async (file: Express.Multer.File) => {
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME ?? 'your-bucket-name',
        Key: uniqueFileName,
        Body: file.buffer,
        ACL: 'public-read',
    };

    try {
        const data = await s3.upload(params).promise();
        return {
            fileName: uniqueFileName,
            location: data.Location, // S3'teki dosya yolu
            size: file.size, // Dosya boyutu
        };
    } catch (err) {
        console.error('S3 upload error:', err);
        throw new Error('Error uploading file to S3');
    }
};

     //-------- Dosyayı veritabanına kaydetme işlemi---------//
export const saveFileToDatabase = async (fileData: { fileName: string; filePath: string; fileSize: number }) => {
    try {
        const newFile = new File({
            fileName: fileData.fileName,
            filePath: fileData.filePath,
            fileSize: fileData.fileSize,
        });

        const savedFile = await newFile.save();
        return savedFile;
    } catch (err) {
        console.error('Database save error:', err);
        throw new Error('Error saving file to database');
    }
};

     //---------- Veritabanındaki dosyaları listeleme işlemi------//
export const listAllFilesFromDatabase = async () => {
    try {
        const files = await File.find(); 
        return files;
    } catch (err) {
        console.error('Error retrieving files from database:', err);
        throw new Error('Error retrieving files from database');
    }
};
