import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlog, getBlogTags } from "@/lib/db/blog";
import styles from "./page.module.css";

export const revalidate = 86400;

export const generateStaticParams = async () => {
  return []
}

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;

  try {
    const columnMap = {};

    const blogResult = await getBlog(slug);
    columnMap.blogResult = Object.fromEntries(
      blogResult.columns.map((v, i) => [v, i]),
    );

    const blogRow = blogResult.rows[0];

    const tagsResult = await getBlogTags(blogRow[columnMap.blogResult["id"]]);
    columnMap.tagsResult = Object.fromEntries(
      tagsResult.columns.map((v, i) => [v, i]),
    );

    return {
      title: blogRow[columnMap.blogResult["title"]],
      keywords: tagsResult.rows.map((tr) => tr[columnMap.tagsResult["title"]]),
    };
  } catch (error) {
    console.error(`error occurred while setting the title: ${error}`);
    return {
      title: "Blog not found",
      keywords: [],
    };
  }
}

const BlogPostPage = async ({ params }) => {
  const { slug } = await params;

  try {
    const columnMap = {};

    const blogResult = await getBlog(slug);
    columnMap.blogResult = Object.fromEntries(
      blogResult.columns.map((v, i) => [v, i]),
    );

    const blogRow = blogResult.rows[0];

    const content = blogRow[columnMap.blogResult["content"]];

    const tagsResult = await getBlogTags(blogRow[columnMap.blogResult["id"]]);
    columnMap.tagsResult = Object.fromEntries(
      tagsResult.columns.map((v, i) => [v, i]),
    );

    return (
      <div className={`content-container ${styles.page}`}>
        <div className="content">
          <header>
            <h1>{blogRow[columnMap.blogResult["title"]]}</h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.875rem",
              }}
            >
              {tagsResult.rows.map((tagRow) => (
                <span
                  key={tagRow[columnMap.tagsResult["title"]]}
                  className="tag"
                >
                  {tagRow[columnMap.tagsResult["title"]]}
                </span>
              ))}
            </div>
          </header>
          <main dangerouslySetInnerHTML={{ __html: content }} />
          <footer>
            <div
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
              <p>Tarun Sri Sai</p>
            </div>
            <p>{`Last edited on: ${new Date(blogRow[columnMap.blogResult["created_at"]] * 1000)}`}</p>
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
