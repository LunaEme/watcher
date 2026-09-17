import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { search } from "../services/tmdb";
import MediaCard from "../components/MediaCard";

/**
 * Search page
 * Reads ?q= from the URL, fetches TMDB multi-search results.
 * Filters out "person" results since we only show movies and TV.
 */
export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    search(query)
      .then((data) => {
        // Filter to only movies and TV shows (exclude people)
        const filtered = (data.results || []).filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );
        setResults(filtered);
      })
      .catch((err) => console.error("Search failed:", err))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="page search-page">
      <h1 className="search-heading">
        {query ? `Results for "${query}"` : "Search"}
      </h1>

      {loading && <p className="search-status">Searching...</p>}

      {!loading && query && results.length === 0 && (
        <p className="search-status">No results found for "{query}"</p>
      )}

      <div className="search-grid">
        {results.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
