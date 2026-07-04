import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlog } from "@/lib/db/blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const blogResult = await getBlog(slug);

    const columnMap = Object.fromEntries(
      blogResult.columns.map((v, i) => [v, i])
    );

    const blogRow = blogResult.rows[0];
    return {
      title: blogRow[columnMap["title"]],
    };
  } catch (error) {
    console.error(`error occurred while setting the title: ${error}`);
    return {
      title: "Blog not found",
    };
  }
}

const BlogPostPage = async ({ params }) => {
  const { slug } = await params;

  try {
    const blogResult = await getBlog(slug);
    const columnMap = Object.fromEntries(
      blogResult.columns.map((v, i) => [v, i]),
    );

    const blogRow = blogResult.rows[0];

    return (
      <div className="content-container">
        <div className="content">
          <header>
            <h1>{blogRow[columnMap["title"]]}</h1>
          </header>
          <main
            dangerouslySetInnerHTML={{ __html: blogRow[columnMap["content"]] }}
          />
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Image
              src="/favicon.ico"
              alt="Profile picture"
              width={32}
              height={32}
            />
            <p>{`Last edited on: ${new Date(blogRow[columnMap["created_at"]])}`}</p>
          </footer>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`error occurred while loading the blog: ${error}`);
    notFound();
  }
};

export default BlogPostPage;
