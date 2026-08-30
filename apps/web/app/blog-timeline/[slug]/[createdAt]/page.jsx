import { getBlogCached, getBlogTagsCached } from "@/lib/db/blog";
import BlogPost from "@/components/BlogPost/BlogPost";

export const revalidate = 86400;

export const generateMetadata = async ({ params }) => {
  const { slug, createdAt } = await params;

  try {
    const blogResult = await getBlogCached(slug);
    const columnMap = Object.fromEntries(
      blogResult.columns.map((v, i) => [v, i]),
    );

    const blogRow = blogResult.rows.filter(
      (br) => br[columnMap["created_at"]] == createdAt,
    )[0];

    const tagsResult = await getBlogTagsCached(blogRow[columnMap["id"]]);

    return {
      title: blogRow[columnMap["title"]],
      keywords: tagsResult,
    };
  } catch (error) {
    console.error(`error occurred while setting the title: ${error}`);
    return {
      title: "Blog not found",
      keywords: [],
    };
  }
};

const BlogPostPage = async ({ params }) => {
  const { slug, createdAt } = await params;

  const blogResult = await getBlogCached(slug);
  const columnMap = Object.fromEntries(
    blogResult.columns.map((v, i) => [v, i]),
  );

  const blogRow = blogResult.rows.filter(
    (br) => br[columnMap["created_at"]] == createdAt,
  )[0];

  const content = blogRow[columnMap["content"]];
  const tagsResult = await getBlogTagsCached(blogRow[columnMap["id"]]);

  return (
    <BlogPost
      heading={blogRow[columnMap["title"]]}
      content={content}
      tags={tagsResult}
      createdAt={blogRow[columnMap["created_at"]]}
    />
  );
};

export default BlogPostPage;
