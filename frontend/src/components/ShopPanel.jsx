

export default function ShopPanel({ items = [], inventory = [], balances = {}, onBuyItem }) {
  const ownedItems = new Set(inventory.map((item) => `${item.type}:${item.name}`));
  const availableItems = items.filter((item) => !ownedItems.has(`${item.type}:${item.name}`)).length;

  return (
    <div className="panel shop-panel premium-shop-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h3>Cosmetic Shop</h3>
          <p>Buy themes, frames, auras, and outfits for your LifeXP avatar.</p>
        </div>

        <div className="shop-count-chip">
          🛒 {availableItems} available
        </div>
      </div>

      <div className="shop-grid premium-shop-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              owned={ownedItems.has(`${item.type}:${item.name}`)}
              balance={Number(balances[item.currency]) || 0}
              onBuyItem={onBuyItem}
            />
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

function ShopItemCard({ item, owned, balance, onBuyItem }) {
  const rarity = itemRarity(item);
  const canAfford = balance >= item.cost;
  const shortfall = Math.max(0, item.cost - balance);

  return (
    <div className={[
      "shop-card",
      "premium-shop-card",
      `rarity-${rarity.toLowerCase()}`,
      owned ? "is-owned" : "",
      !owned && !canAfford ? "is-unaffordable" : ""
    ].filter(Boolean).join(" ")}>
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

      <button disabled={owned || !canAfford} onClick={() => onBuyItem(item.id)} type="button">
        {owned ? "Owned" : canAfford ? "Buy" : `Need ${shortfall} more`}
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
