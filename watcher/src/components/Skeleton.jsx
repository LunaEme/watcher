/**
 * Skeleton — shimmer loading placeholder.
 * Used while data is fetching to prevent layout shift.
 *
 * Props:
 *   count — number of skeleton cards to render (default 6)
 */
export function SkeletonRow({ count = 6 }) {
  return (
    <section className="media-row">
      {/* Skeleton title bar */}
      <div className="skeleton skeleton-title" />
      <div className="media-row-track">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="media-card">
            <div className="skeleton skeleton-poster" />
            <div className="skeleton skeleton-text" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Single wide skeleton for hero banners */
export function SkeletonHero() {
  return <div className="skeleton skeleton-hero" />;
}
