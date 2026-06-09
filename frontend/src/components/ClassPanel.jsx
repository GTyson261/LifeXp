import { getEvolution, getNextEvolution } from "../data/evolutionData";

export default function ClassPanel({ classes = [], classMeta = {}, primaryClass, level = 1, onClassSelect }) {
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

      <div className="class-grid premium-class-grid">
        {classes.map((className) => {
          const meta = classMeta[className] || {
            label: className,
            icon: "✨",
            world: "Unknown World"
          };
          const currentUpgrade = getEvolution(className, level);
          const nextUpgrade = getNextEvolution(className, level);

          return (
            <button
              key={className}
              className={primaryClass === className ? "class-choice active" : "class-choice"}
              onClick={() => onClassSelect(className)}
              type="button"
            >
              <span className="class-choice-icon">{meta.icon}</span>
              <strong>{meta.label}</strong>
              <small>{meta.world}</small>
              <em>{currentUpgrade?.title}</em>
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
