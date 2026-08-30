import ListingPageHeader from "@/components/ListingPageHeader/ListingPageHeader";
import Link from "next/link";
import { getBlogHistoryCached } from "@/lib/db/blog-history";

export const revalidate = 86400;

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;

  return {
    title: `Blog Timeline: ${slug}`,
  };
};

const BlogTimelineSlugPage = async ({ params }) => {
  const { slug } = await params;

  const historyResult = await getBlogHistoryCached(slug);
  const columnMap = Object.fromEntries(
    historyResult.columns.map((v, i) => [v, i]),
  );

  return (
    <div className="content-container">
      <ListingPageHeader heading={`${slug}`} />
      <main className="content">
        <section>
          <h2>Revisions</h2>

          <ul>
            {[...historyResult.rows]
              .sort(
                (a, b) =>
                  new Date(b[columnMap["created_at"]]) -
                  new Date(a[columnMap["created_at"]]),
              )
              .map((r) => (
                <li key={r[columnMap["created_at"]]}>
                  <Link
                    href={`/blog-timeline/${slug}/${r[columnMap["created_at"]]}`}
                  >
                    {new Date(r[columnMap["created_at"]] * 1000).toString()}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default BlogTimelineSlugPage;
