import Link from "next/link";
import { getRecentBlogs } from "@/lib/db/blog";

export const dynamic = "force-dynamic";

const BlogPage = async () => {
  const recentBlogsResult = await getRecentBlogs();
  const columnMap = Object.fromEntries(
    recentBlogsResult.columns.map((v, i) => [v, i]),
  );

  return (
    <>
      <header>
        <h1>Welcome to my blog!</h1>
      </header>
      <main>
        <section>
          <h2>Recent Blogs</h2>

          <ul>
            {[...recentBlogsResult.rows]
              .sort(
                (a, b) =>
                  new Date(b[columnMap["created_at"]]) -
                  new Date(a[columnMap["created_at"]]),
              )
              .map((r) => (
                <li key={r[columnMap["slug"]]}>
                  <Link href={`/blog/${r[columnMap["slug"]]}`}>
                    {r[columnMap["title"]]}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </main>
    </>
  );
};

export default BlogPage;
