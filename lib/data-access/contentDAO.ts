import { Content, IContent } from '../models/Content';
import { logger } from '../config/logger';

export class ContentDAO {
    static async create(contentData: Partial<IContent>): Promise<IContent> {
        try {
            const content = new Content(contentData);
            return await content.save();
        } catch (error) {
            logger.error('Error creating content:', error);
            throw error;
        }
    }

    static async findById(id: string): Promise<IContent | null> {
        try {
            return await Content.findById(id);
        } catch (error) {
            logger.error(`Error finding content with id ${id}:`, error);
            throw error;
        }
    }

    static async findAll(query: any = {}, options: any = {}): Promise<IContent[]> {
        try {
            const docs = await Content.find(query, null, options);
            return docs.map(doc => doc.toObject()) as IContent[];
        } catch (error) {
            logger.error('Error finding contents:', error);
            throw error;
        }
    }

    static async update(id: string, updateData: Partial<IContent>): Promise<IContent | null> {
        try {
            return await Content.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            logger.error(`Error updating content with id ${id}:`, error);
            throw error;
        }
    }

    static async delete(id: string): Promise<IContent | null> {
        try {
            return await Content.findByIdAndDelete(id);
        } catch (error) {
            logger.error(`Error deleting content with id ${id}:`, error);
            throw error;
        }
    }

    static async searchByText(searchText: string): Promise<IContent[]> {
        try {
            return await Content.find(
                { $text: { $search: searchText } },
                { score: { $meta: 'textScore' } }
            ).sort({ score: { $meta: 'textScore' } });
        } catch (error) {
            logger.error(`Error searching contents with text ${searchText}:`, error);
            throw error;
        }
    }
} 