import database from './src/config/database';

const listUsers = () => {
    try {
        const users = database.prepare('SELECT id, email, role, first_name FROM users').all();
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

listUsers();
