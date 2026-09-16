import MediaCard from "./MediaCard";

/**
 * MediaRow — horizontally scrolling row of media cards.
 * Used on the home page for trending, popular, top-rated sections.
 *
 * Props:
 *   title   — section heading ("Trending", "Popular Movies", etc.)
 *   items   — array of TMDB media objects
 *   type    — default media type for items missing media_type
 */
export default function MediaRow({ title, items = [], type }) {
  if (!items.length) return null;

  return (
    <section className="media-row">
      <h2 className="media-row-title">{title}</h2>
      <div className="media-row-track">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </section>
  );
}
