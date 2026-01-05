import pool from './config/database';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/006_create_friendships.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running friendships migration...');
        await pool.query(sql);
        console.log('✅ Friendships table created successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
