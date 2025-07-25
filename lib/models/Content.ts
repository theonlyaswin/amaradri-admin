import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
    title: string;
    platform: string;
    thumbnail: string;
    data: any;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ContentSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        trim: true
    },
    platform: {
        type: String,
        required: [true, 'Platform is required'],
        trim: true
    },
    thumbnail: {
        type: String,
        required: [true, 'Thumbnail URL is required']
    },
    creatorName: {
        type: String,
        required: [true, 'Creator name is required']
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    postedAt: {
        type: Date,
        required: [true, 'Posted at is required']
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    },
    data: {
        type: Schema.Types.Mixed,
        required: [true, 'Content data is required']
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    versionKey: false
});

// Add text index for search functionality
ContentSchema.index({ title: 'text', tags: 'text' });

export const Content = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema); 