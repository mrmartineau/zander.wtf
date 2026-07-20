-- Site-wide search index. FTS5 virtual table storing its own content.
-- Columns marked UNINDEXED are stored for display but not searchable.
CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
  title,
  description,
  content,
  tags,
  url UNINDEXED,
  site UNINDEXED,
  type UNINDEXED,
  date UNINDEXED,
  emoji UNINDEXED,
  tokenize = 'porter unicode61'
);
