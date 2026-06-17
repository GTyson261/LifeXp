export default function ActivityPanel({
  activities = [],
  activityType,
  setActivityType,
  amount,
  setAmount,
  summary,
  setSummary,
  verified,
  setVerified,
  energy = 100,
  energyCost = 0,
  onSubmit
}) {
  const energyAfter = Math.max(0, energy - energyCost);
  const canAffordEnergy = energy >= energyCost;
  const selectedActivity = activities.find((activity) => activity.key === activityType) || activities[0];
  const numericAmount = Math.max(0, Number(amount) || 0);
  const estimatedXp = numericAmount > 0 ? Math.max(5, Math.round(numericAmount * (verified ? 1.35 : 1))) : 0;
  const summaryLength = summary.trim().length;
  const intentPercent = Math.min(100, Math.round((numericAmount / 45) * 100));
  const proofPercent = Math.min(100, Math.round((summaryLength / 80) * 100));
  const readinessScore = Math.min(
    100,
    Math.round((intentPercent * 0.48) + (proofPercent * 0.3) + (verified ? 22 : 0))
  );
  const energyState = !canAffordEnergy ? "Low" : energyAfter < 25 ? "Tight" : "Ready";
  const missionState = !numericAmount
    ? "Set Amount"
    : !summaryLength
      ? "Add Summary"
      : canAffordEnergy
        ? "Ready"
        : "Recharge";
  const signalPips = [25, 50, 75, 100];

  return (
    <form className="panel activity-panel premium-activity-panel" onSubmit={onSubmit}>
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Manual Action</p>
          <h3>Manual XP Entry</h3>
          <p>Log real-life progress when you are not using the timer.</p>
          <p className="energy-preview">⚡ Current Energy: {energy}%</p>
          <div className={canAffordEnergy ? "energy-cost-preview" : "energy-cost-preview low-energy"}>
            <span>Energy Cost: {energyCost}</span>
            <span>Energy After: {energyAfter}%</span>
          </div>
        </div>
      </div>

      <div className="activity-mission-console" aria-label="Manual XP mission console">
        <div className="activity-console-header">
          <span>{selectedActivity?.icon || "🎯"}</span>
          <div>
            <small>Mission Type</small>
            <strong>{selectedActivity?.label || "Action"}</strong>
          </div>
          <b>{missionState}</b>
        </div>

        <div className="activity-intent-meter">
          <div>
            <small>Intent Lock</small>
            <strong>{readinessScore}%</strong>
          </div>
          <i><b style={{ width: `${readinessScore}%` }} /></i>
        </div>

        <div className="activity-signal-row" aria-label={`Readiness signal ${readinessScore}%`}>
          {signalPips.map((pip) => (
            <span key={pip} className={readinessScore >= pip ? "active" : ""} />
          ))}
        </div>

        <div className="activity-console-grid">
          <span>
            <small>Forecast</small>
            <strong>{estimatedXp ? `+${estimatedXp} XP` : "Standby"}</strong>
          </span>
          <span>
            <small>Proof</small>
            <strong>{verified ? "Verified" : "Optional"}</strong>
          </span>
          <span>
            <small>Energy</small>
            <strong>{energyState}</strong>
          </span>
        </div>
      </div>

      <div className="activity-command-card">
        <span>{selectedActivity?.icon || "🎯"}</span>
        <div>
          <small>Selected Action</small>
          <strong>{selectedActivity?.label || "Action"}</strong>
        </div>
        <div>
          <small>XP Forecast</small>
          <strong>{estimatedXp ? `+${estimatedXp}` : "Awaiting input"}</strong>
        </div>
      </div>

      <div className="activity-energy-meter" aria-label={`Energy after action ${energyAfter}%`}>
        <i style={{ width: `${energyAfter}%` }} />
      </div>

      <label>
        Activity Type
        <select
          value={activityType}
          onChange={(event) => setActivityType(event.target.value)}
        >
          {activities.map((activity) => (
            <option key={activity.key} value={activity.key}>
              {activity.icon} {activity.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Amount
        <input
          type="number"
          placeholder="Minutes, pages, steps, or points"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>

      <label>
        Summary
        <textarea
          placeholder="What did you complete?"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
      </label>

      <label className="checkbox-row verified-row">
        <input
          type="checkbox"
          checked={verified}
          onChange={(event) => setVerified(event.target.checked)}
        />
        Verified bonus
      </label>

      <button type="submit" disabled={!canAffordEnergy}>
        {canAffordEnergy ? "Claim XP" : "Not Enough Energy"}
      </button>
    </form>
  );
}
