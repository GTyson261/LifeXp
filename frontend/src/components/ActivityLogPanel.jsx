

export default function ActivityLogPanel({ activityLog = [] }) {
  const summary = getActivitySummary(activityLog);
  const signalStrength = activityLog.length === 0 ? 0 : Math.min(100, activityLog.length * 12 + summary.quest * 8 + summary.boss * 10 + summary.growth * 10);
  const latestCategory = activityLog.length > 0 ? activityCategory(activityLog[0]) : "Idle";

  return (
    <div className="panel activity-log premium-activity-log">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Timeline</p>
          <h3>Recent Activity</h3>
          <p>{activityLog.length} logged events</p>
        </div>
      </div>

      <div className="activity-summary-strip">
        <span><small>Quests</small><strong>{summary.quest}</strong></span>
        <span><small>Boss</small><strong>{summary.boss}</strong></span>
        <span><small>Growth</small><strong>{summary.growth}</strong></span>
      </div>

      <div className="timeline-signal-card" aria-label="Timeline signal">
        <div>
          <small>Timeline Signal</small>
          <strong>{signalStrength}%</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${signalStrength}%` }} />
        </i>
        <span>Latest: {latestCategory}</span>
      </div>

      <div className="activity-timeline">
        {activityLog.length > 0 ? (
          activityLog.map((item, index) => (
            <div className="log-item timeline-item" key={`${item}-${index}`}>
              <div className="timeline-dot">{activityIcon(item)}</div>
              <div>
                <div className="log-item-title-row">
                  <small>Event {activityLog.length - index}</small>
                  <span>{activityCategory(item)}</span>
                </div>
                <strong>{activityTitle(item)}</strong>
                <p>{item}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-card">
            <strong>No activity yet.</strong>
            <p>Complete an action to start your LifeXP timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getActivitySummary(activityLog = []) {
  return activityLog.reduce((summary, item) => {
    const category = activityCategory(item);

    if (category === "Quest") summary.quest += 1;
    if (category === "Boss" || category === "Loot") summary.boss += 1;
    if (category === "Level" || category === "Skill") summary.growth += 1;

    return summary;
  }, { quest: 0, boss: 0, growth: 0 });
}

function activityCategory(item = "") {
  const value = item.toLowerCase();

  if (value.includes("level")) return "Level";
  if (value.includes("boss")) return "Boss";
  if (value.includes("loot")) return "Loot";
  if (value.includes("skill")) return "Skill";
  if (value.includes("quest")) return "Quest";
  if (value.includes("avatar")) return "Avatar";

  return "Log";
}

function activityIcon(item = "") {
  const value = item.toLowerCase();

  if (value.includes("level")) return "⭐";
  if (value.includes("boss")) return "👾";
  if (value.includes("loot")) return "🎁";
  if (value.includes("skill")) return "💠";
  if (value.includes("quest")) return "◇";
  if (value.includes("avatar")) return "♙";

  return "•";
}

function activityTitle(item = "") {
  const value = item.toLowerCase();

  if (value.includes("level")) return "Level Update";
  if (value.includes("boss")) return "Boss Progress";
  if (value.includes("loot")) return "Loot Event";
  if (value.includes("skill")) return "Skill Update";
  if (value.includes("quest")) return "Quest Update";
  if (value.includes("avatar")) return "Avatar Update";

  return "Activity Logged";
}
