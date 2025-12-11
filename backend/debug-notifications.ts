import database from './src/config/database';

const checkNotifications = () => {
    try {
        const users = database.prepare('SELECT id, email, role FROM users').all();
        console.log('USERS:', JSON.stringify(users, null, 2));

        const notifications = database.prepare('SELECT * FROM notifications').all();
        console.log('NOTIFICATIONS:', JSON.stringify(notifications, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
};

checkNotifications();
