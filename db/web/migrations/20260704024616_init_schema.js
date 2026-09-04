/**
 * Migrates the database schema upward, making changes to bring the schema toward the latest version.
 * @param client - The libsql client to use when migrating.
 * @returns { Promise<void> }
 */
export const up = async (client) => {
  await client.execute(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT (unixepoch('now'))
  );`);

  await client.execute(
    `CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at);`,
  );

  await client.execute(`CREATE TABLE IF NOT EXISTS blog_history (
    blog_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT (unixepoch('now')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    PRIMARY KEY (blog_id, created_at),
    FOREIGN KEY (blog_id) REFERENCES blogs(id)
  ) WITHOUT ROWID;`);

  await client.execute(
    `CREATE INDEX IF NOT EXISTS blog_history_blog_id_idx ON blog_history(blog_id);`,
  );

  await client.execute(
    `CREATE INDEX IF NOT EXISTS blog_history_created_at_idx ON blog_history(created_at);`,
  );

  await client.execute(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY,
    title TEXT UNIQUE NOT NULL
  );`);

  await client.execute(`CREATE TABLE IF NOT EXISTS blog_tags (
    tag_id INTEGER NOT NULL,
    blog_id INTEGER NOT NULL,
    PRIMARY KEY (tag_id, blog_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id)
  ) WITHOUT ROWID;`);
};

/**
 * Migrates the database schema downward, making changes to roll the schema back to a previous version.
 * @param client - The libsql client to use when migrating.
 * @returns { Promise<void> }
 */
export const down = async (client) => {
  await client.execute(`DROP TABLE IF EXISTS blog_tags;`);

  await client.execute(`DROP TABLE IF EXISTS tags;`);

  await client.execute(`DROP INDEX IF EXISTS blog_history_created_at_idx;`);

  await client.execute(`DROP INDEX IF EXISTS blog_history_blog_id_idx;`);

  await client.execute(`DROP TABLE IF EXISTS blog_history;`);

  await client.execute(`DROP INDEX IF EXISTS blogs_created_at_idx;`);

  await client.execute(`DROP TABLE IF EXISTS blogs;`);
};
