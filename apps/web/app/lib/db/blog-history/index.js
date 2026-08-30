import { createClient } from "@libsql/client";
import { cached } from "@tarun-sri-sai/function-cache";

let db;

const getDb = () => {
  if (db) {
    return db;
  }

  const url = process.env.BLOG_TURSO_DATABASE_URL;
  const authToken = process.env.BLOG_TURSO_AUTH_TOKEN;

  db = createClient({
    url,
    authToken,
  });
  return db;
};

const getBlogHistorySlugs = async () => {
  const db = getDb();
  const result = await db.execute(`
    SELECT DISTINCT slug FROM blogs ORDER BY created_at DESC;
  `);

  return result;
};

export const getBlogHistorySlugsCached = cached(getBlogHistorySlugs);

const getBlogHistory = async (slug) => {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT bh.*, b.slug
      FROM blog_history bh
      JOIN blogs b ON bh.blog_id = b.id
      WHERE b.slug = ?
      ORDER BY bh.created_at ASC;
    `,
    args: [slug],
  });

  return result;
};

export const getBlogHistoryCached = cached(getBlogHistory);
