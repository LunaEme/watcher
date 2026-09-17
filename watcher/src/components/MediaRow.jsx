import { useRef } from "react";
import MediaCard from "./MediaCard";

/**
 * MediaRow — horizontally scrolling row with left/right scroll buttons.
 * Prime Video-style: landscape cards, arrow buttons on hover.
 *
 * Props:
 *   title — section heading
 *   items — array of TMDB media objects
 *   type  — default media type
 */
export default function MediaRow({ title, items = [], type }) {
  const trackRef = useRef(null);

  if (!items.length) return null;

  /** Scroll the row by one "page" (roughly 3 cards) */
  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.75;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="media-row">
      <h2 className="media-row-title">{title}</h2>
      <div className="media-row-wrapper">
        {/* Left arrow */}
        <button
          className="row-arrow row-arrow-left"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div className="media-row-track" ref={trackRef}>
          {items.map((item) => (
            <MediaCard key={item.id} item={item} type={type} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          className="row-arrow row-arrow-right"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
}
