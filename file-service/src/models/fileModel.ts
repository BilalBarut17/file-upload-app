import mongoose, { Schema, Document } from 'mongoose';

    
export interface IFile extends Document {
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadDate: Date;
}


const FileSchema: Schema = new Schema({
    fileName: { type: String, required: true },       
    filePath: { type: String, required: true },      
    fileSize: { type: Number, required: true },     
    uploadDate: { type: Date, default: Date.now },    
});

export default mongoose.model<IFile>('File', FileSchema);
