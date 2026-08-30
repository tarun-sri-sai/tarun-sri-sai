import NavBar from "@/components/NavBar/NavBar";
import Header from "@/components/Header/Header";
import Tags from "@/components/Tags/Tags";

const BlogPostHeader = async ({ heading, tags }) => {
  return (
    <Header>
      <NavBar />
      <h1>{heading}</h1>
      <Tags tags={tags} />
    </Header>
  );
};

export default BlogPostHeader;
