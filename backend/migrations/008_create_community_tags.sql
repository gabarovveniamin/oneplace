-- Migration for Community Tags
CREATE TABLE IF NOT EXISTS community_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_post_tags (
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES community_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON community_post_tags(tag_id);
