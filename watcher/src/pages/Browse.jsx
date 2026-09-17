import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPopular, getTopRated, getTrending } from "../services/tmdb";
import MediaCard from "../components/MediaCard";
import { SkeletonRow } from "../components/Skeleton";

/**
 * Browse page — displays grids of content by category.
 * Route: /browse/:category (movies, tv, new)
 *
 * Categories map to TMDB endpoints:
 *   movies → popular movies + top rated movies
 *   tv     → popular TV + top rated TV
 *   new    → trending all (week) — the "New & Popular" section
 */

const CATEGORY_CONFIG = {
  movies: { title: "Movies", type: "movie" },
  tv: { title: "Series", type: "tv" },
  new: { title: "New & Popular", type: "all" },
};

export default function Browse() {
  const { category } = useParams();
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.movies;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchData =
      category === "new"
        ? /* New & Popular = trending this week */
          getTrending("all", "week").then((res) => res.results || [])
        : /* Movies or TV = popular + top rated combined */
          Promise.all([
            getPopular(config.type),
            getTopRated(config.type),
          ]).then(([popular, topRated]) => {
            // Merge and deduplicate by ID
            const all = [...(popular.results || []), ...(topRated.results || [])];
            const seen = new Set();
            return all.filter((item) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
          });

    fetchData
      .then(setItems)
      .catch((err) => console.error("Browse fetch failed:", err))
      .finally(() => setLoading(false));
  }, [category, config.type]);

  if (loading) {
    return (
      <div className="page browse-page">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="page browse-page">
      <h1 className="browse-heading">{config.title}</h1>
      <div className="browse-grid">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} type={config.type === "all" ? undefined : config.type} />
        ))}
      </div>
    </div>
  );
}
