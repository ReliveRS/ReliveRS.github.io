export type GalaxyId = 'tech' | 'soft-skills' | 'foundations';

type GalaxyNavigatorProps = {
  activeGalaxy: GalaxyId;
  onNavigate: (galaxy: GalaxyId) => void;
};

const galaxies: { id: GalaxyId; shortLabel: string; label: string }[] = [
  { id: 'tech', shortLabel: 'TECH', label: 'Tech Galaxy' },
  { id: 'soft-skills', shortLabel: 'HUMAN', label: 'Soft Skills Galaxy' },
  { id: 'foundations', shortLabel: 'CORE', label: 'Foundation Galaxy' },
];

function GalaxyNavigator({ activeGalaxy, onNavigate }: GalaxyNavigatorProps) {
  return (
    <nav className="galaxy-navigator" aria-label="Selector de galaxias">
      <p className="galaxy-navigator-label">GALAXY MAP</p>

      <div className="galaxy-navigator-links">
        {galaxies.map((galaxy) => {
          const isActive = galaxy.id === activeGalaxy;

          return (
            <button
              key={galaxy.id}
              type="button"
              className={`galaxy-navigator-button ${isActive ? 'is-active' : ''
                }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={galaxy.label}
              disabled={isActive}
              onClick={() => onNavigate(galaxy.id)}
            >
              <span className="galaxy-navigator-dot"></span>
              {galaxy.shortLabel}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default GalaxyNavigator;