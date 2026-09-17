import PersonSearch from "./PersonSearch";

/**
 * FilterPanel — vertical filter panel with genre dropdown + actor/director search.
 * Used on Browse and Search pages on the left side.
 *
 * Props:
 *   genres         — array of {id, name} genre objects
 *   selectedGenre  — currently selected genre ID string
 *   onGenreChange  — callback when genre changes
 *   actors         — selected actors array
 *   onActorSelect  — callback when actor added
 *   onActorRemove  — callback when actor removed
 *   directors      — selected directors array
 *   onDirectorSelect — callback when director added
 *   onDirectorRemove — callback when director removed
 *   showGenres     — whether to show genre filter (default true)
 */
export default function FilterPanel({
  genres = [],
  selectedGenre = "",
  onGenreChange,
  actors = [],
  onActorSelect,
  onActorRemove,
  directors = [],
  onDirectorSelect,
  onDirectorRemove,
  showGenres = true,
}) {
  return (
    <aside className="filter-panel">
      <h3 className="filter-panel-title">Filters</h3>

      {/* Genre filter */}
      {showGenres && genres.length > 0 && (
        <div className="filter-group">
          <label className="filter-label">Genre</label>
          <select
            className="filter-select"
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actor filter — multi-select */}
      <div className="filter-group">
        <PersonSearch
          label="Actor"
          selected={actors}
          onSelect={onActorSelect}
          onRemove={onActorRemove}
          department="Acting"
        />
      </div>

      {/* Director filter */}
      <div className="filter-group">
        <PersonSearch
          label="Director"
          selected={directors}
          onSelect={onDirectorSelect}
          onRemove={onDirectorRemove}
          department="Directing"
        />
      </div>

      {/* Clear all */}
      {(selectedGenre || actors.length > 0 || directors.length > 0) && (
        <button
          className="filter-clear"
          onClick={() => {
            onGenreChange("");
            actors.forEach((a) => onActorRemove(a.id));
            directors.forEach((d) => onDirectorRemove(d.id));
          }}
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
