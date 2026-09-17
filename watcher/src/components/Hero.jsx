import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { img, backdropSrcSet } from "../services/tmdb";

/**
 * HeroCarousel — Prime Video-style hero with left/right arrows and dot indicators.
 * Auto-rotates every 8 seconds, pauses on hover.
 *
 * Props:
 *   items — array of TMDB trending items (first 6–8 used)
 */
const MAX_SLIDES = 8;

export default function HeroCarousel({ items = [] }) {
  const slides = items.slice(0, MAX_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  /** Auto-advance every 8s unless paused */
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const goTo = useCallback((i) => setCurrent(i), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  if (!slides.length) return null;

  const slide = slides[current];
  const title = slide.title || slide.name;
  const type = slide.media_type || "movie";
  const year = (slide.release_date || slide.first_air_date || "").slice(0, 4);
  const rating = slide.vote_average?.toFixed(1);
  const overview = slide.overview
    ? slide.overview.slice(0, 180) + (slide.overview.length > 180 ? "..." : "")
    : "";

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop image */}
      {slide.backdrop_path && (
        <img
          className="hero-backdrop"
          src={img(slide.backdrop_path, "w1280")}
          srcSet={backdropSrcSet(slide.backdrop_path)}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          key={slide.id}
        />
      )}

      {/* Gradients for text readability */}
      <div className="hero-gradient" />
      <div className="hero-gradient-left" />

      {/* Content overlay */}
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <div className="hero-meta">
          {year && <span>{year}</span>}
          {rating && <span>⭐ {rating}</span>}
          <span className="hero-type-badge">{type === "tv" ? "TV Series" : "Movie"}</span>
        </div>
        {overview && <p className="hero-overview">{overview}</p>}
        <div className="hero-actions">
          <Link to={`/${type}/${slide.id}`} className="btn btn-primary">
            ▶ Watch Now
          </Link>
          <Link to={`/${type}/${slide.id}`} className="btn btn-secondary">
            More Details
          </Link>
        </div>
      </div>

      {/* Left / Right arrows */}
      <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Previous">
        ‹
      </button>
      <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Next">
        ›
      </button>

      {/* Dot indicators */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
