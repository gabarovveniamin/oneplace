
import { UserModel } from '../models/User';

async function createAdmin() {
    try {
        console.log('🔍 Checking for existing admin...');

        const email = 'admin@oneplace.com';
        const existingUser = await UserModel.findByEmail(email);

        if (existingUser) {
            console.log(`⚠️ User ${email} already exists.`);
            if (existingUser.role === 'admin') {
                console.log('✅ User is already an admin.');
            } else {
                console.log(`❌ User has role "${existingUser.role}", not "admin".`);
                console.log('Please delete this user or update their role in the database.');
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
