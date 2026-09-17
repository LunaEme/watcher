import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getMovieDetails,
  getTvDetails,
  getSeasonDetails,
  img,
  backdropSrcSet,
} from "../services/tmdb";
import Player from "../components/Player";
import { SkeletonHero } from "../components/Skeleton";

/**
 * Details page
 * Shows full info for a movie or TV show, with the Viduki player.
 * For TV shows, includes a season/episode picker.
 *
 * Route: /:type/:id (type is "movie" or "tv")
 */
export default function Details() {
  const { type, id } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // TV-specific state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState([]);

  // Whether the player is visible (user clicked "Watch Now")
  const [showPlayer, setShowPlayer] = useState(false);

  /* ─── Fetch movie or TV details ─── */
  useEffect(() => {
    setLoading(true);
    setShowPlayer(false);
    setSelectedSeason(1);
    setSelectedEpisode(1);

    const fetchDetails =
      type === "tv" ? getTvDetails(id) : getMovieDetails(id);

    fetchDetails
      .then((data) => {
        setDetails(data);
        // If TV, load first season's episodes
        if (type === "tv" && data.seasons?.length) {
          // Find the first real season (some shows have season 0 = specials)
          const firstSeason =
            data.seasons.find((s) => s.season_number >= 1) || data.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      })
      .catch((err) => console.error("Failed to fetch details:", err))
      .finally(() => setLoading(false));
  }, [type, id]);

  /* ─── Fetch episodes when season changes (TV only) ─── */
  useEffect(() => {
    if (type !== "tv" || !id) return;

    getSeasonDetails(id, selectedSeason)
      .then((data) => {
        setEpisodes(data.episodes || []);
        setSelectedEpisode(1); // reset to first episode
      })
      .catch((err) => console.error("Failed to fetch season:", err));
  }, [type, id, selectedSeason]);

  if (loading) {
    return (
      <div className="page">
        <SkeletonHero />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="page">
        <p className="error-text">Could not load details.</p>
      </div>
    );
  }

  const title = details.title || details.name;
  const year = (details.release_date || details.first_air_date || "").slice(0, 4);
  const runtime = details.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : null;
  const rating = details.vote_average?.toFixed(1);
  const genres = details.genres?.map((g) => g.name).join(", ");

  // Find a YouTube trailer from the videos response
  const trailer = details.videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  return (
    <div className="page">
      {/* Backdrop */}
      <div className="details-backdrop">
        {details.backdrop_path && (
          <img
            src={img(details.backdrop_path, "w1280")}
            srcSet={backdropSrcSet(details.backdrop_path)}
            sizes="100vw"
            alt=""
            aria-hidden="true"
          />
        )}
        <div className="hero-gradient" />
      </div>

      <div className="details-content">
        {/* Poster + info side by side */}
        <div className="details-header">
          {details.poster_path && (
            <img
              className="details-poster"
              src={img(details.poster_path, "w500")}
              alt={title}
            />
          )}

          <div className="details-info">
            <h1 className="details-title">{title}</h1>

            <div className="details-meta">
              {year && <span>{year}</span>}
              {runtime && <span>{runtime}</span>}
              {rating && <span>⭐ {rating}</span>}
            </div>

            {genres && <p className="details-genres">{genres}</p>}
            {details.overview && (
              <p className="details-overview">{details.overview}</p>
            )}

            <div className="details-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowPlayer(true)}
              >
                Watch Now
              </button>

              {/* YouTube trailer link (from 67movies research) */}
              {trailer && (
                <a
                  className="btn btn-secondary"
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ─── Player ─── */}
        {showPlayer && (
          <div className="details-player">
            <Player
              type={type}
              tmdbId={id}
              season={selectedSeason}
              episode={selectedEpisode}
            />
          </div>
        )}

        {/* ─── Season / Episode picker (TV only) ─── */}
        {type === "tv" && details.seasons?.length > 0 && (
          <div className="episode-picker">
            {/* Season selector */}
            <div className="season-selector">
              <label htmlFor="season-select">Season</label>
              <select
                id="season-select"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
              >
                {details.seasons
                  .filter((s) => s.season_number >= 1)
                  .map((s) => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number}
                    </option>
                  ))}
              </select>
            </div>

            {/* Episode list */}
            <div className="episode-list">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  className={`episode-btn ${
                    ep.episode_number === selectedEpisode ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedEpisode(ep.episode_number);
                    setShowPlayer(true);
                  }}
                >
                  <span className="episode-num">E{ep.episode_number}</span>
                  <span className="episode-name">
                    {ep.name || `Episode ${ep.episode_number}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
