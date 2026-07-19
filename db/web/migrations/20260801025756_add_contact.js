/**
* Migrates the database schema upward, making changes to bring the schema toward the latest version.
* @param client - The libsql client to use when migrating.
* @returns { Promise<void> }
*/
export async function up(client) {
  await client.execute(`CREATE TABLE IF NOT EXISTS contact (
    id INTEGER PRIMARY KEY,
    attr_name TEXT UNIQUE NOT NULL,
    attr_value TEXT NOT NULL
  );`);
}

/**
* Migrates the database schema downward, making changes to roll the schema back to a previous version.
* @param client - The libsql client to use when migrating.
* @returns { Promise<void> }
*/
export async function down(client) {
  await client.execute(`DROP TABLE IF EXISTS contact`);
}
