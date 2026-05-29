

export default function InventoryPanel({ items = [], onEquipItem }) {
  const equippedCount = items.filter((item) => item.equipped).length;

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
  return (
    <div className={item.equipped ? "shop-card premium-inventory-card equipped" : "shop-card premium-inventory-card"}>
      <div className="inventory-item-icon">
        {itemIcon(item.type)}
      </div>

      <div className="inventory-item-content">
        <div className="shop-item-title-row">
          <strong>{item.name}</strong>
          <span className={item.equipped ? "inventory-status equipped" : "inventory-status"}>
            {item.equipped ? "Equipped" : "Owned"}
          </span>
        </div>

        <p>Type: {item.type}</p>
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

function itemIcon(type = "") {
  const value = type.toLowerCase();

  if (value.includes("theme")) return "🌌";
  if (value.includes("frame")) return "🖼️";
  if (value.includes("aura")) return "✨";
  if (value.includes("outfit")) return "👕";

  return "🎁";
}