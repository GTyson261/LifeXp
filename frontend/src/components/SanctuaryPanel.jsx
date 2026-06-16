export default function SanctuaryPanel({ state, classMeta = {} }) {
  const primaryMeta = classMeta[state?.primaryClass] || { label: state?.primaryClass || "Unknown", icon: "✨" };
  const activeMeta = classMeta[state?.activeClass] || { label: state?.activeClass || "Unknown", icon: "✨" };
  const resetStatus = getResetStatus(state?.lastDailyReset);
  const energy = Math.max(0, Math.min(100, state?.energy ?? 100));
  const penalty = state?.xpPenaltyActionsLeft ?? 0;
  const stability = Math.max(0, Math.min(100, energy - penalty * 8 + (state?.loginStreak ?? 1) * 4));
  const dailyState = resetStatus === "Ready" ? "Reset Ready" : "Cycle Active";

  return (
    <div className="panel sanctuary-status premium-sanctuary-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Sanctuary</p>
          <h3>Sanctuary Status</h3>
          <p>Your class identity, daily streak, and reset state.</p>
        </div>

        <div className="sanctuary-chip">
          {primaryMeta.icon} {primaryMeta.label}
        </div>
      </div>

      <div className="sanctuary-command-strip">
        <span>
          <small>Reset Window</small>
          <strong>{resetStatus}</strong>
        </span>
        <span>
          <small>Penalty</small>
          <strong>{penalty > 0 ? `${penalty} actions` : "Clear"}</strong>
        </span>
        <span>
          <small>Energy</small>
          <strong>{energy}%</strong>
          <i><b style={{ width: `${energy}%` }} /></i>
        </span>
      </div>

      <div className="sanctuary-system-card" aria-label="Sanctuary system status">
        <div>
          <small>System Stability</small>
          <strong>{stability}%</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${stability}%` }} />
        </i>
        <span>{dailyState} · {penalty > 0 ? "Penalty active" : "No penalties"}</span>
      </div>

      <div className="sanctuary-stat-grid">
        <SanctuaryStat label="Primary Class" value={primaryMeta.label} icon={primaryMeta.icon} />
        <SanctuaryStat label="Active Class" value={activeMeta.label} icon={activeMeta.icon} />
        <SanctuaryStat label="Class Mastery" value={state?.classMastery ?? 0} icon="⭐" />
        <SanctuaryStat label="XP Penalty Left" value={state?.xpPenaltyActionsLeft ?? 0} icon="⚠️" />
        <SanctuaryStat label="Login Streak" value={`${state?.loginStreak ?? 1} days`} icon="📅" />
        <SanctuaryStat label="Energy" value={`${state?.energy ?? 100}%`} icon="⚡" />
        <SanctuaryStat label="Last XP Gain" value={`+${state?.lastXpGain ?? 0}`} icon="💠" />
        <SanctuaryStat label="Daily Reset" value={resetStatus} icon="🔄" />
      </div>
    </div>
  );
}

function SanctuaryStat({ label, value, icon }) {
  return (
    <div className="sanctuary-stat-card">
      <div className="sanctuary-stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getResetStatus(lastDailyReset) {
  if (!lastDailyReset) {
    return "Loading";
  }

  const resetInterval = 1000 * 60 * 60 * 24;
  const nextReset = Number(lastDailyReset) + resetInterval;
  const timeLeft = Math.max(0, nextReset - Date.now());

  if (timeLeft <= 0) {
    return "Ready";
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
