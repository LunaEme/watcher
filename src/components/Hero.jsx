import { Link } from "react-router-dom";
import { img, backdropSrcSet } from "../services/tmdb";

/**
 * Hero — full-width banner featuring a single movie/show.
 * Shows backdrop image, title, overview, and a "Watch Now" button.
 *
 * Props:
 *   item — TMDB media object (from trending or similar)
 */
export default function Hero({ item }) {
  if (!item) return null;

  const title = item.title || item.name;
  const type = item.media_type || "movie";
  const backdrop = img(item.backdrop_path, "original");
  const overview = item.overview
    ? item.overview.slice(0, 200) + (item.overview.length > 200 ? "..." : "")
    : "";

  return (
    <section className="hero">
      {/* Backdrop image */}
      {backdrop && (
        <img
          className="hero-backdrop"
          src={img(item.backdrop_path, "w1280")}
          srcSet={backdropSrcSet(item.backdrop_path)}
          sizes="100vw"
          alt=""
          aria-hidden="true"
        />
      )}

      {/* Gradient overlay for text readability */}
      <div className="hero-gradient" />

      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {overview && <p className="hero-overview">{overview}</p>}
        <div className="hero-actions">
          <Link to={`/${type}/${item.id}`} className="btn btn-primary">
            Watch Now
          </Link>
        </div>
      </div>
    </section>
  );
}
