-- Simply drop and recreate if needed or just add IF NOT EXISTS more carefully?
-- Actually, ALTER COLUMN usually works. Maybe data prevents it? 
-- "timestamp without time zone" to "timestamp with time zone" usually requires explicit USING.
-- `USING created_at AT TIME ZONE 'UTC'` or similar.
-- Assuming stored data is UTC (because CURRENT_TIMESTAMP in node/postgres usually defaults to UTC or local, but without offset info).
-- If we assume it was UTC, we say `AT TIME ZONE 'UTC'`.

ALTER TABLE community_posts 
  ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC';
