export default function TimerPanel({
  activities = [],
  timerActivity,
  setTimerActivity,
  timerRunning,
  timerSeconds,
  onStart,
  onStopAndClaim,
  formatTime,
  busy = false
}) {
  const selectedActivity = activities.find((activity) => activity.key === timerActivity);
  const minutes = Math.floor(timerSeconds / 60);
  const chargePercent = Math.min(100, Math.round((timerSeconds / 1500) * 100));
  const estimatedXp = Math.max(0, Math.floor(minutes * 10));
  const sessionTier = timerSeconds >= 1500 ? "Deep Run" : timerSeconds >= 600 ? "Focused" : timerRunning ? "Warming" : "Queued";

  return (
    <div className="panel timer-panel premium-timer-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Verified Grind</p>
          <h3>Verified Timer Tracking</h3>
          <p>Use focused sessions to earn verified XP.</p>
        </div>

        <div className={timerRunning ? "timer-status running" : "timer-status"}>
          {timerRunning ? "Live" : "Idle"}
        </div>
      </div>

      <label>
        Timer Activity
        <select
          value={timerActivity}
          disabled={timerRunning}
          onChange={(event) => setTimerActivity(event.target.value)}
        >
          {activities.map((activity) => (
            <option key={activity.key} value={activity.key}>
              {activity.icon} {activity.label}
            </option>
          ))}
        </select>
      </label>

      <div className="timer-cockpit-card" aria-label="Timer session cockpit">
        <div>
          <small>Session Tier</small>
          <strong>{sessionTier}</strong>
        </div>
        <div>
          <small>Charge</small>
          <strong>{chargePercent}%</strong>
        </div>
        <div>
          <small>XP Estimate</small>
          <strong>+{estimatedXp}</strong>
        </div>
      </div>

      <div className="timer-display premium-timer-display">
        <span>{selectedActivity?.icon || "⏱️"}</span>
        <strong>{formatTime(timerSeconds)}</strong>
        <small>{timerRunning ? "Verified session recording" : "Ready for verified XP"}</small>
      </div>

      <div className="timer-charge-meter" aria-label={`Timer charge ${chargePercent}%`}>
        <i>
          <b style={{ width: `${chargePercent}%` }} />
        </i>
      </div>

      <p className="timer-minimum-note">
        Verified rewards unlock after the first full minute. Only completed minutes are claimed.
      </p>

      <div className="timer-signal-row" aria-hidden="true">
        <span className={timerRunning ? "active" : ""} />
        <span className={timerRunning ? "active" : ""} />
        <span className={timerRunning ? "active" : ""} />
        <span />
      </div>

      {!timerRunning ? (
        <button onClick={onStart} type="button">Start Timer</button>
      ) : (
        <button disabled={busy} onClick={onStopAndClaim} type="button">
          {busy ? "Claiming Session..." : "Stop & Claim Verified XP"}
        </button>
      )}
    </div>
  );
}
