export default function EconomyPanel({
  gold = 0,
  crystals = 0,
  essence = 0,
  energy = 0,
  lastRestTimestamp = 0,
  onRest
}) {
  const restStatus = getRestStatus(lastRestTimestamp);

  const currencies = [
    { label: "Gold", value: gold, icon: "🪙", detail: "Spend on shop cosmetics" },
    { label: "Crystals", value: crystals, icon: "💎", detail: "Premium upgrade currency" },
    { label: "Essence", value: essence, icon: "🔮", detail: "Earned from deeper progress" },
    { label: "Energy", value: `${energy}%`, icon: "⚡", detail: restStatus.ready ? "Rest is ready" : restStatus.label }
  ];

  return (
    <div className="panel currency-panel premium-economy-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Wallet</p>
          <h3>Economy</h3>
          <p>Track your currencies, energy, and reward resources.</p>
        </div>

        <button onClick={onRest} disabled={energy >= 100 || !restStatus.ready} type="button">
          {energy >= 100 ? "Energy Full" : restStatus.ready ? "Rest +25 Energy" : restStatus.label}
        </button>
      </div>

      <div className="currency-grid premium-currency-grid">
        {currencies.map((currency) => (
          <div className="currency premium-currency-card" key={currency.label}>
            <div className="currency-icon">{currency.icon}</div>
            <div>
              <span>{currency.label}</span>
              <strong>{currency.value}</strong>
              <p>{currency.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRestStatus(lastRestTimestamp) {
  if (!lastRestTimestamp || Number(lastRestTimestamp) <= 0) {
    return { ready: true, label: "Rest Ready" };
  }

  const cooldown = 1000 * 60 * 30;
  const timeLeft = Math.max(0, Number(lastRestTimestamp) + cooldown - Date.now());

  if (timeLeft <= 0) {
    return { ready: true, label: "Rest Ready" };
  }

  const minutes = Math.max(1, Math.ceil(timeLeft / (1000 * 60)));
  return { ready: false, label: `Rest in ${minutes}m` };
}