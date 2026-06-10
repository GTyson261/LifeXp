export default function DailyLoginReward({ state, onClaim, onDismiss }) {
  if (!state) return null;

  const streak = Math.max(0, state.loginRewardStreak || 0) + 1;
  const day = ((streak - 1) % 7) + 1;
  const gold = 20 + day * 8;
  const crystals = day >= 3 ? 2 : 1;
  const essence = day >= 5 ? 2 : day >= 2 ? 1 : 0;

  return (
    <div className="daily-reward-screen" role="dialog" aria-modal="true">
      <div className="daily-reward-card">
        <p className="eyebrow">Daily Login</p>
        <h2>Day {day} Streak Reward</h2>
        <p>Claim today’s boost before jumping back into quests.</p>

        <div className="daily-reward-grid">
          <span><strong>{gold}</strong><small>Gold</small></span>
          <span><strong>{crystals}</strong><small>Crystals</small></span>
          <span><strong>{essence}</strong><small>Essence</small></span>
        </div>

        <div className="daily-reward-actions">
          <button type="button" onClick={onClaim}>Claim Reward</button>
          <button type="button" onClick={onDismiss}>Later</button>
        </div>
      </div>
    </div>
  );
}
