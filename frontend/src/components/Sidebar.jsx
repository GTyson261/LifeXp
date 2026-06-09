export default function Sidebar({ state, classMeta = {} }) {
  const primaryClass = state?.primaryClass || "NOVICE";
  const level = state?.level || 1;
  const xp = state?.xp || 0;
  const xpNeeded = level * 100;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const playerName = state?.playerName || state?.avatar?.displayName || "PlayerOne";
  const pronouns = state?.pronouns || state?.avatar?.pronouns || "they/them";

  return (
    <aside className="lifexp-sidebar">
      <div className="sidebar-brand">
        <h1>LifeXP</h1>
        <p>Real-Life RPG Simulator</p>
      </div>

      <div className="sidebar-card player-card">
        <div className="mini-avatar">
          {classMeta?.[primaryClass]?.icon || "✨"}
        </div>

        <div>
          <strong>{playerName}</strong>
          <p>Level {level}</p>
          <span>{pronouns}</span>
        </div>
      </div>

      <div className="sidebar-card rank-card">
        <p>Sanctuary Rank</p>
        <h3>{classMeta?.[primaryClass]?.label || primaryClass}</h3>

        <div className="mini-progress">
          <div style={{ width: `${xpPercent}%` }} />
        </div>

        <span>{xp} / {xpNeeded} XP</span>
      </div>

      <div className="sidebar-quote">
        “The grind never stops, but neither do legends.”
      </div>
    </aside>
  );
}
