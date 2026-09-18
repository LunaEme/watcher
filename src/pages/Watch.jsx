import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTvDetails, getSeasonDetails, getMovieDetails, getRecommendations, img } from "../services/tmdb";
import Player from "../components/Player";
import MediaCard from "../components/MediaCard";

/**
 * Watch page — scrollable, player takes ~90vh at top.
 * Below: server selector, episode list (TV), recommendations.
 *
 * Routes:
 *   /watch/movie/:id
 *   /watch/tv/:id/:season/:episode
 */

const SERVER_NAMES = ["Server 1", "Server 2", "Server 3", "Server 4"];

export default function Watch() {
  const { type, id, season, episode } = useParams();
  const navigate = useNavigate();

  const seasonNum = Number(season) || 1;
  const episodeNum = Number(episode) || 1;

  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(seasonNum);
  const [recommendations, setRecommendations] = useState([]);
  const [serverIndex, setServerIndex] = useState(0);

  /* Fetch details + recommendations */
  useEffect(() => {
    const fetchDetails = type === "tv" ? getTvDetails(id) : getMovieDetails(id);
    fetchDetails.then((data) => {
      setDetails(data);
      document.title = `${data.title || data.name} - Watcher`;
    }).catch(console.error);

    getRecommendations(type, id)
      .then((data) => setRecommendations((data.results || []).slice(0, 12)))
      .catch(() => setRecommendations([]));
  }, [type, id]);

  /* Fetch episodes for TV */
  useEffect(() => {
    if (type !== "tv") return;
    getSeasonDetails(id, selectedSeason)
      .then((data) => setEpisodes(data.episodes || []))
      .catch(console.error);
  }, [type, id, selectedSeason]);

  useEffect(() => { setSelectedSeason(seasonNum); }, [seasonNum]);

  const title = details?.title || details?.name || "";
  const currentEp = episodes.find((e) => e.episode_number === episodeNum);
  const hasNext = episodeNum < episodes.length;
  const hasPrev = episodeNum > 1;

  const goToEpisode = (epNum) => navigate(`/watch/tv/${id}/${selectedSeason}/${epNum}`);
  const changeSeason = (s) => { setSelectedSeason(s); navigate(`/watch/tv/${id}/${s}/1`); };

  return (
    <div className="watch-page">
      {/* ─── Top bar with back button + now playing ─── */}
      <div className="watch-topbar">
        <Link to={`/${type}/${id}`} className="watch-back">← Back</Link>
        <span className="watch-now-playing">
          {type === "tv"
            ? `${title} — S${seasonNum}E${episodeNum}${currentEp?.name ? `: ${currentEp.name}` : ""}`
            : title}
        </span>
      </div>

      {/* ─── Player — 90vh ─── */}
      <div className="watch-player">
        <Player
          type={type}
          tmdbId={id}
          season={seasonNum}
          episode={episodeNum}
          apiTier={serverIndex}
        />
      </div>

      {/* ─── Below player: controls ─── */}
      <div className="watch-below">

        {/* Next / Prev for TV */}
        {type === "tv" && (
          <div className="watch-nav">
            <button className="watch-nav-btn" disabled={!hasPrev}
              onClick={() => goToEpisode(episodeNum - 1)}>
              ← Previous
            </button>
            <button className="watch-nav-btn" disabled={!hasNext}
              onClick={() => goToEpisode(episodeNum + 1)}>
              Next →
            </button>
          </div>
        )}

        {/* Server selector */}
        <div className="watch-section">
          <h3 className="watch-section-title">Server</h3>
          <select
            className="season-select"
            value={serverIndex}
            onChange={(e) => setServerIndex(Number(e.target.value))}
          >
            {SERVER_NAMES.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
        </div>

        {/* Episode list for TV */}
        {type === "tv" && (
          <div className="watch-section">
            <div className="watch-episodes-header">
              <h3 className="watch-section-title">Episodes</h3>
              {details?.seasons && (
                <select className="season-select" value={selectedSeason}
                  onChange={(e) => changeSeason(Number(e.target.value))}>
                  {details.seasons.filter((s) => s.season_number >= 1).map((s) => (
                    <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
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
                  <div className="watch-ep-thumb">
                    {ep.still_path ? (
                      <img src={img(ep.still_path, "w342")} alt={ep.name} loading="lazy" />
                    ) : (
                      <div className="watch-ep-thumb-ph" />
                    )}
                  </div>
                  <div className="watch-ep-info">
                    <span className="episode-title">{ep.name || `Episode ${ep.episode_number}`}</span>
                    {ep.runtime && <span className="episode-runtime">{ep.runtime}m</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="watch-section">
            <h3 className="watch-section-title">You might also like</h3>
            <div className="watch-recs-grid">
              {recommendations.map((item) => (
                <MediaCard key={item.id} item={item} type={type} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
