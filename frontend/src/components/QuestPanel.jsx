export default function QuestPanel({ quests = [], onClaimQuest }) {
  const totalQuests = quests.length;
  const completedQuests = quests.filter((quest) => quest.completed).length;
  const claimedQuests = quests.filter((quest) => quest.claimed).length;
  const completionPercent = totalQuests === 0 ? 0 : Math.round((completedQuests / totalQuests) * 100);

  return (
    <div className="panel quests-panel premium-quest-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Daily Objectives</p>
          <h3>Daily Quests</h3>
          <p>{completedQuests} / {totalQuests} completed • {claimedQuests} claimed</p>
        </div>

        <div className="quest-ring">
          <strong>{completionPercent}%</strong>
          <span>done</span>
        </div>
      </div>

      <div className="quest-progress-track">
        <div style={{ width: `${completionPercent}%` }} />
      </div>

      <div className="quest-list">
        {quests.length > 0 ? (
          quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onClaimQuest={onClaimQuest} />
          ))
        ) : (
          <div className="empty-state-card">
            <strong>No quests loaded yet.</strong>
            <p>Complete actions to unlock daily objectives.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestCard({ quest, onClaimQuest }) {
  const statusLabel = quest.claimed
    ? "Claimed"
    : quest.completed
      ? "Complete"
      : "In Progress";

  const statusIcon = quest.claimed
    ? "🏆"
    : quest.completed
      ? "✅"
      : "⬡";
  const target = Math.max(1, quest.target || 1);
  const progress = quest.completed ? target : Math.min(target, quest.progress || 0);
  const progressPercent = Math.round((progress / target) * 100);
  const canClaim = quest.completed && !quest.claimed;

  return (
    <div className={quest.completed ? "quest-card completed premium-quest-card" : "quest-card premium-quest-card"}>
      <div className="quest-status-icon">{statusIcon}</div>

      <div className="quest-card-main">
        <div className="quest-card-title-row">
          <strong>{quest.name}</strong>
          <span className={quest.claimed ? "quest-status claimed" : "quest-status"}>
            {statusLabel}
          </span>
        </div>

        <p>{quest.description}</p>

        <div className="mini-progress quest-mini-progress" aria-label={`${progress} of ${target} progress`}>
          <div style={{ width: `${progressPercent}%` }} />
        </div>

        <small>
          {progress} / {target} • {quest.actionType || "any"}
        </small>

        <div className="quest-reward-row">
          <span>Reward</span>
          <strong>
            {quest.rewardXp ?? 0} XP + {quest.rewardGold ?? 0} Gold
            {quest.rewardEssence ? ` + ${quest.rewardEssence} Essence` : ""}
          </strong>
        </div>

        <button
          type="button"
          className="quest-claim-button"
          disabled={!canClaim}
          onClick={() => onClaimQuest?.(quest.id)}
        >
          {quest.claimed ? "Claimed" : canClaim ? "Claim Reward" : "Keep Going"}
        </button>
      </div>
    </div>
  );
}
