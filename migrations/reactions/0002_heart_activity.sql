-- When and where a reader last hearted a page, for the activity feed on /stats.
-- Rows from before this migration have no time and stay out of the feed.
ALTER TABLE hearts ADD COLUMN updated_at INTEGER;
ALTER TABLE hearts ADD COLUMN city TEXT;
ALTER TABLE hearts ADD COLUMN country TEXT;
