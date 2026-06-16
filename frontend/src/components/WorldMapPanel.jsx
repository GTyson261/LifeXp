export default function WorldMapPanel({ worlds = [], currentWorldId, onTravel }) {
  const unlockedWorlds = worlds.filter((world) => world.unlocked).length;
  const clearedWorlds = worlds.filter((world) => world.bossDefeated).length;
  const currentWorld = worlds.find((world) => world.id === currentWorldId);
  const nextLockedWorld = worlds.find((world) => !world.unlocked);
  const openBosses = worlds.filter((world) => world.unlocked && !world.bossDefeated).length;
  const campaignPercent = worlds.length === 0 ? 0 : Math.round((clearedWorlds / worlds.length) * 100);
  const unlockPercent = worlds.length === 0 ? 0 : Math.round((unlockedWorlds / worlds.length) * 100);

  return (
    <div className="panel world-map-panel premium-world-map-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Boss Select</p>
          <h3>World Boss Map</h3>
          <p>{unlockedWorlds} / {worlds.length} arenas unlocked. Pick the boss you want to challenge.</p>
        </div>
      </div>

      <div className="world-route-console" aria-label="World route console">
        <div>
          <small>Current Route</small>
          <strong>{currentWorld?.name || "Awakening Gate"}</strong>
          <span>{currentWorld?.bossName || "Boss signal unknown"}</span>
        </div>
        <div>
          <small>Next Gate</small>
          <strong>{nextLockedWorld?.name || "All Worlds Open"}</strong>
          <span>
            {nextLockedWorld
              ? `Requires level ${nextLockedWorld.minLevel || 1} and ${nextLockedWorld.requiredBosses || 0} wins`
              : "Final route is available"}
          </span>
        </div>
        <div>
          <small>Boss Radar</small>
          <strong>{openBosses} active</strong>
          <span>{clearedWorlds} cleared encounters</span>
        </div>
      </div>

      <div className="world-command-strip">
        <span>
          <small>Campaign</small>
          <strong>{campaignPercent}%</strong>
          <i><b style={{ width: `${campaignPercent}%` }} /></i>
        </span>
        <span>
          <small>Unlocked</small>
          <strong>{unlockedWorlds}/{worlds.length}</strong>
          <i><b style={{ width: `${unlockPercent}%` }} /></i>
        </span>
        <span>
          <small>Current Arena</small>
          <strong>{currentWorld?.name || "Unknown"}</strong>
        </span>
      </div>

      <div className="world-grid premium-world-grid">
        {worlds.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            isCurrent={currentWorldId === world.id}
            onTravel={onTravel}
          />
        ))}
      </div>
    </div>
  );
}

function WorldCard({ world, isCurrent, onTravel }) {
  const requirementScore = Math.max(1, (world.minLevel || 1) + (world.requiredBosses || 0) + (world.travelCost || 0));
  const readiness = world.bossDefeated ? 100 : world.unlocked ? 66 : Math.min(44, requirementScore * 5);
  const routeState = isCurrent ? "Tracking" : world.bossDefeated ? "Cleared" : world.unlocked ? "Available" : "Sealed";
  const className = [
    "world-card",
    "premium-world-card",
    isCurrent ? "active-world" : "",
    !world.unlocked ? "locked-world" : "",
    world.bossDefeated ? "cleared-world" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <div className="world-arena-art" aria-hidden="true">
        <span>{worldIcon(world.name)}</span>
      </div>

      <div className="world-card-header">
        <div>
          <strong>{world.name}</strong>
          <span>{world.bossName}</span>
        </div>
        <div className="world-state-chip">
          {world.bossDefeated ? "Cleared" : world.unlocked ? "Open" : "Locked"}
        </div>
      </div>

      <p>{world.description}</p>

      <div className="world-route-tags">
        <span>{world.classTheme?.replace("_", " ") || "NOVICE"}</span>
        <span>{routeState}</span>
      </div>

      <div className="world-boss-row">
        <span>Boss</span>
        <strong>{world.bossName}</strong>
      </div>

      <div className="world-readiness-meter">
        <div>
          <small>{world.bossDefeated ? "Cleared" : world.unlocked ? "Challenge Ready" : "Unlock Progress"}</small>
          <strong>{readiness}%</strong>
        </div>
        <i aria-label={`${world.name} readiness ${readiness}%`}>
          <b style={{ width: `${readiness}%` }} />
        </i>
      </div>

      <div className="world-requirement-grid">
        <small>Level {world.minLevel || 1}</small>
        <small>{world.requiredBosses || 0} wins</small>
        <small>{world.travelCost || 0} energy</small>
      </div>

      <button
        type="button"
        disabled={!world.unlocked || isCurrent}
        onClick={() => onTravel(world.id)}
      >
        {isCurrent ? "Current Boss" : world.unlocked ? "Challenge Boss" : "Locked"}
      </button>
    </div>
  );
}

function worldIcon(name = "") {
  const value = name.toLowerCase();

  if (value.includes("cyber")) return "⌨️";
  if (value.includes("knowledge")) return "📚";
  if (value.includes("titan")) return "⚡";
  if (value.includes("arcade")) return "🎮";
  if (value.includes("frontier")) return "🧭";
  if (value.includes("temple")) return "🧘";
  if (value.includes("rhythm")) return "🎵";
  if (value.includes("culinary")) return "🍳";

  return "✨";
}
