import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { JobModel } from '../models/Job';

// Получить список всех пользователей
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await UserModel.findAll();
        res.json({
            success: true,
            data: { users }
        });
    } catch (error) {
        next(error);
    }
};

// Удалить пользователя
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Нельзя удалить самого себя
        if (req.user?.id === id) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
            return;
        }

        const deleted = await UserModel.delete(id);
        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Получить все вакансии (включая неактивные)
export const getAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // isActive: false отключает фильтр по активным (находит все)
        const { jobs } = await JobModel.findMany({ isActive: false }, { page: 1, limit: 1000 });
        res.json({
            success: true,
            data: { jobs }
        });
    } catch (error) {
        next(error);
    }
};

// Удалить вакансию (админская версия)
export const deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const deleted = await JobModel.delete(id);
        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Job not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
