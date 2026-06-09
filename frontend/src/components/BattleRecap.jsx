export default function BattleRecap({ recap, onDismiss }) {
  if (!recap) return null;

  return (
    <div className="battle-recap-card">
      <div>
        <p className="eyebrow">Battle Recap</p>
        <h3>{recap.title}</h3>
        <p>{recap.summary}</p>
      </div>

      <div className="battle-recap-stats">
        <span>+{recap.xp || 0} XP</span>
        <span>{recap.damage || 0} damage</span>
        <span>{recap.phase || "Active"}</span>
      </div>

      <button type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
