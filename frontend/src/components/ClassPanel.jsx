export default function ClassPanel({ classes = [], classMeta = {}, primaryClass, onClassSelect }) {
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
