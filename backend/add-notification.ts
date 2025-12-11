import database from './src/config/database';

const addNotification = () => {
    const userId = '483db70da1836fd5c0acdc3f8df20252'; // Вениамин Габаров (User)
    // const userId = '3d63909dd667662d53af411488370db7'; // Boss (Employer)

    try {
        const stmt = database.prepare(`
      INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

        stmt.run(
            userId,
            'system',
            '🎉 Уведомления работают!',
            'Это тестовое уведомление, подтверждающее, что система уведомлений в колокольчике полностью настроена и функционирует.',
            0 // Unread
        );

        console.log('✅ Тестовое уведомление создано для пользователя Вениамин Габаров');
    } catch (error) {
        console.error('Ошибка:', error);
    }
};

addNotification();
