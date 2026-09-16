import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Navbar — fixed top bar with logo, nav links, and search.
 * Search submits to /search?q=query via React Router navigation.
 */
export default function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo / site name */}
        <Link to="/" className="navbar-logo">
          Watcher
        </Link>

        {/* Nav links */}
        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/search?q=">Movies</Link>
        </nav>

        {/* Search bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & shows..."
            aria-label="Search movies and TV shows"
          />
          <button type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
