import { useState, useEffect } from "react";
import { getTrending, getPopular, getTopRated } from "../services/tmdb";
import { getContinueWatching } from "../services/watchProgress";
import HeroCarousel from "../components/Hero";
import MediaRow from "../components/MediaRow";
import MediaCard from "../components/MediaCard";
import { SkeletonRow, SkeletonHero } from "../components/Skeleton";

/**
 * Home page — Prime Video layout.
 * Hero carousel at top, then horizontal content rows.
 */
export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    setContinueWatching(getContinueWatching());
  }, []);

  if (loading) {
    return (
      <div className="page">
        <SkeletonHero />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="page">
      {/* Hero carousel uses first 8 trending items */}
      <HeroCarousel items={trending} />

      {/* Continue watching */}
      {continueWatching.length > 0 && (
        <section className="media-row">
          <h2 className="media-row-title">Continue Watching</h2>
          <div className="media-row-wrapper">
            <div className="media-row-track">
              {continueWatching.map((item) => (
                <MediaCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    backdrop_path: item.backdrop_path,
                    poster_path: item.poster_path,
                    media_type: item.type,
                  }}
                  type={item.type}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <MediaRow title="Trending This Week" items={trending.slice(8)} />
      <MediaRow title="Popular Movies" items={popularMovies} type="movie" />
      <MediaRow title="Popular TV Shows" items={popularTv} type="tv" />
      <MediaRow title="Top Rated" items={topRated} type="movie" />
    </div>
  );
}
