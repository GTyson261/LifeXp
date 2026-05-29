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
          <div
            key={world.id}
            className={currentWorldId === world.id ? "world-card active-world premium-world-card" : "world-card premium-world-card"}
          >
            <strong>{world.name}</strong>
            <p>{world.description}</p>
            <span>Boss: {world.bossName}</span>

            <button
              disabled={!world.unlocked || currentWorldId === world.id}
              onClick={() => onTravel(world.id)}
            >
              {currentWorldId === world.id ? "Current Zone" : "Travel"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}