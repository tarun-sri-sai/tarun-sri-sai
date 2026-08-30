import Image from "next/image";
import BlogPostHeader from "@/components/BlogPostHeader/BlogPostHeader";
import styles from "./BlogPost.module.css";
import { getEmailCached } from "@/lib/db/blog";

const BlogPost = async ({ heading, tags, content, createdAt }) => {
  const emailResult = await getEmailCached();

  return (
    <div className={`content-container ${styles.post}`}>
      <div className="content">
        <BlogPostHeader heading={heading} tags={tags} />
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
            <a href={`mailto:${emailResult}`}>Tarun Sri Sai</a>
          </div>
          <p
            className={styles.lastEdited}
          >{`Last edited on: ${new Date(createdAt * 1000)}`}</p>
        </footer>
      </div>
    </div>
  );
};

export default BlogPost;
