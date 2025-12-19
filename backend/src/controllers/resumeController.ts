import { Request, Response } from 'express';
import { ResumeModel } from '../models/Resume';
import fs from 'fs';
import path from 'path';

const logToFile = (message: string) => {
    const logPath = path.resolve(process.cwd(), 'backend_debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
};

export const resumeController = {
    getResume: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            logToFile(`getResume called for user: ${userId}`);

            const resume = await ResumeModel.findByUserId(userId);
            logToFile(`Resume search result: ${resume ? 'FOUND' : 'NOT FOUND'}`);

            if (!resume) {
                res.status(404).json({ success: false, message: 'Резюме не найдено' });
                return;
            }

            res.json({ success: true, data: resume });
        } catch (error: any) {
            const errorMessage = error?.message || 'Unknown error';
            logToFile(`Get resume error: ${errorMessage}\nStack: ${error?.stack}`);
            console.error('Get resume error:', error);
            res.status(500).json({ success: false, message: 'Ошибка при получении резюме' });
        }
    },

    getResumeByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            logToFile(`getResumeByUserId called for userId: ${userId}`);

            const resume = await ResumeModel.findByUserId(userId);

            if (!resume) {
                res.status(404).json({ success: false, message: 'Резюме не найдено' });
                return;
            }

            res.json({ success: true, data: resume });
        } catch (error: any) {
            console.error('Get resume by id error:', error);
            res.status(500).json({ success: false, message: 'Ошибка при получении резюме пользователя' });
        }
    },

    updateResume: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            console.log('Update resume requested for user:', userId);
            const {
                title,
                city,
                phone,
                salary,
                summary,
                skills,
                experience,
                education,
                projects
            } = req.body;

            const resume = await ResumeModel.createOrUpdate({
                userId,
                title: title || '',
                city: city || '',
                phone: phone || '',
                salary: salary || '',
                summary: summary || '',
                skills: skills || [],
                experience: experience || [],
                education: education || [],
                projects: projects || []
            });

            res.json({ success: true, data: resume });
        } catch (error: any) {
            console.error('Update resume error:', error);
            res.status(500).json({ success: false, message: 'Ошибка при сохранении резюме' });
        }
    }
};
