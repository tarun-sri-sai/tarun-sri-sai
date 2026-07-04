/**
 * Migrates the database schema upward, making changes to bring the schema toward the latest version.
 * @param client - The libsql client to use when migrating.
 * @returns { Promise<void> }
 */
export async function up(client) {
  await client.execute(`CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME NOT NULL
);`);

  await client.execute(
    `CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at);`,
  );

  await client.execute(`CREATE TABLE IF NOT EXISTS blog_history (
  blog_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  PRIMARY KEY (blog_id, created_at),
  FOREIGN KEY (blog_id) REFERENCES blogs(id)
);`);

  await client.execute(
    `CREATE INDEX IF NOT EXISTS blog_history_blog_id_idx ON blog_history(blog_id);`,
  );

  await client.execute(
    `CREATE INDEX IF NOT EXISTS blog_history_created_at_idx ON blog_history(created_at);`,
  );
}

/**
 * Migrates the database schema downward, making changes to roll the schema back to a previous version.
 * @param client - The libsql client to use when migrating.
 * @returns { Promise<void> }
 */
export async function down(client) {
  await client.execute(`DROP INDEX IF EXISTS blog_history_created_at_idx;`);

  await client.execute(`DROP INDEX IF EXISTS blog_history_blog_id_idx;`);

  await client.execute(`DROP TABLE IF EXISTS blog_history;`);

  await client.execute(`DROP INDEX IF EXISTS blogs_created_at_idx;`);

  await client.execute(`DROP TABLE IF EXISTS blogs;`);
}
