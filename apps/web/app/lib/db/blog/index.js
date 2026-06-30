import { createClient } from "@libsql/client";
import { Duration } from "luxon";
import { cached } from "@tarun-sri-sai/function-cache";

const db = createClient({
  url: process.env.BLOG_TURSO_DATABASE_URL,
  authToken: process.env.BLOG_TURSO_AUTH_TOKEN,
});

export const getRecentBlogs = cached(
  async () => {
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
  { ttl: Duration.fromObject({ hours: 1 }).as("milliseconds") },
);

export const getBlog = cached(
  async (slug) => {
    const result = await db.execute({
      sql: `
      SELECT
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
    args: [slug]
  });

    return result;
  },
  { ttl: Duration.fromObject({ hours: 1 }).as("milliseconds") },
);
