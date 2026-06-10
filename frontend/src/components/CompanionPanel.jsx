export default function CompanionPanel({ state, classMeta = {}, rankTitle }) {
  const activeClass = state?.activeClass || "NOVICE";
  const meta = classMeta[activeClass] || classMeta.NOVICE || { icon: "◇", label: activeClass };
  const mood = state?.energy >= 70 ? "Charged" : state?.energy >= 35 ? "Steady" : "Resting";

  return (
    <div className="panel companion-panel">
      <div className={`companion-sprite companion-${activeClass.toLowerCase()}`} aria-hidden="true">
        <span>{meta.icon}</span>
      </div>
      <div>
        <p className="eyebrow">Class Companion</p>
        <h3>{meta.label} Spark</h3>
        <p>{rankTitle || "Gatebound Novice"} · {mood}</p>
      </div>
    </div>
  );
}
