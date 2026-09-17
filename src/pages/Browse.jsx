import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getPopular,
  getTopRated,
  getTrending,
  getAnime,
  getGenres,
  discover,
} from "../services/tmdb";
import MediaCard from "../components/MediaCard";
import { SkeletonRow } from "../components/Skeleton";

/**
 * Browse page — grid view for Movies, Shows, Anime, New & Popular.
 * Includes a genre filter dropdown that uses TMDB's discover endpoint.
 *
 * Route: /browse/:category
 */

const CATEGORY_CONFIG = {
  movies: { title: "Movies", type: "movie", genreType: "movie" },
  tv: { title: "Shows", type: "tv", genreType: "tv" },
  anime: { title: "Anime", type: "anime", genreType: "tv" },
  new: { title: "New & Popular", type: "all", genreType: null },
};

export default function Browse() {
  const { category } = useParams();
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.movies;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");

  /* Fetch available genres for the dropdown */
  useEffect(() => {
    if (!config.genreType) return; // "New & Popular" has no genre filter
    getGenres(config.genreType)
      .then((data) => setGenres(data.genres || []))
      .catch(() => setGenres([]));
  }, [config.genreType]);

  /* Reset genre when category changes */
  useEffect(() => {
    setSelectedGenre("");
  }, [category]);

  /* Fetch content based on category + genre filter */
  useEffect(() => {
    setLoading(true);

    let fetchData;

    if (selectedGenre) {
      /* Genre-filtered: use discover endpoint */
      const discoverType = config.type === "anime" ? "tv" : config.type;
      const params = {
        with_genres: selectedGenre,
        sort_by: "popularity.desc",
      };
      /* Anime always filters to Japanese origin */
      if (config.type === "anime") {
        params.with_origin_country = "JP";
      }
      fetchData = discover(discoverType, params).then((res) => res.results || []);
    } else if (category === "new") {
      fetchData = getTrending("all", "week").then((res) => res.results || []);
    } else if (category === "anime") {
      fetchData = getAnime().then((res) => res.results || []);
    } else {
      /* Default: merge popular + top rated */
      fetchData = Promise.all([
        getPopular(config.type),
        getTopRated(config.type),
      ]).then(([popular, topRated]) => {
        const all = [...(popular.results || []), ...(topRated.results || [])];
        const seen = new Set();
        return all.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      });
    }

    fetchData
      .then(setItems)
      .catch((err) => console.error("Browse fetch failed:", err))
      .finally(() => setLoading(false));
  }, [category, config.type, selectedGenre]);

  return (
    <div className="page browse-page">
      <div className="browse-header">
        <h1 className="browse-heading">{config.title}</h1>

        {/* Genre filter dropdown */}
        {config.genreType && genres.length > 0 && (
          <select
            className="genre-select"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : items.length === 0 ? (
        <p className="browse-empty">No results found.</p>
      ) : (
        <div className="browse-grid">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              type={config.type === "anime" ? "tv" : config.type === "all" ? undefined : config.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
