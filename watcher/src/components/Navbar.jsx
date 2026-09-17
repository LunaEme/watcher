import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

/**
 * Sidebar — Prime Video-style left navigation.
 * Collapsible: shows icons only when collapsed, icons + labels when expanded.
 * Contains logo, search, nav links.
 */
export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
    setSearchOpen(false);
  };

  /** Check if a nav link is the current route */
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`sidebar ${expanded ? "sidebar-expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <Link to="/" className="sidebar-logo">
          <span className="sidebar-logo-icon">W</span>
          <span className="sidebar-logo-text">atcher</span>
        </Link>

        {/* Search toggle */}
        <button
          className="sidebar-item"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Search"
        >
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="sidebar-label">Search</span>
        </button>

        {/* Nav links */}
        <Link to="/" className={`sidebar-item ${isActive("/") ? "active" : ""}`}>
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="sidebar-label">Home</span>
        </Link>

        <Link to="/search?q=&type=movie" className={`sidebar-item ${location.pathname === "/search" && location.search.includes("type=movie") ? "active" : ""}`}>
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
            <line x1="17" y1="17" x2="22" y2="17" />
          </svg>
          <span className="sidebar-label">Movies</span>
        </Link>

        <Link to="/search?q=&type=tv" className={`sidebar-item ${location.pathname === "/search" && location.search.includes("type=tv") ? "active" : ""}`}>
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
          <span className="sidebar-label">TV Shows</span>
        </Link>

        <Link to="/categories" className="sidebar-item">
          <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="sidebar-label">Categories</span>
        </Link>
      </aside>

      {/* Search overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <form
            className="search-overlay-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSearch}
          >
            <svg className="search-overlay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies & shows..."
              autoFocus
            />
            <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
              ✕
            </button>
          </form>
        </div>
      )}
    </>
  );
}
