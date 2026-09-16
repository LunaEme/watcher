import { Link } from "react-router-dom";
import { img, posterSrcSet } from "../services/tmdb";

/**
 * MediaCard — clickable poster card for a movie or TV show.
 *
 * Props:
 *   item — TMDB media object (needs id, title/name, poster_path, media_type)
 *   type — "movie" or "tv" (fallback if item.media_type missing)
 */
export default function MediaCard({ item, type }) {
  // TMDB uses "title" for movies, "name" for TV
  const title = item.title || item.name;
  // media_type comes from multi-search/trending; otherwise use the prop
  const mediaType = item.media_type || type || "movie";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const poster = img(item.poster_path, "w342");

  return (
    <Link to={`/${mediaType}/${item.id}`} className="media-card">
      <div className="media-card-img">
        {poster ? (
          <img
            src={poster}
            srcSet={posterSrcSet(item.poster_path)}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
            alt={title}
            loading="lazy"
          />
        ) : (
          /* Fallback when no poster exists */
          <div className="media-card-placeholder">
            <span>{title}</span>
          </div>
        )}
        {/* Rating badge */}
        {item.vote_average > 0 && (
          <span className="media-card-rating">
            {item.vote_average.toFixed(1)}
          </span>
        )}
      </div>
      <div className="media-card-info">
        <h3 className="media-card-title">{title}</h3>
        {year && <span className="media-card-year">{year}</span>}
      </div>
    </Link>
  );
}
