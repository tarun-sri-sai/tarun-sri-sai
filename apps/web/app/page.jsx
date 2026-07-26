import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Tarun Sri Sai - Home",
  description:
    "Welcome to my personal website! Check out about what I do at https://github.com/tarun-sri-sai.",
};

const Home = () => {
  return (
    <main>
      <div className="content-container">
        <Image
          alt={"Profile picture"}
          src="/profile.png"
          width={128}
          height={128}
        />
        <h2>Tarun Sri Sai</h2>

        <div className="content">
          <p>
            {"I solve lazy problems with lazy code, and sometimes it's "}
            probably useful to someone else.
          </p>

          <blockquote>
            <p>Simple is better than complex.</p>
            <footer>
              &mdash; Tim Peters,{" "}
              <a href="https://zen-of-python.info/simple-is-better-than-complex.html">
                The Zen of Python
              </a>
            </footer>
          </blockquote>

          <ul>
            <li>
              Check out my <Link href={"/blog"}>blog</Link> for some slop-free
              content.
            </li>
            <li>
              Check out my <a href="https://github.com/tarun-sri-sai">GitHub</a>{" "}
              for some sloppy code.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Home;
