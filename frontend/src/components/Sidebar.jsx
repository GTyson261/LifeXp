const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "⌂" },
  { key: "CODER", label: "Coder", icon: "⌨️" },
  { key: "BOOKWORM", label: "Bookworm", icon: "📖" },
  { key: "SPORT_MASTER", label: "Sport Master", icon: "💪" },
  { key: "GAMER", label: "Gamer", icon: "🎮" },
  { key: "EXPLORER", label: "Explorer", icon: "🧭" },
  { key: "ZEN", label: "Zen", icon: "🪷" },
  { key: "MUSICIAN", label: "Musician", icon: "🎵" },
  { key: "CHEF", label: "Chef", icon: "👨‍🍳" }
];

export default function Sidebar({ state, classMeta = {}, onClassSelect }) {
  const primaryClass = state?.primaryClass || "NOVICE";
  const level = state?.level || 1;
  const xp = state?.xp || 0;
  const xpNeeded = level * 100;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));

  return (
    <aside className="lifexp-sidebar">
      <div className="sidebar-brand">
        <h1>LifeXP</h1>
        <p>Real-Life RPG Simulator</p>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === "dashboard" || item.key === primaryClass;

          return (
            <button
              key={item.key}
              className={isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => {
                if (item.key !== "dashboard" && onClassSelect) {
                  onClassSelect(item.key);
                }
              }}
            >
              <span>{item.icon}</span>
              <strong>{item.label}</strong>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-card player-card">
        <div className="mini-avatar">
          {classMeta?.[primaryClass]?.icon || "✨"}
        </div>

        <div>
          <strong>PlayerOne</strong>
          <p>Level {level}</p>
        </div>
      </div>

      <div className="sidebar-card rank-card">
        <p>Sanctuary Rank</p>
        <h3>{classMeta?.[primaryClass]?.label || primaryClass}</h3>

        <div className="mini-progress">
          <div style={{ width: `${xpPercent}%` }} />
        </div>

        <span>{xp} / {xpNeeded} XP</span>
      </div>

      <div className="sidebar-quote">
        “The grind never stops, but neither do legends.”
      </div>
    </aside>
  );
}
