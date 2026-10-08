-- One row per reader per page: views are unique readers, not page loads.
CREATE TABLE views (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  PRIMARY KEY (slug, visitor)
) WITHOUT ROWID;

-- n is how many times this reader hearted this page (capped in the API).
CREATE TABLE hearts (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (slug, visitor)
) WITHOUT ROWID;

-- start is the character offset of text inside the page's article.
CREATE TABLE highlights (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  text TEXT NOT NULL,
  start INTEGER NOT NULL,
  city TEXT,
  country TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (slug, visitor, start)
);
CREATE INDEX highlights_slug ON highlights (slug);
