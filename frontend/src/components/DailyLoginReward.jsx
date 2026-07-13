import { useEffect, useRef } from "react";

export default function DailyLoginReward({ state, onClaim, onDismiss }) {
  const claimButtonRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    claimButtonRef.current?.focus();
    return () => previousFocus?.focus?.();
  }, []);

  function handleDialogKeyDown(event) {
    if (event.key === "Escape") {
      onDismiss();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll("button:not(:disabled)"));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!state) return null;

  const streak = Math.max(0, state.loginRewardStreak || 0) + 1;
  const day = ((streak - 1) % 7) + 1;
  const gold = 20 + day * 8;
  const crystals = day >= 3 ? 2 : 1;
  const essence = day >= 5 ? 2 : day >= 2 ? 1 : 0;
  const nextDay = day === 7 ? 1 : day + 1;
  const streakPower = Math.min(100, Math.round((day / 7) * 100));

  return (
    <div
      className="daily-reward-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-reward-title"
      aria-describedby="daily-reward-description"
      onKeyDown={handleDialogKeyDown}
    >
      <div className="daily-reward-card">
        <p className="eyebrow">Daily Login</p>
        <h2 id="daily-reward-title">Day {day} Streak Reward</h2>
        <p id="daily-reward-description">Claim today’s boost before jumping back into quests.</p>

        <div className="daily-reward-status">
          <span>
            <small>Streak Power</small>
            <strong>{streakPower}%</strong>
            <i><b style={{ width: `${streakPower}%` }} /></i>
          </span>
          <span>
            <small>Next Cache</small>
            <strong>Day {nextDay}</strong>
          </span>
        </div>

        <div className="daily-streak-track" aria-label={`Day ${day} of 7 reward track`}>
          {Array.from({ length: 7 }, (_, index) => (
            <span
              key={index + 1}
              className={index + 1 <= day ? "active" : ""}
            >
              {index + 1}
            </span>
          ))}
        </div>

        <div className="daily-reward-grid">
          <span className="daily-reward-gold"><strong>{gold}</strong><small>Gold</small></span>
          <span className="daily-reward-crystals"><strong>{crystals}</strong><small>Crystals</small></span>
          <span className="daily-reward-essence"><strong>{essence}</strong><small>Essence</small></span>
        </div>

        <div className="daily-reward-actions">
          <button ref={claimButtonRef} type="button" onClick={onClaim}>Claim Reward</button>
          <button type="button" onClick={onDismiss}>Later</button>
        </div>
      </div>
    </div>
  );
}
