import { Link, useLocation } from "react-router-dom";

/**
 * TopBar — main navigation with Watcher branding + nav links.
 * Transparent at top, blends with hero/backdrop.
 */
export default function TopBar() {
  const location = useLocation();
  const path = location.pathname + location.search;

  const links = [
    { label: "Home", to: "/" },
    { label: "Movies", to: "/browse/movies" },
    { label: "Shows", to: "/browse/tv" },
    { label: "Anime", to: "/browse/anime" },
    { label: "New & Popular", to: "/browse/new" },
  ];

  return (
    <nav className="topbar">
      {/* Logo */}
      <Link to="/" className="topbar-logo">
        <span className="topbar-logo-w">W</span>
        <span className="topbar-logo-text">atcher</span>
      </Link>

      {/* Nav links */}
      <div className="topbar-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`topbar-link ${path === link.to ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Search link */}
      <Link to="/search" className="topbar-search" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </Link>
    </nav>
  );
}
