import { getEvolution, getNextEvolution } from "../data/evolutionData";

export default function ClassPanel({ classes = [], classMeta = {}, primaryClass, level = 1, onClassSelect }) {
  const primaryMeta = classMeta[primaryClass] || classMeta.NOVICE || {};
  const unlockedCount = classes.filter((className) => getEvolution(className, level)).length;
  const nextEvolution = getNextEvolution(primaryClass, level);
  const classReadiness = classes.length === 0 ? 0 : Math.round((unlockedCount / classes.length) * 100);
  const currentEvolution = getEvolution(primaryClass, level);
  const nextGate = nextEvolution ? `L${nextEvolution.level}` : "Max";

  return (
    <div className="panel class-panel premium-class-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Class Selection</p>
          <h3>Class Sanctuary</h3>
          <p className="sanctuary-warning">
            Changing primary class costs 25 Gold, resets mastery, and applies a temporary XP penalty.
          </p>
        </div>
      </div>

      <div className="class-origin-console" aria-label="Class origin console">
        <div>
          <small>Origin World</small>
          <strong>{primaryMeta.world || "Unknown Gate"}</strong>
          <span>{primaryMeta.label || primaryClass}</span>
        </div>
        <div>
          <small>Current Form</small>
          <strong>{currentEvolution?.title || "Initiate"}</strong>
          <span>Level {level}</span>
        </div>
        <div>
          <small>Next Gate</small>
          <strong>{nextGate}</strong>
          <span>{nextEvolution?.title || "Path capped"}</span>
        </div>
      </div>

      <div className="class-sanctuary-card" aria-label="Class sanctuary status">
        <div>
          <small>Primary Signal</small>
          <strong>{primaryMeta.label || primaryClass}</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${classReadiness}%` }} />
        </i>
        <span>{nextEvolution ? `Next evolution: ${nextEvolution.title} at L${nextEvolution.level}` : "Evolution path capped for now"}</span>
      </div>

      <div className="class-grid premium-class-grid">
        {classes.map((className) => {
          const meta = classMeta[className] || {
            label: className,
            icon: "✨",
            world: "Unknown World"
          };
          const currentUpgrade = getEvolution(className, level);
          const nextUpgrade = getNextEvolution(className, level);
          const isActive = primaryClass === className;
          const unlockSignal = nextUpgrade ? Math.min(100, Math.round((level / nextUpgrade.level) * 100)) : 100;

          return (
            <button
              key={className}
              className={isActive ? "class-choice active" : "class-choice"}
              onClick={() => onClassSelect(className)}
              type="button"
            >
              <span className="class-choice-icon">{meta.icon}</span>
              <span className="class-choice-affinity">{isActive ? "Primary" : "Available"}</span>
              <strong>{meta.label}</strong>
              <small>{meta.world}</small>
              <em>{currentUpgrade?.title}</em>
              <div className="class-choice-meter" aria-hidden="true">
                <i style={{ width: `${unlockSignal}%` }} />
              </div>
              {nextUpgrade && (
                <span className="class-choice-next">
                  Next: {nextUpgrade.title} at L{nextUpgrade.level}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
