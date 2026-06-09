export default function ClassMasteryPanel({ state, classMeta = {} }) {
  const primaryClass = state?.primaryClass || "NOVICE";
  const meta = classMeta[primaryClass] || classMeta.NOVICE || {};
  const mastery = state?.classMastery || 0;
  const masteryLevel = Math.min(5, Math.floor(mastery / 25) + 1);
  const masteryPercent = Math.min(100, Math.round((mastery % 25) * 4));
  const classQuests = (state?.dailyQuests || []).filter((quest) => (quest.id || "").startsWith("class_"));

  const perks = [
    "Origin identity unlocked",
    "Class quests reward more momentum",
    "Boss damage bonus begins to scale",
    "Travel and activity perks sharpen",
    "Legend cosmetics become easier to earn"
  ];

  return (
    <div className="panel mastery-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Class Mastery</p>
          <h3>{meta.icon || "✨"} {meta.label || primaryClass}</h3>
          <p>{mastery} mastery • Rank {masteryLevel}</p>
        </div>
      </div>

      <div className="mastery-track">
        <div style={{ width: `${masteryPercent}%` }} />
      </div>

      <div className="mastery-rank-grid">
        {perks.map((perk, index) => (
          <div
            key={perk}
            className={index < masteryLevel ? "mastery-rank unlocked" : "mastery-rank"}
          >
            <span>{index + 1}</span>
            <strong>{perk}</strong>
          </div>
        ))}
      </div>

      <div className="mastery-chain-summary">
        {classQuests.map((quest, index) => (
          <span key={quest.id} className={quest.completed ? "complete" : ""}>
            {index + 1}. {quest.name}
          </span>
        ))}
      </div>
    </div>
  );
}
