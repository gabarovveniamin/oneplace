import database from './src/config/database';

const showAdmin = () => {
    const admin = database.prepare("SELECT * FROM users WHERE email = 'admin@oneplace.com'").get();
    console.log('ADMIN USER:', admin);
};

showAdmin();
