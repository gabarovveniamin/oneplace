import { JobModel } from '../models/Job';
import { UserModel } from '../models/User';
import db from './database';

export const seedDatabase = async () => {
    console.log('🌱 Seeding database...');

    try {
        // Проверяем, есть ли уже данные
        const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

        if (usersCount.count > 0) {
            console.log('⚠️ Database already has data. Skipping seed.');
            return;
        }

        // Создаем тестового работодателя
        const employer = await UserModel.create({
            email: 'employer@oneplace.com',
            password: 'password123',
            firstName: 'Иван',
            lastName: 'Работодатель',
            role: 'employer',
            phone: '+7 (999) 000-00-00'
        });

        console.log('👤 Created employer:', employer.email);

        // Создаем тестовые вакансии
        const jobs = [
            {
                title: 'Senior React Developer',
                company: 'TechCorp',
                salary: 'от 250 000 ₽',
                location: 'Москва',
                type: 'full-time',
                description: 'Мы ищем опытного React разработчика для работы над высоконагруженным проектом.\n\nТребования:\n- React, Redux, TypeScript\n- Опыт работы от 3 лет\n- Знание Node.js приветствуется',
                tags: ['React', 'TypeScript', 'Frontend', 'Redux'],
                specialization: 'Разработка',
                experience: '3-5-years',
                employmentType: 'full-time',
                workFormat: 'remote',
                postedBy: employer.id
            },
            {
                title: 'Frontend Developer (Middle)',
                company: 'Creative Studio',
                salary: '120 000 - 180 000 ₽',
                location: 'Санкт-Петербург',
                type: 'full-time',
                description: 'В креативную студию требуется Frontend разработчик.\n\nЗадачи:\n- Верстка макетов\n- Разработка интерактивных элементов\n- Анимации',
                tags: ['JavaScript', 'CSS', 'HTML', 'Animation'],
                specialization: 'Разработка',
                experience: '1-3-years',
                employmentType: 'full-time',
                workFormat: 'office',
                postedBy: employer.id
            },
            {
                title: 'Node.js Backend Developer',
                company: 'FinTech Startup',
                salary: 'от 300 000 ₽',
                location: 'Удаленно',
                type: 'contract',
                description: 'Финтех стартап ищет бэкенд разработчика.\n\nСтек:\n- Node.js, Express\n- PostgreSQL, Redis\n- Docker, Kubernetes',
                tags: ['Node.js', 'Backend', 'PostgreSQL', 'Docker'],
                specialization: 'Разработка',
                experience: '3-5-years',
                employmentType: 'contract',
                workFormat: 'remote',
                postedBy: employer.id
            }
        ];

        for (const job of jobs) {
            await JobModel.create(job);
            console.log(`📝 Created job: ${job.title}`);
        }

        console.log('✅ Seeding completed successfully!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
};
