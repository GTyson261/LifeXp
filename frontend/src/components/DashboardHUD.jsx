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
  const quests = state?.dailyQuests || [];
  const completedQuests = quests.filter((quest) => quest.completed).length;
  const claimReady = quests.filter((quest) => quest.completed && !quest.claimed).length;
  const equippedItems = (state?.inventory || []).filter((item) => item.equipped).length;
  const missionDeck = [
    {
      icon: "◇",
      label: "Daily Ops",
      value: quests.length ? `${completedQuests}/${quests.length}` : "Ready",
      detail: claimReady > 0 ? `${claimReady} claim ready` : "Quest board synced"
    },
    {
      icon: "⚔",
      label: "Threat",
      value: boss?.maxHp ? `${bossPercent}%` : "Scan",
      detail: boss?.name || "Awaiting boss signal"
    },
    {
      icon: "♙",
      label: "Loadout",
      value: `${equippedItems} gear`,
      detail: state?.equippedAura || state?.avatar?.aura || "Starter Glow"
    },
    {
      icon: "🔥",
      label: "Streak",
      value: `${state?.loginStreak || 1} day`,
      detail: `${state?.bossesDefeated || 0} boss clears`
    }
  ];

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

      <div className="hud-mission-deck" aria-label="Mission control deck">
        {missionDeck.map((mission) => (
          <div className="hud-mission-tile" key={mission.label}>
            <span>{mission.icon}</span>
            <div>
              <small>{mission.label}</small>
              <strong>{mission.value}</strong>
              <em>{mission.detail}</em>
            </div>
          </div>
        ))}
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
