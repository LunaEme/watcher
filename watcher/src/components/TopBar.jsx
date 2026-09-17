import { Link, useLocation } from "react-router-dom";

/**
 * TopBar — horizontal navigation bar at the top.
 * Shows Home, Movies, Series, New & Popular links.
 * Sits above the content, to the right of the sidebar.
 */
export default function TopBar() {
  const location = useLocation();
  const path = location.pathname + location.search;

  const links = [
    { label: "Home", to: "/" },
    { label: "Movies", to: "/browse/movies" },
    { label: "Series", to: "/browse/tv" },
    { label: "New & Popular", to: "/browse/new" },
  ];

  return (
    <nav className="topbar">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`topbar-link ${path === link.to ? "active" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
