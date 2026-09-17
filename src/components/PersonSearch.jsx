import { useState, useRef, useEffect } from "react";
import { searchPerson, img } from "../services/tmdb";

/**
 * PersonSearch — autocomplete dropdown for finding people (actors/directors).
 * Supports multi-select: selected people appear as tags.
 *
 * Props:
 *   label         — "Actor" or "Director"
 *   selected      — array of selected person objects [{id, name, profile_path}]
 *   onSelect      — called when a person is added
 *   onRemove      — called when a person tag is removed
 *   department    — "Acting" or "Directing" to filter results
 */
export default function PersonSearch({ label, selected = [], onSelect, onRemove, department }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  /* Debounced person search */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      Promise.all([
        searchPerson(query.trim()),
        searchPerson(query.trim(), 2),
        searchPerson(query.trim(), 3),
      ])
        .then(([p1, p2, p3]) => {
          let people = [...(p1.results || []), ...(p2.results || []), ...(p3.results || [])];
          /* Filter by department if specified */
          if (department) {
            people = people.filter((p) => p.known_for_department === department);
          }
          /* Exclude already selected */
          const selectedIds = new Set(selected.map((s) => s.id));
          people = people.filter((p) => !selectedIds.has(p.id));
          setResults(people.slice(0, 10));
          setOpen(true);
        })
        .catch(() => setResults([]));
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, department, selected]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (person) => {
    onSelect({ id: person.id, name: person.name, profile_path: person.profile_path });
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="person-search" ref={wrapperRef}>
      <label className="person-search-label">{label}</label>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="person-tags">
          {selected.map((person) => (
            <span key={person.id} className="person-tag">
              {person.profile_path && (
                <img src={img(person.profile_path, "w92")} alt="" className="person-tag-img" />
              )}
              {person.name}
              <button
                className="person-tag-remove"
                onClick={() => onRemove(person.id)}
                aria-label={`Remove ${person.name}`}
              >×</button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="person-search-input-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={`Search ${label.toLowerCase()}s...`}
          className="person-search-input"
        />
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="person-search-dropdown">
          {results.map((person) => (
            <button
              key={person.id}
              className="person-search-option"
              onClick={() => handleSelect(person)}
            >
              <div className="person-search-photo">
                {person.profile_path ? (
                  <img src={img(person.profile_path, "w92")} alt={person.name} />
                ) : (
                  <span className="person-search-photo-placeholder">
                    {person.name?.[0]}
                  </span>
                )}
              </div>
              <span className="person-search-name">{person.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
