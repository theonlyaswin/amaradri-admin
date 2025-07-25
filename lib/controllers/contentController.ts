import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '../services/contentService';
import { logger } from '../config/logger';

export class ContentController {
    static async createContent(req: NextRequest) {
        try {
            const contentData = await req.json();
            const content = await ContentService.createContent(contentData);
            logger.info(`Content created successfully with id: ${content._id}`);
            return NextResponse.json(content, { status: 201 });
        } catch (error) {
            logger.error('Controller error while creating content:', error);
            return NextResponse.json(
                { error: 'Failed to create content' },
                { status: 500 }
            );
        }
    }

    static async getContent(req: NextRequest) {
        try {
            const id = req.nextUrl.pathname.split('/').pop();
            if (!id) {
                return NextResponse.json(
                    { error: 'Content ID is required' },
                    { status: 400 }
                );
            }

            const content = await ContentService.getContentById(id);
            if (!content) {
                return NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(content);
        } catch (error) {
            logger.error('Controller error while getting content:', error);
            return NextResponse.json(
                { error: 'Failed to get content' },
                { status: 500 }
            );
        }
    }

    static async getAllContents(req: NextRequest) {
        try {
            const searchParams = req.nextUrl.searchParams;
            const query = Object.fromEntries(searchParams.entries());
            const contents = await ContentService.getAllContents(query);
            return NextResponse.json(contents);
        } catch (error) {
            logger.error('Controller error while getting all contents:', error);
            return NextResponse.json(
                { error: 'Failed to get contents' },
                { status: 500 }
            );
        }
    }

    static async updateContent(req: NextRequest) {
        try {
            const id = req.nextUrl.pathname.split('/').pop();
            if (!id) {
                return NextResponse.json(
                    { error: 'Content ID is required' },
                    { status: 400 }
                );
            }

            const updateData = await req.json();
            const content = await ContentService.updateContent(id, updateData);

            if (!content) {
                return NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 }
                );
            }

            logger.info(`Content updated successfully with id: ${id}`);
            return NextResponse.json(content);
        } catch (error) {
            logger.error('Controller error while updating content:', error);
            return NextResponse.json(
                { error: 'Failed to update content' },
                { status: 500 }
            );
        }
    }

    static async deleteContent(req: NextRequest) {
        try {
            const id = req.nextUrl.pathname.split('/').pop();
            if (!id) {
                return NextResponse.json(
                    { error: 'Content ID is required' },
                    { status: 400 }
                );
            }

            const content = await ContentService.deleteContent(id);
            if (!content) {
                return NextResponse.json(
                    { error: 'Content not found' },
                    { status: 404 }
                );
            }

            logger.info(`Content deleted successfully with id: ${id}`);
            return NextResponse.json({ message: 'Content deleted successfully' });
        } catch (error) {
            logger.error('Controller error while deleting content:', error);
            return NextResponse.json(
                { error: 'Failed to delete content' },
                { status: 500 }
            );
        }
    }

    static async searchContents(req: NextRequest) {
        try {
            const searchText = req.nextUrl.searchParams.get('q');
            if (!searchText) {
                return NextResponse.json(
                    { error: 'Search text is required' },
                    { status: 400 }
                );
            }

            const contents = await ContentService.searchContents(searchText);
            return NextResponse.json(contents);
        } catch (error) {
            logger.error('Controller error while searching contents:', error);
            return NextResponse.json(
                { error: 'Failed to search contents' },
                { status: 500 }
            );
        }
    }
} 