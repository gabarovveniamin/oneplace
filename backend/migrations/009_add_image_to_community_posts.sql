-- Migration to add image support for community posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
