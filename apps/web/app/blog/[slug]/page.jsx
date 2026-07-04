import { notFound } from "next/navigation";
import { getBlog } from "@/lib/db/blog";

export const dynamic = "force-dynamic";

const BlogPostPage = async ({ params }) => {
  const { slug } = await params;

  try {
    const blogResult = await getBlog(slug);
    const columnMap = Object.fromEntries(
      blogResult.columns.map((v, i) => [v, i]),
    );

    const blogRow = blogResult.rows[0];

    return (
      <>
        <header>
          <h1>{blogRow[columnMap["title"]]}</h1>
        </header>
        <main
          dangerouslySetInnerHTML={{ __html: blogRow[columnMap["content"]] }}
        />
        <footer>
          <p>{`Last edited on: ${new Date(blogRow[columnMap["created_at"]])}`}</p>
        </footer>
      </>
    );
  } catch (error) {
    notFound();
  }
};

export default BlogPostPage;
