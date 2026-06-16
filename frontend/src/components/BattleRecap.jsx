export default function BattleRecap({ recap, onDismiss }) {
  if (!recap) return null;
  const grade = getRecapGrade(recap);
  const momentum = Math.max(0, Math.min(100, Math.round(((recap.damage || 0) / 100) * 100)));

  return (
    <div className="battle-recap-card">
      <div className="battle-recap-header">
        <div>
          <p className="eyebrow">Battle Recap</p>
          <h3>{recap.title}</h3>
          <p>{recap.summary}</p>
        </div>
        <span className="battle-recap-grade">{grade}</span>
      </div>

      <div className="battle-recap-stats">
        <span>+{recap.xp || 0} XP</span>
        <span>{recap.damage || 0} damage</span>
        <span>{recap.phase || "Active"}</span>
      </div>

      <div className="battle-recap-meter">
        <div>
          <span>Momentum</span>
          <strong>{momentum}%</strong>
        </div>
        <i aria-label={`Momentum ${momentum}%`}>
          <b style={{ width: `${momentum}%` }} />
        </i>
      </div>

      <button type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}

function getRecapGrade(recap) {
  const score = (recap.xp || 0) + (recap.damage || 0);

  if (score >= 180) return "S";
  if (score >= 120) return "A";
  if (score >= 70) return "B";
  return "C";
}
