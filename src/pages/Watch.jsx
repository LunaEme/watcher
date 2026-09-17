import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTvDetails, getSeasonDetails } from "../services/tmdb";
import Player from "../components/Player";

/**
 * Watch page — full-width video player.
 * Routes:
 *   /watch/movie/:id
 *   /watch/tv/:id/:season/:episode
 *
 * For TV: shows current episode info, next/prev buttons, and episode list below.
 */
export default function Watch() {
  const { type, id, season, episode } = useParams();
  const navigate = useNavigate();

  const seasonNum = Number(season) || 1;
  const episodeNum = Number(episode) || 1;

  const [showDetails, setShowDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(seasonNum);

  /* Fetch show details + episodes for TV */
  useEffect(() => {
    if (type !== "tv") return;

    getTvDetails(id)
      .then(setShowDetails)
      .catch((err) => console.error("Failed to fetch show:", err));
  }, [type, id]);

  useEffect(() => {
    if (type !== "tv") return;

    getSeasonDetails(id, selectedSeason)
      .then((data) => setEpisodes(data.episodes || []))
      .catch((err) => console.error("Failed to fetch season:", err));
  }, [type, id, selectedSeason]);

  /* Keep selectedSeason in sync with URL */
  useEffect(() => {
    setSelectedSeason(seasonNum);
  }, [seasonNum]);

  const title = showDetails?.name || showDetails?.title || "";
  const currentEp = episodes.find((e) => e.episode_number === episodeNum);
  const hasNext = episodeNum < episodes.length;
  const hasPrev = episodeNum > 1;

  const goToEpisode = (epNum) => {
    navigate(`/watch/tv/${id}/${selectedSeason}/${epNum}`);
  };

  const changeSeason = (newSeason) => {
    setSelectedSeason(newSeason);
    navigate(`/watch/tv/${id}/${newSeason}/1`);
  };

  return (
    <div className="watch-page">
      {/* ─── Player — near full screen ─── */}
      <div className="watch-player-container">
        {/* Back button */}
        <Link to={`/${type}/${id}`} className="watch-back">
          ← Back
        </Link>

        {/* Now playing label */}
        <div className="watch-now-playing">
          {type === "tv" ? (
            <span>{title} — S{seasonNum}E{episodeNum}{currentEp?.name ? `: ${currentEp.name}` : ""}</span>
          ) : (
            <span>Now Playing</span>
          )}
        </div>

        <Player
          type={type}
          tmdbId={id}
          season={seasonNum}
          episode={episodeNum}
        />

        {/* Next / Prev buttons for TV */}
        {type === "tv" && (
          <div className="watch-controls">
            <button
              className="watch-nav-btn"
              disabled={!hasPrev}
              onClick={() => goToEpisode(episodeNum - 1)}
            >
              ← Previous Episode
            </button>
            <button
              className="watch-nav-btn"
              disabled={!hasNext}
              onClick={() => goToEpisode(episodeNum + 1)}
            >
              Next Episode →
            </button>
          </div>
        )}
      </div>

      {/* ─── Episode list below player (TV only) ─── */}
      {type === "tv" && (
        <div className="watch-episodes">
          <div className="watch-episodes-header">
            <h2 className="section-title">Episodes</h2>
            {showDetails?.seasons && (
              <select
                className="season-select"
                value={selectedSeason}
                onChange={(e) => changeSeason(Number(e.target.value))}
              >
                {showDetails.seasons
                  .filter((s) => s.season_number >= 1)
                  .map((s) => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="watch-episode-list">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                className={`watch-episode-item ${ep.episode_number === episodeNum && selectedSeason === seasonNum ? "active" : ""}`}
                onClick={() => goToEpisode(ep.episode_number)}
              >
                <span className="episode-number">{ep.episode_number}</span>
                <span className="episode-title">{ep.name || `Episode ${ep.episode_number}`}</span>
                {ep.runtime && <span className="episode-runtime">{ep.runtime}m</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
