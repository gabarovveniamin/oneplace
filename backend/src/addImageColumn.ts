import { query } from './config/database';

async function addImageColumn() {
    try {
        console.log('Adding image_url column to community_posts...');
        await query('ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS image_url TEXT');
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addImageColumn();
