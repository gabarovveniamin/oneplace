import { UserModel } from './src/models/User';

async function createAdmin() {
    try {
        console.log('🔍 Checking for existing admin...');

        const email = 'admin@oneplace.com';
        // We might need to initialize DB first if UserModel doesn't do it lazily?
        // UserModel imports 'query' from config/database, which inits on load.

        const existingUser = await UserModel.findByEmail(email);

        if (existingUser) {
            console.log(`⚠️ User ${email} already exists.`);
            if (existingUser.role === 'admin') {
                console.log('✅ User is already an admin.');
            } else {
                console.log(`❌ User has role "${existingUser.role}", not "admin".`);
                // Force update to admin
                // Note: We need to bypass the model update restriction if any
                // The model.update method logs stuff.
                // Let's modify directly via SQL if needed, but model is safer.
                /*
                const db = require('better-sqlite3')('database.sqlite');
                db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
                console.log('✅ Force updated user to admin via raw SQL.');
                */
                console.log('Please delete the user manually or use SQL to update.');
            }
            return;
        }

        console.log('👤 Creating admin user...');
        const admin = await UserModel.create({
            email: email,
            password: 'admin123',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'admin',
            phone: '+70000000000'
        });

        console.log('✨ Admin created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password: admin123');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    }
}

createAdmin();
