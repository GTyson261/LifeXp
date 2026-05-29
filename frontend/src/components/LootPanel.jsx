

export default function LootPanel({ bossesDefeated = 0, lastLootDrops = [], lootHistory = [] }) {
  return (
    <div className="panel loot-panel premium-loot-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Treasure</p>
          <h3>Loot Drops</h3>
          <p>Bosses Defeated: {bossesDefeated}</p>
        </div>

        <div className="loot-count-chip">
          ✨ {lootHistory.length}
        </div>
      </div>

      {lastLootDrops.length > 0 ? (
        <div className="loot-burst premium-loot-burst">
          {lastLootDrops.map((loot, index) => (
            <div className={`loot-chip ${rarityClass(loot)}`} key={`${loot}-${index}`}>
              <span>{rarityIcon(loot)}</span>
              <strong>{loot}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <strong>No loot found yet.</strong>
          <p>Defeat a boss to earn rewards, cosmetics, and resources.</p>
        </div>
      )}

      <div className="loot-history-header">
        <h4>Loot History</h4>
        <span>Latest 6</span>
      </div>

      <div className="loot-history-list">
        {lootHistory.length > 0 ? (
          lootHistory.slice(0, 6).map((loot, index) => (
            <div className="log-item loot-history-item" key={`${loot}-${index}`}>
              <span>{rarityIcon(loot)}</span>
              {loot}
            </div>
          ))
        ) : (
          <p>Your loot history is empty.</p>
        )}
      </div>
    </div>
  );
}

function rarityClass(loot = "") {
  const value = loot.toLowerCase();

  if (value.includes("legendary") || value.includes("mythic")) return "loot-legendary";
  if (value.includes("epic") || value.includes("rare")) return "loot-epic";
  if (value.includes("crystal") || value.includes("essence")) return "loot-magic";

  return "loot-common";
}

function rarityIcon(loot = "") {
  const value = loot.toLowerCase();

  if (value.includes("legendary") || value.includes("mythic")) return "👑";
  if (value.includes("epic") || value.includes("rare")) return "💜";
  if (value.includes("crystal")) return "💎";
  if (value.includes("essence")) return "🔮";
  if (value.includes("gold")) return "🪙";

  return "✨";
}