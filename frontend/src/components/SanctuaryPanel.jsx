export default function SanctuaryPanel({ state, classMeta = {} }) {
  const primaryMeta = classMeta[state?.primaryClass] || { label: state?.primaryClass || "Unknown", icon: "✨" };
  const activeMeta = classMeta[state?.activeClass] || { label: state?.activeClass || "Unknown", icon: "✨" };
  const resetStatus = getResetStatus(state?.lastDailyReset);

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
