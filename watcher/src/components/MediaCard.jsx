import { Link } from "react-router-dom";
import { img } from "../services/tmdb";

/**
 * MediaCard — landscape card with backdrop image.
 * Always shows title + year below the image (no hover needed).
 *
 * Props:
 *   item — TMDB media object
 *   type — "movie" or "tv" fallback
 */
export default function MediaCard({ item, type }) {
  const title = item.title || item.name;
  const mediaType = item.media_type || type || "movie";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const backdrop = item.backdrop_path || item.poster_path;
  const imageSrc = img(backdrop, "w780");

  return (
    <Link to={`/${mediaType}/${item.id}`} className="media-card">
      <div className="media-card-img">
        {imageSrc ? (
          <img src={imageSrc} alt={title} loading="lazy" />
        ) : (
          <div className="media-card-placeholder">
            <span>{title}</span>
          </div>
        )}
        {/* Rating badge */}
        {item.vote_average > 0 && (
          <span className="media-card-rating">
            ⭐ {item.vote_average.toFixed(1)}
          </span>
        )}
      </div>
      {/* Always-visible title + year */}
      <div className="media-card-info">
        <h3 className="media-card-title">{title}</h3>
        {year && <span className="media-card-year">{year}</span>}
      </div>
    </Link>
  );
}
