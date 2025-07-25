import mongoose from 'mongoose';
import { logger } from './logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creator-company';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('Successfully connected to MongoDB.');
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('Lost MongoDB connection.');
});

mongoose.connection.on('reconnected', () => {
    logger.info('Reconnected to MongoDB.');
});

export default connectDB; 