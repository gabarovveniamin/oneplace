import { query } from './config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
    try {
        console.log('Running community image migration...');

        const migrationPath = path.join(__dirname, '../migrations/009_add_image_to_community_posts.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        await query(migrationSQL);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
