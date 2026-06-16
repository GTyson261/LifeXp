export default function AchievementToast({ achievement, onDismiss }) {
  if (!achievement) return null;

  const signal = achievement.name?.length ? Math.min(100, Math.max(35, achievement.name.length * 6)) : 72;

  return (
    <div className="achievement-toast" role="status">
      <span className="achievement-toast-icon">🏆</span>
      <div>
        <div className="achievement-toast-title-row">
          <small>Achievement unlocked</small>
          <span>New</span>
        </div>
        <strong>{achievement.name}</strong>
        <p>{achievement.description}</p>
        <div className="achievement-toast-signal" aria-label={`Achievement signal ${signal}%`}>
          <span>
            <small>Signal</small>
            <strong>{signal}%</strong>
          </span>
          <span>
            <small>Status</small>
            <strong>Claimed</strong>
          </span>
        </div>
        <div className="achievement-toast-meter" aria-hidden="true">
          <i />
        </div>
      </div>
      <button type="button" aria-label="Dismiss achievement" onClick={onDismiss}>
        x
      </button>
    </div>
  );
}
