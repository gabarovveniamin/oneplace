
import { UserModel } from './src/models/User';
import { initializeDatabase } from './src/config/initDatabase';

async function createAdmin() {
    try {
        console.log('Checking database...');
        // Ensure tables exist
        initializeDatabase();

        const adminEmail = 'admin@oneplace.com';
        const adminPass = 'adminpassword123';

        const existing = await UserModel.findByEmail(adminEmail);
        if (existing) {
            console.log('Admin user already exists. Updating role to admin...');
            // Directly update role via query since UserModel might not have a direct setRole
            const { query } = await import('./src/config/database');
            await query('UPDATE users SET role = ? WHERE email = ?', ['admin', adminEmail]);
            console.log('✅ Admin permissions granted to:', adminEmail);
        } else {
            console.log('Creating new admin user...');
            const admin = await UserModel.create({
                email: adminEmail,
                password: adminPass,
                firstName: 'Главный',
                lastName: 'Администратор',
                role: 'admin',
                phone: '+70000000000'
            });
            console.log('✅ Admin user created successfully!');
            console.log('Email:', adminEmail);
            console.log('Password:', adminPass);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

createAdmin();
