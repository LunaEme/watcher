/**
 * Footer — legal disclaimer shown at the bottom of every page.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} Watcher — this site does not host, store, or distribute
        any media content. All streams are provided by third-party services not affiliated
        with this project.
      </p>
      <p className="site-footer-tmdb">
        All metadata provided by{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>.
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}
