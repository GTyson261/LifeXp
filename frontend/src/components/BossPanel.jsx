export default function BossPanel({ boss, bossesDefeated = 0 }) {
  if (!boss) return null;

  const hpPercent = boss.maxHp > 0
    ? Math.max(0, Math.min(100, Math.round((boss.hp / boss.maxHp) * 100)))
    : 0;

  const phase = hpPercent <= 25
    ? "Enraged"
    : hpPercent <= 50
      ? "Wounded"
      : "Active";

  return (
    <div className="panel boss-panel premium-boss-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Raid Encounter</p>
          <h3>Current Boss</h3>
        </div>

        <div className="boss-win-chip">🏆 {bossesDefeated} wins</div>
      </div>

      <div className="boss-showcase">
        <div className="boss-avatar-ring">
          <div className="boss-avatar-core">
            {phase === "Enraged" ? "🔥" : phase === "Wounded" ? "⚔️" : "👾"}
          </div>
        </div>

        <div>
          <h2>{boss.name}</h2>
          <p>{boss.description}</p>
          <div className="boss-meta-row">
            <span>Level {boss.level || 1}</span>
            <span>{boss.element || "Shadow"}</span>
            <span>{phase}</span>
          </div>
        </div>
      </div>

      <div className="boss-health">
        <div style={{ width: `${hpPercent}%` }} />
      </div>

      <p>{boss.hp} / {boss.maxHp} HP</p>
    </div>
  );
}
