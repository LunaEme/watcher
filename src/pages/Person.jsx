import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPersonDetails, getPersonCredits, img } from "../services/tmdb";
import MediaCard from "../components/MediaCard";

/**
 * Person page — actor/director profile with filmography.
 * Route: /person/:id
 */
export default function Person() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPersonDetails(id), getPersonCredits(id)])
      .then(([details, creds]) => {
        setPerson(details);
        document.title = `${details.name} - Watcher`;
        /* Merge cast + crew credits, deduplicate, sort by notability */
        const all = [...(creds.cast || []), ...(creds.crew || [])];
        const seen = new Set();
        const unique = all.filter((item) => {
          const key = `${item.media_type}-${item.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return item.media_type === "movie" || item.media_type === "tv";
        });
        unique.sort((a, b) => ((b.vote_count || 0) * (b.vote_average || 0)) - ((a.vote_count || 0) * (a.vote_average || 0)));
        setCredits(unique);
      })
      .catch((err) => console.error("Failed to fetch person:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="page person-page"><p className="search-status">Loading...</p></div>;
  }

  if (!person) {
    return <div className="page person-page"><p className="error-text">Person not found.</p></div>;
  }

  const age = person.birthday
    ? Math.floor((Date.now() - new Date(person.birthday).getTime()) / 31557600000)
    : null;

  return (
    <div className="page person-page">
      <div className="person-header">
        {/* Photo */}
        <div className="person-photo-large">
          {person.profile_path ? (
            <img src={img(person.profile_path, "w500")} alt={person.name} />
          ) : (
            <div className="person-photo-placeholder-large">{person.name?.[0]}</div>
          )}
        </div>

        {/* Info */}
        <div className="person-info">
          <h1 className="person-name">{person.name}</h1>
          <div className="person-meta">
            {person.known_for_department && <span>{person.known_for_department}</span>}
            {person.birthday && (
              <span>{person.birthday}{age !== null ? ` (${age} years old)` : ""}</span>
            )}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </div>
          {person.biography && (
            <p className="person-bio">{person.biography}</p>
          )}
        </div>
      </div>

      {/* Filmography */}
      {credits.length > 0 && (
        <div className="person-filmography">
          <h2 className="section-title">Filmography</h2>
          <div className="person-credits-grid">
            {credits.map((item) => (
              <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
