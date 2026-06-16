export default function QuestPanel({ quests = [], onClaimQuest, className = "", primaryClass = "NOVICE" }) {
  const storyQuests = quests.filter((quest) => (quest.id || "").startsWith("class_"));
  const dailyQuests = quests.filter((quest) => !(quest.id || "").startsWith("class_"));
  const totalQuests = quests.length;
  const completedQuests = quests.filter((quest) => quest.completed).length;
  const claimedQuests = quests.filter((quest) => quest.claimed).length;
  const completionPercent = totalQuests === 0 ? 0 : Math.round((completedQuests / totalQuests) * 100);
  const readyToClaim = quests.filter((quest) => quest.completed && !quest.claimed).length;
  const totalRewardXp = quests.reduce((sum, quest) => sum + (quest.claimed ? 0 : quest.rewardXp || 0), 0);
  const totalRewardGold = quests.reduce((sum, quest) => sum + (quest.claimed ? 0 : quest.rewardGold || 0), 0);
  const campaignPressure = Math.min(100, completionPercent + readyToClaim * 12 + storyQuests.length * 3);
  const nextQuest = quests.find((quest) => !quest.completed) || quests.find((quest) => quest.completed && !quest.claimed);

  return (
    <div className={`panel quests-panel premium-quest-panel ${className}`.trim()}>
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

      <div className="quest-intel-grid" aria-label="Quest board intel">
        <div className="quest-intel-card primary">
          <div>
            <small>Board Pressure</small>
            <strong>{campaignPressure}%</strong>
          </div>
          <i aria-hidden="true">
            <b style={{ width: `${campaignPressure}%` }} />
          </i>
          <span>{nextQuest ? `Next: ${nextQuest.name}` : "Board cleared"}</span>
        </div>
        <div className="quest-intel-card">
          <small>Unclaimed XP</small>
          <strong>{totalRewardXp}</strong>
          <span>{readyToClaim} claim window{readyToClaim === 1 ? "" : "s"}</span>
        </div>
        <div className="quest-intel-card">
          <small>Gold Cache</small>
          <strong>{totalRewardGold}</strong>
          <span>{formatClassName(primaryClass)} route</span>
        </div>
      </div>

      <div className="quest-command-strip">
        <span>
          <small>Story Chain</small>
          <strong>{storyQuests.length}</strong>
        </span>
        <span>
          <small>Daily Board</small>
          <strong>{dailyQuests.length}</strong>
        </span>
        <span>
          <small>Ready Claims</small>
          <strong>{readyToClaim}</strong>
        </span>
      </div>

      {storyQuests.length > 0 && (
        <div className="class-quest-chain">
          <div className="class-chain-header">
            <span>Class Story Chain</span>
            <strong>{formatClassName(primaryClass)}</strong>
          </div>

          <div className="quest-list">
            {storyQuests.map((quest, index) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaimQuest={onClaimQuest}
                storyStep={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      <div className="quest-list">
        {dailyQuests.length > 0 ? (
          dailyQuests.map((quest) => (
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

function QuestCard({ quest, onClaimQuest, storyStep = null }) {
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
  const tier = rewardTier(quest);
  const difficulty = questDifficulty(target, progressPercent, storyStep);

  return (
    <div className={quest.completed ? `quest-card completed premium-quest-card quest-tier-${tier.toLowerCase()}` : `quest-card premium-quest-card quest-tier-${tier.toLowerCase()}`}>
      <div className="quest-status-icon">
        {storyStep ? storyStep : statusIcon}
      </div>

      <div className="quest-card-main">
        <div className="quest-card-title-row">
          <strong>{quest.name}</strong>
          <div className="quest-title-badges">
            <span className="quest-type-chip">{storyStep ? "Story" : "Daily"}</span>
            <span className="quest-tier-chip">{tier}</span>
            <span className={quest.claimed ? "quest-status claimed" : "quest-status"}>
              {statusLabel}
            </span>
          </div>
        </div>

        <p>{quest.description}</p>

        <div className="mini-progress quest-mini-progress" aria-label={`${progress} of ${target} progress`}>
          <div style={{ width: `${progressPercent}%` }} />
        </div>

        <small>
          {progress} / {target} • {quest.actionType || "any"}
        </small>

        <div className="quest-signal-row">
          <span>{progressPercent}% progress</span>
          <span>{difficulty}</span>
          <span>{canClaim ? "Reward unlocked" : quest.claimed ? "Reward claimed" : "Awaiting action"}</span>
        </div>

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

function rewardTier(quest = {}) {
  const value = (quest.rewardXp || 0) + (quest.rewardGold || 0) + (quest.rewardEssence || 0) * 20;

  if (value >= 260) return "Legendary";
  if (value >= 150) return "Epic";
  if (value >= 80) return "Rare";

  return "Common";
}

function questDifficulty(target = 1, progressPercent = 0, storyStep = null) {
  if (storyStep) return `Story Step ${storyStep}`;
  if (progressPercent >= 100) return "Turn-in Ready";
  if (target >= 5) return "Multi-step";
  if (target >= 3) return "Standard";

  return "Quick Win";
}

function formatClassName(className = "") {
  return className
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
