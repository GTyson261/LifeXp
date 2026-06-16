export default function EconomyPanel({
  gold = 0,
  crystals = 0,
  essence = 0,
  energy = 0,
  lastRestTimestamp = 0,
  onRest
}) {
  const restStatus = getRestStatus(lastRestTimestamp);
  const energyPercent = Math.max(0, Math.min(100, Number(energy) || 0));
  const bankScore = gold + crystals * 12 + essence * 20;
  const walletTier = bankScore >= 1000 ? "Vaulted" : bankScore >= 500 ? "Loaded" : bankScore >= 150 ? "Stocked" : "Starting";
  const spendReadiness = Math.min(100, Math.round((bankScore / 1000) * 100));

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

      <div className="economy-command-strip">
        <span>
          <small>Bank Score</small>
          <strong>{bankScore}</strong>
        </span>
        <span>
          <small>Rest Node</small>
          <strong>{energy >= 100 ? "Full" : restStatus.ready ? "Ready" : "Cooling"}</strong>
        </span>
        <span>
          <small>Energy Core</small>
          <strong>{energyPercent}%</strong>
          <i><b style={{ width: `${energyPercent}%` }} /></i>
        </span>
      </div>

      <div className="economy-vault-card" aria-label="Economy vault status">
        <div>
          <small>Wallet Tier</small>
          <strong>{walletTier}</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${spendReadiness}%` }} />
        </i>
        <span>{spendReadiness}% shop readiness · {energyPercent}% energy</span>
      </div>

      <div className="currency-grid premium-currency-grid">
        {currencies.map((currency) => (
          <div className="currency premium-currency-card" key={currency.label}>
            <div className="currency-icon">{currency.icon}</div>
            <div>
              <span>{currency.label}</span>
              <strong>{currency.value}</strong>
              <p>{currency.detail}</p>
              {currency.label === "Energy" && (
                <div className="currency-energy-meter" aria-label={`Energy ${energyPercent}%`}>
                  <i style={{ width: `${energyPercent}%` }} />
                </div>
              )}
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
