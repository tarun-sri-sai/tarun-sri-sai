/**
 * Configuration object for libsql-migrate.
 * @typedef {Object.<string, {
 *   connection: import('@libsql/client').Config
 * }>} LibsqlMigrateConfig
 */

/**
 * Configuration object for libsql-migrate.
 * @type {LibsqlMigrateConfig}
 */
export default {
  development: {
    connection: {},
  },
  production: {
    connection: {
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    },
    migrations: {
      directory: "db/web/migrations",
    },
  },
};
