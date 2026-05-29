export default function AchievementPanel({ achievements = [] }) {
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

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

      <div className="achievement-list">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={achievement.unlocked ? "achievement unlocked" : "achievement"}
          >
            <span>{achievement.unlocked ? "🏆" : "🔒"}</span>
            <div>
              <strong>{achievement.name}</strong>
              <p>{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}