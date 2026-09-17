import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getPopular,
  getTopRated,
  getTrending,
  getAnime,
  getGenres,
  discover,
} from "../services/tmdb";
import { LANGUAGES, COUNTRIES } from "../services/constants";
import MediaCard from "../components/MediaCard";
import PersonSearch from "../components/PersonSearch";
import { SkeletonRow } from "../components/Skeleton";

/**
 * Browse page — grid with left filter panel.
 * Infinite scroll loads more results up to 100 titles (5 pages).
 */

const CATEGORY_CONFIG = {
  movies: { title: "Movies", type: "movie", genreType: "movie" },
  tv: { title: "Shows", type: "tv", genreType: "tv" },
  anime: { title: "Anime", type: "anime", genreType: "tv" },
  new: { title: "New & Popular", type: "all", genreType: null },
};

const MAX_PAGE = 5; // 5 pages × 20 = 100 titles max
const currentYear = new Date().getFullYear();

export default function Browse() {
  const { category } = useParams();
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.movies;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /* Filters */
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [actors, setActors] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [language, setLanguage] = useState("");
  const [country, setCountry] = useState("");

  /* Key to force PersonSearch remount on category change */
  const [filterKey, setFilterKey] = useState(0);

  const addActor = (p) => setActors((prev) => [...prev, p]);
  const removeActor = (id) => setActors((prev) => prev.filter((p) => p.id !== id));
  const addDirector = (p) => setDirectors([p]);
  const removeDirector = () => setDirectors([]);

  /* Fetch genres */
  useEffect(() => {
    if (!config.genreType) return;
    getGenres(config.genreType)
      .then((data) => setGenres(data.genres || []))
      .catch(() => setGenres([]));
  }, [config.genreType]);

  /* Reset everything on category change */
  useEffect(() => {
    setSelectedGenre("");
    setActors([]);
    setDirectors([]);
    setYearFrom("");
    setYearTo("");
    setLanguage("");
    setCountry("");
    setFilterKey((k) => k + 1); // remount PersonSearch components
  }, [category]);

  /* Build discover params from filters */
  const buildParams = useCallback((pageNum) => {
    const params = { sort_by: "popularity.desc", page: pageNum };
    if (selectedGenre) params.with_genres = selectedGenre;
    if (actors.length > 0) params.with_cast = actors.map((a) => a.id).join(",");
    if (directors.length > 0) params.with_crew = directors.map((d) => d.id).join(",");
    if (language) params.with_original_language = language;

    /* Year range */
    const discoverType = config.type === "anime" ? "tv" : config.type;
    if (yearFrom) {
      const dateKey = discoverType === "tv" ? "first_air_date.gte" : "primary_release_date.gte";
      params[dateKey] = `${yearFrom}-01-01`;
    }
    if (yearTo) {
      const dateKey = discoverType === "tv" ? "first_air_date.lte" : "primary_release_date.lte";
      params[dateKey] = `${yearTo}-12-31`;
    }

    /* Country */
    if (config.type === "anime") {
      params.with_genres = selectedGenre ? `16,${selectedGenre}` : "16";
      params.with_origin_country = "JP";
    } else if (country) {
      params.with_origin_country = country;
    }

    return params;
  }, [selectedGenre, actors, directors, yearFrom, yearTo, language, country, config.type]);

  /* Fetch content — initial load */
  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);

    const hasFilters = selectedGenre || actors.length > 0 || directors.length > 0 ||
                       yearFrom || yearTo || language || country;

    let fetchData;

    if (hasFilters) {
      const discoverType = config.type === "anime" ? "tv" : config.type === "all" ? "movie" : config.type;
      fetchData = discover(discoverType, buildParams(1)).then((res) => {
        setHasMore((res.results || []).length >= 20 && 1 < MAX_PAGE);
        return res.results || [];
      });
    } else if (category === "new") {
      fetchData = getTrending("all", "week").then((res) => {
        setHasMore(false); // trending doesn't paginate well
        return res.results || [];
      });
    } else if (category === "anime") {
      fetchData = discover("tv", { ...buildParams(1), with_genres: "16", with_origin_country: "JP" })
        .then((res) => {
          setHasMore((res.results || []).length >= 20 && 1 < MAX_PAGE);
          return res.results || [];
        });
    } else {
      fetchData = Promise.all([
        getPopular(config.type),
        getTopRated(config.type),
      ]).then(([popular, topRated]) => {
        const all = [...(popular.results || []), ...(topRated.results || [])];
        const seen = new Set();
        const deduped = all.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setHasMore(true); // can load more via discover
        return deduped;
      });
    }

    fetchData
      .then(setItems)
      .catch((err) => console.error("Browse fetch failed:", err))
      .finally(() => setLoading(false));
  }, [category, config.type, selectedGenre, actors, directors, yearFrom, yearTo, language, country]);

  /* Infinite scroll — load more */
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    if (nextPage > MAX_PAGE) { setHasMore(false); return; }

    setLoadingMore(true);
    const discoverType = config.type === "anime" ? "tv" : config.type === "all" ? "movie" : config.type;
    discover(discoverType, buildParams(nextPage))
      .then((res) => {
        const newItems = res.results || [];
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setItems((prev) => {
            const ids = new Set(prev.map((i) => i.id));
            const unique = newItems.filter((i) => !ids.has(i.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
          setHasMore(newItems.length >= 20 && nextPage < MAX_PAGE);
        }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [page, loadingMore, hasMore, config.type, buildParams]);

  /* Scroll listener for infinite scroll */
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const hasFilters = selectedGenre || actors.length > 0 || directors.length > 0 ||
                     yearFrom || yearTo || language || country;

  const clearAll = () => {
    setSelectedGenre("");
    setActors([]);
    setDirectors([]);
    setYearFrom("");
    setYearTo("");
    setLanguage("");
    setCountry("");
    setFilterKey((k) => k + 1);
  };

  return (
    <div className="page browse-page">
      <div className="browse-layout">
        {/* ─── Left: filter panel ─── */}
        <aside className="browse-filters">
          <h3 className="filter-panel-title">Filters</h3>

          {/* Genre */}
          {config.genreType && genres.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Genre</label>
              <select className="filter-select" value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}>
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

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

          {/* Country — hidden on anime since it's always Japan */}
          {config.type !== "anime" && (
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
          )}

          {/* Actor */}
          <div className="filter-group" key={`actor-${filterKey}`}>
            <PersonSearch
              label="Actor"
              selected={actors}
              onSelect={addActor}
              onRemove={removeActor}
              department="Acting"
            />
          </div>

          {/* Director */}
          <div className="filter-group" key={`director-${filterKey}`}>
            <PersonSearch
              label="Director"
              selected={directors}
              onSelect={addDirector}
              onRemove={(id) => removeDirector()}
              department="Directing"
            />
          </div>

          {hasFilters && (
            <button className="filter-clear" onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </aside>

        {/* ─── Right: content grid ─── */}
        <div className="browse-main">
          <h1 className="browse-heading">{config.title}</h1>

          {loading ? (
            <><SkeletonRow /><SkeletonRow /></>
          ) : items.length === 0 ? (
            <p className="browse-empty">No results found. Try different filters.</p>
          ) : (
            <>
              <div className="browse-grid">
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    type={config.type === "anime" ? "tv" : config.type === "all" ? undefined : config.type}
                  />
                ))}
              </div>
              {loadingMore && <p className="loading-more">Loading more...</p>}
              {!hasMore && items.length > 20 && (
                <p className="end-of-results">You've reached the end</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
