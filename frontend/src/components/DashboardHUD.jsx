export default function DashboardHUD({ state, classMeta = {}, rankTitle = "" }) {
  const activeClass = state?.activeClass || "NOVICE";
  const displayClass = activeClass.replaceAll("_", " ");
  const meta = classMeta?.[activeClass] || {
    icon: "✨",
    label: displayClass
  };
  const playerName = state?.playerName || state?.avatar?.displayName || "PlayerOne";
  const pronouns = state?.pronouns || state?.avatar?.pronouns || "they/them";
  const boss = state?.currentBoss;
  const bossPercent = boss?.maxHp ? Math.max(0, Math.round((boss.hp / boss.maxHp) * 100)) : 0;
  const energy = state?.energy ?? 100;

  return (
    <section className="premium-top-hud">
      <div className="premium-brand-row">
        <div className="hud-title-block">
          <p className="eyebrow">Live Season Build</p>
          <h1>LifeXP</h1>
          <p>{meta.world || "Origin Realm"} campaign active. Clear quests, break bosses, claim loot.</p>
        </div>

        <div className="hud-stat-row">
          <div className="hud-player-card">
            <span>{meta.icon}</span>
            <div>
              <strong>{playerName}</strong>
              <small>{rankTitle || pronouns}</small>
              {rankTitle && <em>{pronouns}</em>}
            </div>
          </div>
          <HudStat icon={meta.icon} label="Class" value={meta.label} />
          <HudStat icon="⭐" label="Level" value={state?.level || 1} />
          <HudStat icon="🪙" label="Gold" value={state?.gold || 0} />
          <HudStat icon="💎" label="Crystals" value={state?.crystals || 0} />
          <HudStat icon="💠" label="Skill Points" value={state?.skillPoints || 0} />
          <button className="hud-action-button" onClick={state?.onRest}>Rest</button>
          <button className="hud-action-button" onClick={state?.onReset}>Reset</button>
        </div>
      </div>

      <div className="hud-status-rail" aria-label="Current game status">
        <div className="hud-meter-card">
          <div>
            <span>Energy Core</span>
            <strong>{energy}%</strong>
          </div>
          <div className="hud-meter-track">
            <i style={{ width: `${Math.max(0, Math.min(100, energy))}%` }} />
          </div>
        </div>

        <div className="hud-meter-card boss-meter-card">
          <div>
            <span>{boss?.name || "World Boss"}</span>
            <strong>{boss?.maxHp ? `${bossPercent}% HP` : "Scanning"}</strong>
          </div>
          <div className="hud-meter-track danger">
            <i style={{ width: `${bossPercent}%` }} />
          </div>
        </div>

        <div className="hud-mission-card">
          <span>Campaign Record</span>
          <strong>{state?.bossesDefeated || 0} boss clears</strong>
        </div>
      </div>
    </section>
  );
}

function HudStat({ icon, label, value }) {
  return (
    <div className="hud-stat">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}
