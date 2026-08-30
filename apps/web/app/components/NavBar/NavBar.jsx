import Link from "next/link";
import styles from "./NavBar.module.css";

const NavBar = () => {
  return (
    <nav className={`navbar ${styles.navbar}`}>
      <div className={styles.navLinks}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/blog-timeline">Blog Timeline</Link>
      </div>
    </nav>
  );
};

export default NavBar;
