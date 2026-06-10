export default function DashboardHUD({ state, classMeta = {}, rankTitle = "" }) {
  const activeClass = state?.activeClass || "NOVICE";
  const displayClass = activeClass.replaceAll("_", " ");
  const meta = classMeta?.[activeClass] || {
    icon: "✨",
    label: displayClass
  };
  const playerName = state?.playerName || state?.avatar?.displayName || "PlayerOne";
  const pronouns = state?.pronouns || state?.avatar?.pronouns || "they/them";

  return (
    <section className="premium-top-hud">
      <div className="premium-brand-row">
        <div>
          <p className="eyebrow">Real-Life RPG Simulator</p>
          <h1>LifeXP</h1>
          <p>Level up your real life one quest at a time.</p>
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
          <HudStat icon="⚡" label="XP" value={state?.xp || 0} />
          <HudStat icon="💠" label="Skill Points" value={state?.skillPoints || 0} />
          <button className="hud-action-button" onClick={state?.onRest}>Rest</button>
          <button className="hud-action-button" onClick={state?.onReset}>Reset</button>
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
