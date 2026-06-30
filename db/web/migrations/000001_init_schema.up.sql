CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at);

CREATE TABLE IF NOT EXISTS blog_history (
  blog_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  PRIMARY KEY (blog_id, created_at),
  FOREIGN KEY (blog_id) REFERENCES blogs(id)
);

CREATE INDEX IF NOT EXISTS blog_history_blog_id_idx ON blog_history(blog_id);

CREATE INDEX IF NOT EXISTS blog_history_created_at_idx ON blog_history(created_at);
