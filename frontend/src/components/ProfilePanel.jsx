export default function ProfilePanel({ state, classMeta = {}, xpNeeded = 100, xpPercent = 0 }) {
  const primaryMeta = classMeta[state?.primaryClass] || classMeta.NOVICE || {};
  const activeMeta = classMeta[state?.activeClass] || primaryMeta;
  const avatar = state?.avatar || {};
  const ownedCosmetics = state?.inventory?.length || 0;
  const completedClassQuests = (state?.dailyQuests || []).filter(
    (quest) => (quest.id || "").startsWith("class_") && quest.completed
  ).length;

  function copyProfile() {
    const profileText = `${avatar.displayName || state?.playerName || "PlayerOne"} | Level ${state?.level || 1} ${primaryMeta.label || state?.primaryClass || "Novice"} | ${state?.xp || 0}/${xpNeeded} XP`;
    navigator.clipboard?.writeText(profileText);
  }

  return (
    <div className="panel profile-panel premium-profile-panel">
      <div className="profile-hero-row">
        <div className="profile-avatar-sigil">
          <span>{primaryMeta.icon || "✨"}</span>
        </div>

        <div>
          <p className="eyebrow">Character Profile</p>
          <h2>{avatar.displayName || state?.playerName || "PlayerOne"}</h2>
          <p>{state?.pronouns || avatar.pronouns || "they/them"} • {state?.title || "Gatebound Novice"}</p>
        </div>

        <button type="button" className="profile-copy-button" onClick={copyProfile}>
          Copy Card
        </button>
      </div>

      <div className="profile-xp-track">
        <div style={{ width: `${xpPercent}%` }} />
      </div>

      <div className="profile-stat-grid">
        <ProfileStat label="Primary" value={primaryMeta.label || state?.primaryClass || "Novice"} icon={primaryMeta.icon || "✨"} />
        <ProfileStat label="Active" value={activeMeta.label || state?.activeClass || "Novice"} icon={activeMeta.icon || "⚡"} />
        <ProfileStat label="Level" value={state?.level || 1} icon="⭐" />
        <ProfileStat label="Boss Wins" value={state?.bossesDefeated || 0} icon="🏆" />
        <ProfileStat label="Cosmetics" value={ownedCosmetics} icon="👕" />
        <ProfileStat label="Story Steps" value={`${completedClassQuests}/3`} icon="◇" />
      </div>

      <div className="profile-loadout-strip">
        <span>{state?.equippedFrame || "Starter Frame"}</span>
        <span>{state?.equippedAura || avatar.aura || "Starter Glow"}</span>
        <span>{avatar.outfit || "Novice Jacket"}</span>
      </div>
    </div>
  );
}

function ProfileStat({ icon, label, value }) {
  return (
    <div className="profile-stat">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}
