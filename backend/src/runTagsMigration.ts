import pool from './config/database';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/008_create_community_tags.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running community tags migration...');
        const commands = sql.split(';').map(c => c.trim()).filter(c => c.length > 0);

        for (const cmd of commands) {
            console.log(`Executing: ${cmd.substring(0, 50)}...`);
            await pool.query(cmd);
        }

        console.log('✅ Community tags tables created successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
