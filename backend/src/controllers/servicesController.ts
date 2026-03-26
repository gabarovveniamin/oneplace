import { Request, Response } from 'express';
import { ServiceListingModel } from '../models/ServiceListing';

export const servicesController = {
    createService: async (req: Request, res: Response): Promise<Response> => {
        try {
            const {
                title,
                description,
                category,
                price,
                pricingType,
                experienceLevel,
                tags,
                location,
                portfolioUrl
            } = req.body;
            const userId = (req as any).user.id as string;

            if (!title || !description || !category || !price) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, description, category and price are required'
                });
            }

            const listing = await ServiceListingModel.create({
                userId,
                title,
                description,
                category,
                price: Number(price),
                pricingType,
                experienceLevel,
                tags,
                location,
                portfolioUrl
            });

            return res.status(201).json({
                success: true,
                data: listing
            });
        } catch (error) {
            console.error('Create service error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    getServices: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { category, userId } = req.query;
            const services = await ServiceListingModel.findAll({
                category: category as string,
                userId: userId as string
            });

            return res.json({
                success: true,
                data: services
            });
        } catch (error) {
            console.error('Get services error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    getServiceById: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const service = await ServiceListingModel.findById(id);

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }

            return res.json({
                success: true,
                data: service
            });
        } catch (error) {
            console.error('Get service by id error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    getUserServices: async (req: Request, res: Response): Promise<Response> => {
        try {
            const userId = req.params.userId;
            const services = await ServiceListingModel.findByUserId(userId);

            return res.json({
                success: true,
                data: services
            });
        } catch (error) {
            console.error('Get user services error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    deleteService: async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id as string;

            const success = await ServiceListingModel.delete(id, userId);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found or unauthorized'
                });
            }

            return res.json({
                success: true,
                message: 'Service deleted successfully'
            });
        } catch (error) {
            console.error('Delete service error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};