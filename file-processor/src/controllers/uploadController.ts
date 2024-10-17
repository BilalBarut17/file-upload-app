
       //------ controllers/uploadController.ts
       import { Request, Response } from 'express';
       import AWS from 'aws-sdk';
       
               //----- AWS S3 configuration
       const s3 = new AWS.S3({
           accessKeyId: process.env.AWS_ACCESS_KEY,
           secretAccessKey: process.env.AWS_SECRET_KEY,
           region: process.env.AWS_REGION
       });
       
               //----- File upload function-----
       export const uploadFile = (req: Request, res: Response) => {
           if (!req.file) {
               return res.status(400).send('No file uploaded.');
           }
       
           const params = {
               Bucket: process.env.AWS_BUCKET_NAME ?? "bilal-file-upload",
               Key: req?.file?.originalname,
               Body: req?.file?.buffer,
               ACL: 'private',
           };
       
           s3.upload(params, (err: any, data: any) => {
               if (err) {
                   console.error(err);
                   return res.status(500).json('S3 upload error: ' + err.message);
               }
               return res.status(200).json({"location": params})
           });
       };
       
       
       