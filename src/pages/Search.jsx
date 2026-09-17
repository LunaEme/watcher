import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { search } from "../services/tmdb";
import MediaCard from "../components/MediaCard";

/**
 * Search page — live results as you type, debounced 400ms.
 * Also supports ?q= URL param for direct links.
 */
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  /* Live search: debounce 400ms after typing stops */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      // Update URL without navigation
      setSearchParams({ q: trimmed }, { replace: true });

      search(trimmed)
        .then((data) => {
          const filtered = (data.results || []).filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          );
          setResults(filtered);
        })
        .catch((err) => console.error("Search failed:", err))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  /* If URL query changes externally (e.g. from navbar search) */
  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  return (
    <div className="page search-page">
      {/* Inline search input */}
      <div className="search-inline">
        <svg className="search-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies & shows..."
          autoFocus
          className="search-inline-input"
        />
        {query && (
          <button className="search-inline-clear" onClick={() => setQuery("")}>✕</button>
        )}
      </div>

      {query.trim() && (
        <h2 className="search-heading">
          Results for "{query.trim()}"
        </h2>
      )}

      {loading && <p className="search-status">Searching...</p>}

      {!loading && query.trim() && results.length === 0 && (
        <p className="search-status">No results found for "{query.trim()}"</p>
      )}

      <div className="search-grid">
        {results.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
