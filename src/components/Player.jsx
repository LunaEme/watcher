import { useState, useEffect, useRef } from "react";
import { saveProgress } from "../services/watchProgress";

/**
 * Player component — Viduki iframe embed.
 *
 * Props:
 *   type     — "movie" or "tv"
 *   tmdbId   — TMDB ID
 *   season   — season number (TV only)
 *   episode  — episode number (TV only)
 *   color    — hex accent color (no #)
 *   apiTier  — which API tier to use (0-3), controlled by parent's server selector
 */

const VIDUKI_BASE = "https://viduki.net";
const DEFAULT_COLOR = "E50914";
const API_TIERS = [2, 1, 3, 4];

export default function Player({ type, tmdbId, season, episode, color = DEFAULT_COLOR, apiTier }) {
  /* If parent provides apiTier, use it. Otherwise auto-fallback. */
  const [autoTier, setAutoTier] = useState(0);
  const tierIndex = apiTier !== undefined ? apiTier : autoTier;

  const buildUrl = (ti) => {
    const api = API_TIERS[ti];
    const base = `${VIDUKI_BASE}/${api}`;
    const path = type === "tv"
      ? `${base}/tv/${tmdbId}/${season}/${episode}`
      : `${base}/movie/${tmdbId}`;
    return `${path}?color=${color}`;
  };

  /* Listen for Viduki events */
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "https://www.viduki.net") return;
      const data = event.data;
      if (!data) return;

      /* Auto-fallback only when parent isn't controlling the tier */
      if (data.type === "viduki:all-servers-failed" && apiTier === undefined) {
        setAutoTier((prev) => (prev + 1 < API_TIERS.length ? prev + 1 : prev));
      }

      if (data.type === "MEDIA_DATA" && data.data) {
        saveProgress(data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [apiTier]);

  /* Reset auto tier when content changes */
  useEffect(() => { setAutoTier(0); }, [tmdbId, season, episode]);

  return (
    <div className="player-wrapper">
      <iframe
        src={buildUrl(tierIndex)}
        className="player-iframe"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        referrerPolicy="origin"
        frameBorder="0"
      />
    </div>
  );
}
