import { createClient } from "@libsql/client";
import { Duration } from "luxon";
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

export const getRecentBlogs = cached(
  async () => {
    const db = getDb();
    const result = await db.execute(`
    WITH latest_history AS (
      SELECT
        blog_id,
        title,
        ROW_NUMBER() OVER (
          PARTITION BY blog_id
          ORDER BY created_at DESC
        ) AS rn
      FROM blog_history
    )
    SELECT
      b.id,
      b.slug,
      b.created_at,
      lh.title
    FROM blogs b
    JOIN latest_history lh
      ON lh.blog_id = b.id
    AND lh.rn = 1
    ORDER BY b.created_at DESC
    LIMIT 10;
  `);

    return result;
  },
  { ttl: Duration.fromObject({ days: 1 }).as("milliseconds") },
);

export const getBlog = cached(
  async (slug) => {
    const db = getDb();
    const result = await db.execute({
      sql: `
      SELECT
        b.id,
        bh.title,
        bh.content,
        bh.created_at
      FROM blog_history bh
      JOIN blogs b
      ON bh.blog_id = b.id
      WHERE b.slug = ?
      ORDER BY bh.created_at DESC
      LIMIT 1;
    `,
      args: [slug],
    });

    return result;
  },
  { ttl: Duration.fromObject({ days: 1 }).as("milliseconds") },
);

export const getBlogTags = cached(
  async (blogId) => {
    const db = getDb();
    const result = await db.execute({
      sql: `
        SELECT
          t.title
        FROM tags t
        JOIN blog_tags bt
        ON bt.tag_id = t.id
        WHERE bt.blog_id = ?
        ORDER BY t.title ASC;
      `,
      args: [blogId],
    });

    return result;
  },
  { ttl: Duration.fromObject({ days: 1 }).as("milliseconds") },
);
