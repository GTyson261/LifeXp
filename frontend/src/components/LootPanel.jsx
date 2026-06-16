

export default function LootPanel({ bossesDefeated = 0, lastLootDrops = [], lootHistory = [] }) {
  const rareDrops = lootHistory.filter((loot) => rarityClass(loot) !== "loot-common").length;
  const vaultScore = lootHistory.reduce((sum, loot) => sum + rarityValue(loot), 0);
  const dropStreak = Math.min(6, lastLootDrops.length || Math.min(lootHistory.length, bossesDefeated));
  const rarePercent = lootHistory.length === 0 ? 0 : Math.round((rareDrops / lootHistory.length) * 100);

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

      <div className="loot-command-strip">
        <span>
          <small>Boss Clears</small>
          <strong>{bossesDefeated}</strong>
        </span>
        <span>
          <small>Rare Finds</small>
          <strong>{rareDrops}</strong>
        </span>
        <span>
          <small>Vault Size</small>
          <strong>{lootHistory.length}</strong>
        </span>
      </div>

      <div className="loot-vault-card" aria-label="Loot vault status">
        <div>
          <small>Vault Score</small>
          <strong>{vaultScore}</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${rarePercent}%` }} />
        </i>
        <span>{rarePercent}% rare+ history · {dropStreak} drop streak</span>
      </div>

      {lastLootDrops.length > 0 ? (
        <div className="loot-burst premium-loot-burst">
          {lastLootDrops.map((loot, index) => (
            <div className={`loot-chip ${rarityClass(loot)}`} key={`${loot}-${index}`}>
              <span>{rarityIcon(loot)}</span>
              <strong>{loot}</strong>
              <small>{rarityLabel(loot)}</small>
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
              <div>
                <strong>{loot}</strong>
                <small>{rarityLabel(loot)}</small>
              </div>
            </div>
          ))
        ) : (
          <p>Your loot history is empty.</p>
        )}
      </div>
    </div>
  );
}

function rarityValue(loot = "") {
  const label = rarityLabel(loot);

  if (label === "Legendary") return 120;
  if (label === "Epic") return 75;
  if (label === "Magic") return 45;

  return 20;
}

function rarityLabel(loot = "") {
  const value = loot.toLowerCase();

  if (value.includes("legendary") || value.includes("mythic")) return "Legendary";
  if (value.includes("epic") || value.includes("rare")) return "Epic";
  if (value.includes("crystal") || value.includes("essence")) return "Magic";

  return "Common";
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
