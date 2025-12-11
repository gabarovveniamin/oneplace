import database from './src/config/database';

const addAdminNotification = () => {
    const adminId = 'ead30962d4915a7be097dfd44a30b5c7'; // Admin (admin@oneplace.com)

    try {
        const stmt = database.prepare(`
      INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

        stmt.run(
            adminId,
            'system',
            '👑 Привет, Админ!',
            'Система уведомлений работает корректно. Это сообщение специально для администратора.',
            0 // Unread
        );

        console.log('✅ Тестовое уведомление создано для Админа');
    } catch (error) {
        console.error('Ошибка:', error);
    }
};

addAdminNotification();
