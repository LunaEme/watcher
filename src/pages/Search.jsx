import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { search, discover } from "../services/tmdb";
import { LANGUAGES, COUNTRIES } from "../services/constants";
import MediaCard from "../components/MediaCard";
import PersonSearch from "../components/PersonSearch";

/**
 * Search page — live debounced search with filters.
 * Actor (multi-select), director (single), year range, language, country.
 */

const currentYear = new Date().getFullYear();

export default function Search() {
  useEffect(() => { document.title = "Search - Watcher"; }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  /* Filters */
  const [actors, setActors] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [language, setLanguage] = useState("");
  const [country, setCountry] = useState("");

  const addActor = (person) => setActors((prev) => [...prev, person]);
  const removeActor = (id) => setActors((prev) => prev.filter((p) => p.id !== id));
  const addDirector = (person) => setDirectors([person]);
  const removeDirector = () => setDirectors([]);

  const hasFilters = actors.length > 0 || directors.length > 0 ||
                     yearFrom || yearTo || language || country;

  /* Search logic */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed && !hasFilters) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        if (hasFilters) {
          /* Use discover for both movie and TV */
          const params = { sort_by: "popularity.desc" };
          if (actors.length > 0) params.with_cast = actors.map((a) => a.id).join(",");
          if (directors.length > 0) params.with_crew = directors.map((d) => d.id).join(",");
          if (language) params.with_original_language = language;
          if (country) params.with_origin_country = country;
          if (yearFrom) params["primary_release_date.gte"] = `${yearFrom}-01-01`;
          if (yearTo) params["primary_release_date.lte"] = `${yearTo}-12-31`;

          const tvParams = { ...params };
          if (yearFrom) { tvParams["first_air_date.gte"] = `${yearFrom}-01-01`; delete tvParams["primary_release_date.gte"]; }
          if (yearTo) { tvParams["first_air_date.lte"] = `${yearTo}-12-31`; delete tvParams["primary_release_date.lte"]; }

          const [movieRes, tvRes] = await Promise.all([
            discover("movie", params),
            discover("tv", tvParams),
          ]);

          const movies = (movieRes.results || []).map((m) => ({ ...m, media_type: "movie" }));
          const tvShows = (tvRes.results || []).map((t) => ({ ...t, media_type: "tv" }));
          let merged = [...movies, ...tvShows];
          merged.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

          if (trimmed) {
            const lower = trimmed.toLowerCase();
            merged = merged.filter((item) => {
              const title = (item.title || item.name || "").toLowerCase();
              return title.includes(lower);
            });
          }

          setResults(merged);
        } else {
          setSearchParams({ q: trimmed }, { replace: true });
          const data = await search(trimmed);
          const filtered = (data.results || []).filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          );
          setResults(filtered);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, actors, directors, yearFrom, yearTo, language, country]);

  useEffect(() => {
    if (urlQuery && urlQuery !== query) setQuery(urlQuery);
  }, [urlQuery]);

  const clearAll = () => {
    setActors([]);
    setDirectors([]);
    setYearFrom("");
    setYearTo("");
    setLanguage("");
    setCountry("");
  };

  return (
    <div className="page search-page">
      <div className="search-layout">
        {/* ─── Left: filters ─── */}
        <aside className="search-filters">
          <h3 className="filter-panel-title">Filters</h3>

          {/* Year range */}
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <div className="filter-year-row">
              <select className="filter-select filter-select-half" value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}>
                <option value="">From</option>
                {Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="filter-year-sep">–</span>
              <select className="filter-select filter-select-half" value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}>
                <option value="">To</option>
                {Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Language */}
          <div className="filter-group">
            <label className="filter-label">Language</label>
            <select className="filter-select" value={language}
              onChange={(e) => setLanguage(e.target.value)}>
              <option value="">Any Language</option>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div className="filter-group">
            <label className="filter-label">Country</label>
            <select className="filter-select" value={country}
              onChange={(e) => setCountry(e.target.value)}>
              <option value="">Any Country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Actor */}
          <div className="filter-group">
            <PersonSearch
              label="Actor"
              selected={actors}
              onSelect={addActor}
              onRemove={removeActor}
              department="Acting"
            />
          </div>

          {/* Director */}
          <div className="filter-group">
            <PersonSearch
              label="Director"
              selected={directors}
              onSelect={addDirector}
              onRemove={() => removeDirector()}
              department="Directing"
            />
          </div>

          {hasFilters && (
            <button className="filter-clear" onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </aside>

        {/* ─── Right: search + results ─── */}
        <div className="search-main">
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

          {(query.trim() || hasFilters) && (
            <h2 className="search-heading">
              {hasFilters && !query.trim() ? "Filtered results" : query.trim() ? `Results for "${query.trim()}"` : ""}
            </h2>
          )}

          {loading && <p className="search-status">Searching...</p>}

          {!loading && (query.trim() || hasFilters) && results.length === 0 && (
            <p className="search-status">No results found. Try different filters or search terms.</p>
          )}

          <div className="search-grid">
            {results.map((item) => (
              <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
