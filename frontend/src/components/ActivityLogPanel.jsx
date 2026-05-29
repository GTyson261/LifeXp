

export default function ActivityLogPanel({ activityLog = [] }) {
  return (
    <div className="panel activity-log premium-activity-log">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Timeline</p>
          <h3>Recent Activity</h3>
          <p>{activityLog.length} logged events</p>
        </div>
      </div>

      <div className="activity-timeline">
        {activityLog.length > 0 ? (
          activityLog.map((item, index) => (
            <div className="log-item timeline-item" key={`${item}-${index}`}>
              <div className="timeline-dot" />
              <div>
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