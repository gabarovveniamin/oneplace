import pool from './config/database';

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running fixed comments migration...');

        // 1. Create Function
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        console.log('Function created/updated.');

        // 2. Create Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS community_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table created.');

        // 3. Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON community_comments(post_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_created_at ON community_comments(created_at)`);
        console.log('Indexes created.');

        // 4. Trigger
        await client.query(`DROP TRIGGER IF EXISTS update_community_comments_updated_at ON community_comments`);
        await client.query(`
            CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
        console.log('Trigger created.');

        console.log('✅ Comments migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
}

runMigration();
