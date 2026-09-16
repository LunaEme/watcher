import { useState, useEffect } from "react";
import { getTrending, getPopular, getTopRated } from "../services/tmdb";
import { getContinueWatching } from "../services/watchProgress";
import Hero from "../components/Hero";
import MediaRow from "../components/MediaRow";
import MediaCard from "../components/MediaCard";
import { SkeletonRow, SkeletonHero } from "../components/Skeleton";

/**
 * Home page
 * Loads trending content for the hero, plus rows for
 * popular movies, popular TV, and top-rated content.
 * Also shows a "Continue Watching" row from localStorage.
 */
export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all sections in parallel
    Promise.all([
      getTrending("all", "week"),
      getPopular("movie"),
      getPopular("tv"),
      getTopRated("movie"),
    ])
      .then(([trendingRes, moviesRes, tvRes, topRes]) => {
        setTrending(trendingRes.results || []);
        setPopularMovies(moviesRes.results || []);
        setPopularTv(tvRes.results || []);
        setTopRated(topRes.results || []);
      })
      .catch((err) => console.error("Failed to fetch home data:", err))
      .finally(() => setLoading(false));

    // Load continue watching from localStorage
    setContinueWatching(getContinueWatching());
  }, []);

  if (loading) {
    return (
      <div className="page">
        <SkeletonHero />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  // Use the first trending item as the hero
  const heroItem = trending[0];
  // Rest of trending goes in its own row
  const trendingRow = trending.slice(1);

  return (
    <div className="page">
      <Hero item={heroItem} />

      {/* Continue watching row (from Viduki progress data) */}
      {continueWatching.length > 0 && (
        <section className="media-row">
          <h2 className="media-row-title">Continue Watching</h2>
          <div className="media-row-track">
            {continueWatching.map((item) => (
              <MediaCard
                key={item.id}
                item={{
                  id: item.id,
                  title: item.title,
                  poster_path: item.poster_path,
                  media_type: item.type,
                }}
                type={item.type}
              />
            ))}
          </div>
        </section>
      )}

      <MediaRow title="Trending This Week" items={trendingRow} />
      <MediaRow title="Popular Movies" items={popularMovies} type="movie" />
      <MediaRow title="Popular TV Shows" items={popularTv} type="tv" />
      <MediaRow title="Top Rated" items={topRated} type="movie" />
    </div>
  );
}
