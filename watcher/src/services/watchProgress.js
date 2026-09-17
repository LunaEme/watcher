/**
 * Watch progress service
 * Stores viewing progress in localStorage using the MEDIA_DATA events
 * that Viduki's iframe posts to the parent window.
 *
 * Data shape (per Viduki docs):
 * {
 *   "597": {
 *     id: "597", type: "movie", title: "Titanic",
 *     poster_path: "/...", backdrop_path: "/...",
 *     progress: { watched: 3706.89, duration: 11689.66 },
 *     last_updated: 1744442389334
 *   }
 * }
 */

const STORAGE_KEY = "vidukinet-Progress";

/** Get all stored progress entries */
export function getAllProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Get progress for a specific TMDB ID */
export function getProgress(tmdbId) {
  const all = getAllProgress();
  return all[String(tmdbId)] || null;
}

/** Save progress data (called when Viduki posts MEDIA_DATA) */
export function saveProgress(mediaData) {
  try {
    const all = getAllProgress();
    all[String(mediaData.id)] = mediaData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/**
 * Get "continue watching" list, sorted by most recently watched.
 * Only includes items with meaningful progress (>60s watched, <95% complete).
 */
export function getContinueWatching() {
  const all = getAllProgress();
  return Object.values(all)
    .filter((item) => {
      const { watched, duration } = item.progress || {};
      if (!watched || !duration) return false;
      // At least 60s watched and less than 95% complete
      return watched > 60 && watched / duration < 0.95;
    })
    .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
}

/** Clear all progress (for settings/debug) */
export function clearAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
