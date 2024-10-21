import mongoose, { Document, Schema } from 'mongoose';

interface IPhoto extends Document {
    filename: string;
    url: string;
    uploadDate: Date;
}

const photoSchema: Schema = new Schema({
    filename: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

const Photo = mongoose.model<IPhoto>('Photo', photoSchema);

export default Photo;
