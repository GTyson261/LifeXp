export default function WeeklyQuestPanel({ state, classMeta = {} }) {
  const bossWins = state?.bossesDefeated || 0;
  const level = state?.level || 1;
  const classCompleted = (state?.dailyQuests || []).filter(
    (quest) => (quest.id || "").startsWith("class_") && quest.completed
  ).length;
  const primaryMeta = classMeta[state?.primaryClass] || {};

  const weeklyQuests = [
    {
      id: "weekly_boss",
      name: "Weekly Raid Pressure",
      description: "Defeat or seriously pressure world bosses this week.",
      progress: Math.min(3, bossWins),
      target: 3,
      reward: "Frame or 250 Gold"
    },
    {
      id: "weekly_class",
      name: `${primaryMeta.label || "Class"} Story Push`,
      description: "Complete your class story chain steps.",
      progress: classCompleted,
      target: 3,
      reward: "Class cosmetic roll"
    },
    {
      id: "weekly_level",
      name: "Growth Milestone",
      description: "Reach the next weekly level checkpoint.",
      progress: Math.min(5, level),
      target: 5,
      reward: "10 Crystals + Essence"
    }
  ];

  return (
    <div className="panel weekly-quest-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Weekly Objectives</p>
          <h3>Weekly Quests</h3>
          <p>Longer goals for cosmetics and bigger currency bundles.</p>
        </div>
      </div>

      <div className="weekly-quest-grid">
        {weeklyQuests.map((quest) => {
          const percent = Math.round((quest.progress / quest.target) * 100);

          return (
            <div key={quest.id} className={percent >= 100 ? "weekly-quest complete" : "weekly-quest"}>
              <strong>{quest.name}</strong>
              <p>{quest.description}</p>
              <div className="mini-progress">
                <div style={{ width: `${percent}%` }} />
              </div>
              <small>{quest.progress} / {quest.target} • {quest.reward}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
