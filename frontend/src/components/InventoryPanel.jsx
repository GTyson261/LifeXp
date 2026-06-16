

export default function InventoryPanel({ items = [], onEquipItem }) {
  const equippedCount = items.filter((item) => item.equipped).length;
  const slotCount = new Set(items.map((item) => slotLabel(item.type))).size;
  const rareCount = items.filter((item) => itemTier(item) !== "Common").length;

  return (
    <div className="panel inventory-panel premium-inventory-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Loadout</p>
          <h3>Inventory</h3>
          <p>{equippedCount} equipped • {items.length} owned</p>
        </div>

        <div className="inventory-count-chip">
          🎒 {items.length}
        </div>
      </div>

      <div className="inventory-summary-strip" aria-label="Inventory summary">
        <span>
          <small>Owned</small>
          <strong>{items.length}</strong>
        </span>
        <span>
          <small>Equipped</small>
          <strong>{equippedCount}</strong>
        </span>
        <span>
          <small>Slots</small>
          <strong>{slotCount}</strong>
        </span>
        <span>
          <small>Rare+</small>
          <strong>{rareCount}</strong>
        </span>
      </div>

      <div className="shop-grid premium-inventory-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <InventoryItemCard key={item.id} item={item} onEquipItem={onEquipItem} />
          ))
        ) : (
          <div className="empty-state-card">
            <strong>Your inventory is empty.</strong>
            <p>Buy cosmetics from the shop or earn loot from bosses.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryItemCard({ item, onEquipItem }) {
  const tier = itemTier(item);

  return (
    <div className={item.equipped ? `shop-card premium-inventory-card equipped tier-${tier.toLowerCase()}` : `shop-card premium-inventory-card tier-${tier.toLowerCase()}`}>
      <div className="inventory-item-icon">
        {itemIcon(item.type)}
      </div>

      <div className="inventory-item-content">
        <div className="shop-item-title-row">
          <strong>{item.name}</strong>
          <div className="inventory-badge-row">
            <span className="inventory-rarity-chip">{tier}</span>
            <span className={item.equipped ? "inventory-status equipped" : "inventory-status"}>
              {item.equipped ? "Equipped" : "Owned"}
            </span>
          </div>
        </div>

        <p>Type: {item.type}</p>
        <div className="inventory-slot-row">
          <span>{slotLabel(item.type)}</span>
          <small>{item.equipped ? "Active Loadout" : "Stored"}</small>
        </div>
        <div className="inventory-item-meter" aria-hidden="true">
          <b style={{ width: `${itemPower(tier, item.equipped)}%` }} />
        </div>
      </div>

      <button
        disabled={item.equipped}
        onClick={() => onEquipItem(item.id)}
        type="button"
      >
        {item.equipped ? "Equipped" : "Equip"}
      </button>
    </div>
  );
}

function itemTier(item = {}) {
  const value = `${item.name || ""} ${item.type || ""}`.toLowerCase();

  if (value.includes("legendary") || value.includes("victory") || value.includes("mythic")) return "Mythic";
  if (value.includes("shadow") || value.includes("terminal") || value.includes("rune") || value.includes("epic")) return "Epic";
  if (value.includes("neon") || value.includes("glitch") || value.includes("flame") || value.includes("rare")) return "Rare";

  return "Common";
}

function itemPower(tier = "Common", equipped = false) {
  const tierPower = {
    Common: 42,
    Rare: 64,
    Epic: 82,
    Mythic: 100
  };

  return Math.min(100, (tierPower[tier] || 42) + (equipped ? 8 : 0));
}

function slotLabel(type = "") {
  const value = type.toLowerCase();

  if (value.includes("theme")) return "World Skin";
  if (value.includes("frame")) return "Portrait Frame";
  if (value.includes("aura")) return "Aura Slot";
  if (value.includes("outfit")) return "Outfit Slot";

  return "Cosmetic Slot";
}

function itemIcon(type = "") {
  const value = type.toLowerCase();

  if (value.includes("theme")) return "🌌";
  if (value.includes("frame")) return "🖼️";
  if (value.includes("aura")) return "✨";
  if (value.includes("outfit")) return "👕";

  return "🎁";
}
