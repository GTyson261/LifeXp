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
