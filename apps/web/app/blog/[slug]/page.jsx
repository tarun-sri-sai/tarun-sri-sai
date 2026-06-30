import { notFound } from "next/navigation";
import { getBlog } from "@/lib/db/blog";
import DOMPurify from "isomorphic-dompurify";

export const dynamic = "force-dynamic";

const BlogPostPage = async ({ params }) => {
  const { slug } = await params;

  try {
    const blogResult = await getBlog(slug);
    const columnMap = Object.fromEntries(
      blogResult.columns.map((v, i) => [v, i]),
    );

    const blogRow = blogResult.rows[0];
    const content = DOMPurify.sanitize(blogRow[columnMap["content"]]);

    return (
      <>
        <header>
          <h1>{blogRow[columnMap["title"]]}</h1>
        </header>
        <main dangerouslySetInnerHTML={{ __html: content }} />
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
