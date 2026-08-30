import Link from "next/link";
import { getBlogHistorySlugsCached } from "@/lib/db/blog-history";
import ListingPageHeader from "@/components/ListingPageHeader/ListingPageHeader";

export const revalidate = 86400;

export const metadata = {
  title: "Tarun Sri Sai - Blog Timeline",
  description: "View all blog articles by slug in chronological history.",
};

const BlogTimelinePage = async () => {
  const slugsResult = await getBlogHistorySlugsCached();
  const columnMap = Object.fromEntries(
    slugsResult.columns.map((v, i) => [v, i]),
  );

  return (
    <div className="content-container">
      <ListingPageHeader heading="My blog timeline" />
      <main className="content">
        <section>
          <h2>Articles</h2>

          <ul>
            {[...slugsResult.rows]
              .sort(
                (a, b) =>
                  new Date(b[columnMap["created_at"]]) -
                  new Date(a[columnMap["created_at"]]),
              )
              .map((r) => (
                <li key={r[columnMap["slug"]]}>
                  <Link href={`/blog-timeline/${r[columnMap["slug"]]}`}>
                    {`${r[columnMap["slug"]]}`}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default BlogTimelinePage;
