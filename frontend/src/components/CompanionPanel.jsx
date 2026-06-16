export default function CompanionPanel({ state, classMeta = {}, rankTitle }) {
  const activeClass = state?.activeClass || "NOVICE";
  const meta = classMeta[activeClass] || classMeta.NOVICE || { icon: "◇", label: activeClass };
  const mood = state?.energy >= 70 ? "Charged" : state?.energy >= 35 ? "Steady" : "Resting";
  const bond = Math.min(100, Math.max(8, (state?.level || 1) * 8 + (state?.bossesDefeated || 0) * 6));
  const assistMode = bond >= 80 ? "Raid Assist" : bond >= 45 ? "Quest Assist" : "Idle Assist";

  return (
    <div className="panel companion-panel">
      <div className={`companion-sprite companion-${activeClass.toLowerCase()}`} aria-hidden="true">
        <span>{meta.icon}</span>
      </div>
      <div>
        <p className="eyebrow">Class Companion</p>
        <h3>{meta.label} Spark</h3>
        <p>{rankTitle || "Gatebound Novice"} · {mood}</p>
        <div className="companion-status-row">
          <span>{mood}</span>
          <strong>{bond}% bond</strong>
        </div>
        <div className="companion-bond-meter" aria-label={`Companion bond ${bond}%`}>
          <i style={{ width: `${bond}%` }} />
        </div>
        <div className="companion-assist-row">
          <small>{assistMode}</small>
          <span>{meta.world || "Class origin"} link</span>
        </div>
      </div>
    </div>
  );
}
