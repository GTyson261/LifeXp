

export default function ShopPanel({ items = [], onBuyItem }) {
  return (
    <div className="panel shop-panel premium-shop-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h3>Cosmetic Shop</h3>
          <p>Buy themes, frames, auras, and outfits for your LifeXP avatar.</p>
        </div>

        <div className="shop-count-chip">
          🛒 {items.length} items
        </div>
      </div>

      <div className="shop-grid premium-shop-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <ShopItemCard key={item.id} item={item} onBuyItem={onBuyItem} />
          ))
        ) : (
          <div className="empty-state-card">
            <strong>No shop items loaded.</strong>
            <p>Defeat bosses and level up to unlock new cosmetics.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShopItemCard({ item, onBuyItem }) {
  const rarity = itemRarity(item);

  return (
    <div className={`shop-card premium-shop-card rarity-${rarity.toLowerCase()}`}>
      <div className="shop-item-icon">
        {itemIcon(item.type)}
      </div>

      <div className="shop-item-content">
        <div className="shop-item-title-row">
          <strong>{item.name}</strong>
          <span className="shop-item-type">{item.type}</span>
        </div>

        <div className="shop-rarity-row">
          <span>{rarity}</span>
          <small>{item.currency}</small>
        </div>

        <p>{item.description}</p>

        <div className="shop-price-row">
          <span>Cost</span>
          <strong>
            {item.cost} {item.currency}
          </strong>
        </div>
      </div>

      <button onClick={() => onBuyItem(item.id)} type="button">
        Buy
      </button>
    </div>
  );
}

function itemRarity(item = {}) {
  const cost = Number(item.cost) || 0;
  const currency = String(item.currency || "").toLowerCase();

  if (currency.includes("essence") || cost >= 250) return "Mythic";
  if (currency.includes("crystal") || cost >= 150) return "Epic";
  if (cost >= 75) return "Rare";

  return "Common";
}

function itemIcon(type = "") {
  const value = type.toLowerCase();

  if (value.includes("theme")) return "🌌";
  if (value.includes("frame")) return "🖼️";
  if (value.includes("aura")) return "✨";
  if (value.includes("outfit")) return "👕";

  return "🎁";
}
