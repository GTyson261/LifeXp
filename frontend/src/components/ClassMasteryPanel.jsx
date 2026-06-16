export default function ClassMasteryPanel({ state, classMeta = {} }) {
  const primaryClass = state?.primaryClass || "NOVICE";
  const meta = classMeta[primaryClass] || classMeta.NOVICE || {};
  const mastery = state?.classMastery || 0;
  const masteryLevel = Math.min(5, Math.floor(mastery / 25) + 1);
  const masteryPercent = Math.min(100, Math.round((mastery % 25) * 4));
  const classQuests = (state?.dailyQuests || []).filter((quest) => (quest.id || "").startsWith("class_"));
  const completedClassQuests = classQuests.filter((quest) => quest.completed).length;
  const masteryCharge = Math.min(100, masteryPercent + completedClassQuests * 8);

  const perks = [
    "Origin identity unlocked",
    "Class quests reward more momentum",
    "Boss damage bonus begins to scale",
    "Travel and activity perks sharpen",
    "Legend cosmetics become easier to earn"
  ];
  const nextPerk = perks[Math.min(perks.length - 1, masteryLevel)] || perks[perks.length - 1];

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

      <div className="mastery-forecast-card">
        <div>
          <small>Mastery Charge</small>
          <strong>{masteryCharge}%</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${masteryCharge}%` }} />
        </i>
        <span>Next perk: {nextPerk}</span>
      </div>

      <div className="mastery-command-strip">
        <span>
          <small>Rank</small>
          <strong>{masteryLevel}/5</strong>
        </span>
        <span>
          <small>Next Rank</small>
          <strong>{100 - masteryPercent}%</strong>
        </span>
        <span>
          <small>Origin</small>
          <strong>{meta.world || "Gate"}</strong>
        </span>
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
