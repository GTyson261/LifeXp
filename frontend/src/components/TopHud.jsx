export default function TopHud({ state, onReset, onRest }) {
  const questsDone = state?.dailyQuests?.filter((quest) => quest.completed).length || 0;
  const totalQuests = state?.dailyQuests?.length || 0;
  const xpLastGain = state?.lastXpGain || 0;
  const energy = state?.energy ?? 100;
  const loginStreak = state?.loginStreak ?? 1;
  const resetStatus = getResetStatus(state?.lastDailyReset);
  const restStatus = getRestStatus(state?.lastRestTimestamp);

  return (
    <header className="premium-top-hud">
      <div className="premium-brand-row">
        <div>
          <p className="eyebrow">LifeXP Online</p>
          <h1>Gaming In Real Life</h1>
          <p className="hud-subtitle">{resetStatus}</p>
        </div>

        <div className="hud-stat-row">
          <HudStat icon="🔥" value={state?.bossesDefeated || 0} label="Boss Wins" />
          <HudStat icon="🧭" value={`${questsDone}/${totalQuests}`} label="Quests Done" />
          <HudStat icon="💠" value={`+${xpLastGain}`} label="Last XP Gain" />
          <HudStat icon="⚡" value={`${energy}%`} label="Energy" />
          <HudStat icon="📅" value={loginStreak} label="Login Streak" />
        </div>

        <div className="hud-action-row">
          <button onClick={onRest} disabled={energy >= 100 || !restStatus.ready}>
            {energy >= 100 ? "Energy Full" : restStatus.ready ? "Rest +25 Energy" : restStatus.label}
          </button>
          <button onClick={onReset}>Reset Demo</button>
        </div>
      </div>
    </header>
  );
}
function getRestStatus(lastRestTimestamp) {
  if (!lastRestTimestamp || Number(lastRestTimestamp) <= 0) {
    return { ready: true, label: "Rest Ready" };
  }

  const cooldown = 1000 * 60 * 30;
  const timeLeft = Math.max(0, Number(lastRestTimestamp) + cooldown - Date.now());

  if (timeLeft <= 0) {
    return { ready: true, label: "Rest Ready" };
  }

  const minutes = Math.max(1, Math.ceil(timeLeft / (1000 * 60)));
  return { ready: false, label: `Rest in ${minutes}m` };
}

function HudStat({ icon, value, label }) {
  return (
    <div className="hud-stat">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function getResetStatus(lastDailyReset) {
  if (!lastDailyReset) {
    return "Daily reset status loading...";
  }

  const resetInterval = 1000 * 60 * 60 * 24;
  const nextReset = Number(lastDailyReset) + resetInterval;
  const timeLeft = Math.max(0, nextReset - Date.now());

  if (timeLeft <= 0) {
    return "Daily reset ready on next action.";
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return `Daily reset in ${hours}h ${minutes}m`;
}
