import { Request, Response } from 'express';
import { MarketListingModel } from '../models/MarketListing';

export const marketController = {
    createListing: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { title, description, price, category, images, location } = req.body;
            const userId = (req as any).user.id;

            if (!title || !description || !price || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, description, price, and category are required'
                });
            }

            const listing = await MarketListingModel.create({
                userId,
                title,
                description,
                price: Number(price),
                category,
                images,
                location
            });

            return res.status(201).json({
                success: true,
                data: listing
            });
        } catch (error: any) {
            console.error('Create listing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    getListings: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { category, userId } = req.query;
            const listings = await MarketListingModel.findAll({
                category: category as string,
                userId: userId as string
            });

            return res.json({
                success: true,
                data: listings
            });
        } catch (error: any) {
            console.error('Get listings error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    getUserListings: async (req: Request, res: Response): Promise<Response> => {
        try {
            const userId = req.params.userId;
            const listings = await MarketListingModel.findByUserId(userId);

            return res.json({
                success: true,
                data: listings
            });
        } catch (error: any) {
            console.error('Get user listings error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    deleteListing: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;

            const success = await MarketListingModel.delete(id, userId);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found or unauthorized'
                });
            }

            return res.json({
                success: true,
                message: 'Listing deleted successfully'
            });
        } catch (error: any) {
            console.error('Delete listing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};
