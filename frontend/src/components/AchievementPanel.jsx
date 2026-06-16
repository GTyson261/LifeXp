export default function AchievementPanel({ achievements = [] }) {
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const unlockPercent = achievements.length ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <div className="panel achievements-panel premium-achievements-panel">
      <div className="section-heading-row">
        <div>
          <h3>Achievements</h3>
          <p>{unlockedCount} / {achievements.length} unlocked</p>
        </div>

        <div className="achievement-badge-count">
          🏆 {unlockedCount}
        </div>
      </div>

      <div className="achievement-progress-track">
        <div style={{ width: `${unlockPercent}%` }} />
      </div>

      <div className="achievement-list">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={achievement.unlocked ? "achievement unlocked" : "achievement"}
          >
            <span>{achievement.unlocked ? "🏆" : "🔒"}</span>
            <div>
              <small>{achievement.unlocked ? "Unlocked" : "Locked"}</small>
              <strong>{achievement.name}</strong>
              <p>{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
