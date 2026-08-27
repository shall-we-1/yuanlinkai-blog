CREATE TABLE IF NOT EXISTS post_stats (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS post_likes (
  slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (slug, visitor_id)
);

CREATE TABLE IF NOT EXISTS post_viewers (
  slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  last_view_at INTEGER NOT NULL,
  PRIMARY KEY (slug, visitor_id)
);
