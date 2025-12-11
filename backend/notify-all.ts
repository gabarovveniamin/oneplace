import database from './src/config/database';

const notifyAll = () => {
    try {
        const users = database.prepare('SELECT id, email, first_name FROM users').all() as any[];

        const stmt = database.prepare(`
            INSERT INTO notifications (user_id, type, title, message, is_read, related_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `);

        users.forEach(user => {
            stmt.run(
                user.id,
                'system',
                `Привет, ${user.first_name || 'Пользователь'}!`,
                `Это проверочное уведомление. Если вы видите его, значит всё работает! (Email: ${user.email})`,
                0, // Unread
                null
            );
            console.log(`✅ Sent to ${user.email} (${user.id})`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
};

notifyAll();
