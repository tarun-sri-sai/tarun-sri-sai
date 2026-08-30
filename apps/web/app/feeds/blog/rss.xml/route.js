import { getRecentBlogsCached } from "@/lib/db/blog";

export const revalidate = 86400;

export const GET = async () => {
  const result = await getRecentBlogsCached();
  const columnMap = Object.fromEntries(result.columns.map((v, i) => [v, i]));

  const blogs = [...result.rows]
    .map((r) => ({
      slug: r[columnMap["slug"]],
      title: r[columnMap["title"]],
      created_at: new Date(r[columnMap["created_at"]] * 1000).toISOString(),
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tarun Sri Sai - Blog</title>
    <description>Welcome to my blog! I write about software, take it or leave it.</description>
    <link>https://tarun-sri-sai.vercel.app/blog</link>
    <atom:link href="https://tarun-sri-sai.vercel.app/feeds/blog/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
${blogs
  .map(
    (blog) => `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>https://tarun-sri-sai.vercel.app/blog/${blog.slug}</link>
      <guid>https://tarun-sri-sai.vercel.app/blog/${blog.slug}</guid>
      <pubDate>${new Date(blog.created_at).toUTCString()}</pubDate>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};

const escapeXml = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};
