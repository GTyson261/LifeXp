export default function BossPanel({ boss, bossesDefeated = 0, className = "" }) {
  if (!boss) return null;

  const hpPercent = boss.maxHp > 0
    ? Math.max(0, Math.min(100, Math.round((boss.hp / boss.maxHp) * 100)))
    : 0;

  const phase = hpPercent <= 25
    ? "Enraged"
    : hpPercent <= 50
      ? "Wounded"
      : "Active";

  const phaseMessage = phase === "Enraged"
    ? "Final stand: every action hits a desperate boss."
    : phase === "Wounded"
      ? "Armor cracked: keep pressure on the encounter."
      : "Opening phase: build momentum and chip away.";

  const nextRewards = [
    `${75 + (boss.level || 1) * 10}+ Gold`,
    `${3 + Math.max(1, Math.floor((boss.level || 1) / 2))}+ Crystals`,
    "Cosmetic Drop"
  ];
  const phaseSteps = ["Active", "Wounded", "Enraged"];
  const threatScore = phase === "Enraged" ? 100 : phase === "Wounded" ? 66 : 34;
  const hpStatus = hpPercent <= 25 ? "Critical" : hpPercent <= 50 ? "Breaking" : "Stable";
  const raidSignal = phase === "Enraged" ? "Execute Window" : phase === "Wounded" ? "Pressure Phase" : "Engage";

  return (
    <div className={`panel boss-panel premium-boss-panel boss-phase-${phase.toLowerCase()} ${className}`.trim()}>
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Raid Encounter</p>
          <h3>Current Boss</h3>
        </div>

        <div className="boss-win-chip">🏆 {bossesDefeated} wins</div>
      </div>

      <div className="boss-phase-banner">
        <div>
          <span>{phase} Phase</span>
          <strong>{phaseMessage}</strong>
        </div>
        <em>{raidSignal}</em>
      </div>

      <div className="boss-phase-track" aria-label={`Boss phase ${phase}`}>
        {phaseSteps.map((step) => (
          <span key={step} className={phaseSteps.indexOf(step) <= phaseSteps.indexOf(phase) ? "active" : ""}>
            {step}
          </span>
        ))}
      </div>

      <div className="boss-showcase">
        <div className="boss-avatar-ring">
          <span className="boss-threat-orbit" />
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

      <div className="boss-raid-status" aria-label="Boss raid status">
        <span>
          <small>HP Status</small>
          <strong>{hpStatus}</strong>
        </span>
        <span>
          <small>Damage Window</small>
          <strong>{100 - hpPercent}% Open</strong>
        </span>
        <span>
          <small>Rewards</small>
          <strong>{nextRewards.length} Drops</strong>
        </span>
      </div>

      <div className="boss-health">
        <div style={{ width: `${hpPercent}%` }} />
      </div>

      <div className="boss-threat-meter">
        <div>
          <small>Threat Pressure</small>
          <strong>{threatScore}%</strong>
        </div>
        <i aria-label={`Threat pressure ${threatScore}%`}>
          <b style={{ width: `${threatScore}%` }} />
        </i>
      </div>

      <div className="boss-telemetry-grid">
        <span>
          <small>Threat</small>
          <strong>{phase}</strong>
        </span>
        <span>
          <small>Element</small>
          <strong>{boss.element || "Shadow"}</strong>
        </span>
        <span>
          <small>Tier</small>
          <strong>Lv {boss.level || 1}</strong>
        </span>
      </div>

      <div className="boss-footer-grid">
        <p>{boss.hp} / {boss.maxHp} HP</p>
        <div className="boss-reward-preview">
          {nextRewards.map((reward) => (
            <span key={reward}>{reward}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
