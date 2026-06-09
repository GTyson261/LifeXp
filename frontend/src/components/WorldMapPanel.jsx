export default function WorldMapPanel({ worlds = [], currentWorldId, onTravel }) {
  const unlockedWorlds = worlds.filter((world) => world.unlocked).length;

  return (
    <div className="panel world-map-panel premium-world-map-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">World Select</p>
          <h3>World Map</h3>
          <p>{unlockedWorlds} / {worlds.length} zones unlocked</p>
        </div>
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
  const className = [
    "world-card",
    "premium-world-card",
    isCurrent ? "active-world" : "",
    !world.unlocked ? "locked-world" : "",
    world.bossDefeated ? "cleared-world" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <div className="world-card-header">
        <div>
          <strong>{world.name}</strong>
          <span>{world.classTheme}</span>
        </div>
        <div className="world-state-chip">
          {world.bossDefeated ? "Cleared" : world.unlocked ? "Open" : "Locked"}
        </div>
      </div>

      <p>{world.description}</p>

      <div className="world-boss-row">
        <span>Boss</span>
        <strong>{world.bossName}</strong>
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
        {isCurrent ? "Current Zone" : world.unlocked ? "Travel" : "Locked"}
      </button>
    </div>
  );
}
