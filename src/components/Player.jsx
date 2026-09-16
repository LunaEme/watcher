import { useState, useEffect, useRef } from "react";
import { saveProgress } from "../services/watchProgress";

/**
 * Player component
 * Embeds Viduki's iframe player with automatic server fallback.
 *
 * Props:
 *   type     — "movie" or "tv"
 *   tmdbId   — TMDB ID (number or string)
 *   season   — season number (TV only)
 *   episode  — episode number (TV only)
 *   color    — hex color for player accent (no # prefix), defaults to site accent
 */

const VIDUKI_BASE = "https://viduki.net";
// Accent color for the player UI (matches our site theme)
const DEFAULT_COLOR = "8B5CF6";
// API tiers to try in order: multi-server → multi-language → multi-embed → premium
const API_TIERS = [1, 2, 3, 4];

export default function Player({ type, tmdbId, season, episode, color = DEFAULT_COLOR }) {
  const [currentTier, setCurrentTier] = useState(0); // index into API_TIERS
  const iframeRef = useRef(null);

  /**
   * Build the Viduki embed URL for the current API tier.
   * Movies:  /1/movie/{id}?color={hex}
   * TV:      /1/tv/{id}/{season}/{episode}?color={hex}
   */
  const buildUrl = (tierIndex) => {
    const api = API_TIERS[tierIndex];
    const base = `${VIDUKI_BASE}/${api}`;
    const path =
      type === "tv"
        ? `${base}/tv/${tmdbId}/${season}/${episode}`
        : `${base}/movie/${tmdbId}`;
    return `${path}?color=${color}`;
  };

  /**
   * Listen for Viduki postMessage events:
   * - "viduki:all-servers-failed" → swap to next API tier
   * - "MEDIA_DATA" → save watch progress to localStorage
   */
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from Viduki
      if (event.origin !== "https://www.viduki.net") return;

      const data = event.data;
      if (!data) return;

      // Server fallback: all servers in current tier failed
      if (data.type === "viduki:all-servers-failed") {
        setCurrentTier((prev) => {
          const next = prev + 1;
          // If we've exhausted all tiers, stay on last one
          if (next >= API_TIERS.length) return prev;
          return next;
        });
      }

      // Watch progress: save to localStorage for "continue watching"
      if (data.type === "MEDIA_DATA" && data.data) {
        saveProgress(data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Reset tier when content changes
  useEffect(() => {
    setCurrentTier(0);
  }, [tmdbId, season, episode]);

  return (
    <div className="player-wrapper">
      <iframe
        ref={iframeRef}
        src={buildUrl(currentTier)}
        className="player-iframe"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        referrerPolicy="origin"
        // No borders, fills container
        frameBorder="0"
      />
    </div>
  );
}
