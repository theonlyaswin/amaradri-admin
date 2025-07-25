import { ContentDAO } from '../data-access/contentDAO';
import { IContent } from '../models/Content';
import { logger } from '../config/logger';

export class ContentService {
    static async createContent(contentData: Partial<IContent>): Promise<IContent> {
        try {
            // Add any business logic here before creation
            return await ContentDAO.create(contentData);
        } catch (error) {
            logger.error('Service error while creating content:', error);
            throw error;
        }
    }

    static async getContentById(id: string): Promise<IContent | null> {
        try {
            const content = await ContentDAO.findById(id);
            if (!content) {
                logger.warn(`Content with id ${id} not found`);
            }
            return content;
        } catch (error) {
            logger.error('Service error while getting content:', error);
            throw error;
        }
    }

    static async getAllContents(query: any = {}, options: any = {}): Promise<IContent[]> {
        try {
            return await ContentDAO.findAll(query, options);
        } catch (error) {
            logger.error('Service error while getting all contents:', error);
            throw error;
        }
    }

    static async updateContent(id: string, updateData: Partial<IContent>): Promise<IContent | null> {
        try {
            // Add any business logic here before update
            const content = await ContentDAO.update(id, updateData);
            if (!content) {
                logger.warn(`Content with id ${id} not found for update`);
            }
            return content;
        } catch (error) {
            logger.error('Service error while updating content:', error);
            throw error;
        }
    }

    static async deleteContent(id: string): Promise<IContent | null> {
        try {
            const content = await ContentDAO.delete(id);
            if (!content) {
                logger.warn(`Content with id ${id} not found for deletion`);
            }
            return content;
        } catch (error) {
            logger.error('Service error while deleting content:', error);
            throw error;
        }
    }

    static async searchContents(searchText: string): Promise<IContent[]> {
        try {
            return await ContentDAO.searchByText(searchText);
        } catch (error) {
            logger.error('Service error while searching contents:', error);
            throw error;
        }
    }
} 