import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ResumeModel } from '../models/Resume';

export const resumeController = {
    getResume: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }

            const resume = await ResumeModel.findByUserId(userId);

            if (!resume) {
                res.status(404).json({ success: false, message: 'Резюме не найдено' });
                return;
            }

            res.json({ success: true, data: resume });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Ошибка при получении резюме' });
        }
    },

    getResumeByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            const resume = await ResumeModel.findByUserId(userId);

            if (!resume) {
                res.status(404).json({ success: false, message: 'Резюме не найдено' });
                return;
            }

            res.json({ success: true, data: resume });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Ошибка при получении резюме пользователя' });
        }
    },

    updateResume: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }
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
        } catch (err) {
            res.status(500).json({ success: false, message: 'Ошибка при сохранении резюме' });
        }
    }
};
