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
  const completedCount = weeklyQuests.filter((quest) => quest.progress >= quest.target).length;
  const totalProgress = weeklyQuests.reduce((sum, quest) => sum + Math.min(quest.target, quest.progress), 0);
  const totalTarget = weeklyQuests.reduce((sum, quest) => sum + quest.target, 0);
  const weeklyPercent = totalTarget === 0 ? 0 : Math.round((totalProgress / totalTarget) * 100);
  const cacheStage = weeklyPercent >= 100 ? "Mythic Cache" : weeklyPercent >= 66 ? "Epic Cache" : weeklyPercent >= 33 ? "Rare Cache" : "Starter Cache";
  const nextWeekly = weeklyQuests.find((quest) => quest.progress < quest.target);

  return (
    <div className="panel weekly-quest-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Weekly Objectives</p>
          <h3>Weekly Quests</h3>
          <p>Longer goals for cosmetics and bigger currency bundles.</p>
        </div>
      </div>

      <div className="weekly-command-strip">
        <span>
          <small>Weekly Push</small>
          <strong>{weeklyPercent}%</strong>
        </span>
        <span>
          <small>Claim Ready</small>
          <strong>{completedCount}</strong>
        </span>
        <span>
          <small>Class Path</small>
          <strong>{primaryMeta.label || "Class"}</strong>
        </span>
      </div>

      <div className="weekly-cache-card" aria-label="Weekly cache progress">
        <div>
          <small>Reward Cache</small>
          <strong>{cacheStage}</strong>
          <span>{nextWeekly ? `Next push: ${nextWeekly.name}` : "Weekly board complete"}</span>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${weeklyPercent}%` }} />
        </i>
      </div>

      <div className="weekly-quest-grid">
        {weeklyQuests.map((quest) => {
          const percent = Math.round((quest.progress / quest.target) * 100);
          const isComplete = percent >= 100;
          const stage = percent >= 100 ? "Complete" : percent >= 66 ? "Final Push" : percent >= 33 ? "Building" : "Opening";

          return (
            <div key={quest.id} className={isComplete ? "weekly-quest complete" : "weekly-quest"}>
              <div className="weekly-quest-header">
                <strong>{quest.name}</strong>
                <span>{stage}</span>
              </div>
              <p>{quest.description}</p>
              <div className="mini-progress">
                <div style={{ width: `${percent}%` }} />
              </div>
              <div className="weekly-reward-row">
                <small>{quest.progress} / {quest.target}</small>
                <span className="weekly-reward-chip">{quest.reward}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
