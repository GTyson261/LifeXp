export default function TimerPanel({
  activities = [],
  timerActivity,
  setTimerActivity,
  timerRunning,
  timerSeconds,
  onStart,
  onStopAndClaim,
  formatTime
}) {
  const selectedActivity = activities.find((activity) => activity.key === timerActivity);

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

      <div className="timer-display premium-timer-display">
        <span>{selectedActivity?.icon || "⏱️"}</span>
        <strong>{formatTime(timerSeconds)}</strong>
      </div>

      {!timerRunning ? (
        <button onClick={onStart} type="button">Start Timer</button>
      ) : (
        <button onClick={onStopAndClaim} type="button">Stop & Claim Verified XP</button>
      )}
    </div>
  );
}
