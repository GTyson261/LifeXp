export default function AchievementToast({ achievement, onDismiss }) {
  if (!achievement) return null;

  return (
    <div className="achievement-toast" role="status">
      <span>🏆</span>
      <div>
        <small>Achievement unlocked</small>
        <strong>{achievement.name}</strong>
        <p>{achievement.description}</p>
      </div>
      <button type="button" aria-label="Dismiss achievement" onClick={onDismiss}>
        x
      </button>
    </div>
  );
}
