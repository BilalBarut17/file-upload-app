import mongoose, { Schema, Document } from 'mongoose';

interface IFile extends Document {
    fileName: string;
    filePath: string;
    uploadDate: Date;
}

const fileSchema: Schema = new Schema({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
});

export const File = mongoose.model<IFile>('File', fileSchema);
