import { useEffect, useState } from "react";

export default function EconomyPanel({
  gold = 0,
  crystals = 0,
  essence = 0,
  energy = 0,
  lastRestTimestamp = 0,
  onRest
}) {
  const [now, setNow] = useState(Date.now);
  const restStatus = getRestStatus(lastRestTimestamp, now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(interval);
  }, []);
  const energyPercent = Math.max(0, Math.min(100, Number(energy) || 0));
  const bankScore = gold + crystals * 12 + essence * 20;
  const walletTier = bankScore >= 1000 ? "Vaulted" : bankScore >= 500 ? "Loaded" : bankScore >= 150 ? "Stocked" : "Starting";
  const spendReadiness = Math.min(100, Math.round((bankScore / 1000) * 100));
  const energyMode = energyPercent >= 80 ? "Overcharged" : energyPercent >= 45 ? "Stable" : energyPercent > 0 ? "Low Power" : "Empty";
  const dominantCurrency = getDominantCurrency({ gold, crystals, essence });
  const shopPips = [25, 50, 75, 100];
  const restAction = energy >= 100 ? "Capped" : restStatus.ready ? "Ready" : "Cooling";
  const treasuryState = spendReadiness >= 75 ? "Market Ready" : energyPercent < 25 ? "Recharge Needed" : "Resource Run";

  const currencies = [
    { label: "Gold", value: gold, icon: "🪙", detail: "Spend on shop cosmetics", type: "gold" },
    { label: "Crystals", value: crystals, icon: "💎", detail: "Premium upgrade currency", type: "crystal" },
    { label: "Essence", value: essence, icon: "🔮", detail: "Earned from deeper progress", type: "essence" },
    { label: "Energy", value: `${energy}%`, icon: "⚡", detail: restStatus.ready ? "Rest is ready" : restStatus.label, type: "energy" }
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

      <div className="economy-reactor-console" aria-label="Economy reactor console">
        <div>
          <small>Dominant Resource</small>
          <strong>{dominantCurrency}</strong>
          <span>{walletTier} wallet</span>
        </div>
        <div>
          <small>Energy Mode</small>
          <strong>{energyMode}</strong>
          <span>{restAction} rest node</span>
        </div>
        <div className="economy-shop-signal">
          <small>Shop Signal</small>
          <strong>{spendReadiness}%</strong>
          <span>
            {shopPips.map((pip) => (
              <i key={pip} className={spendReadiness >= pip ? "active" : ""} />
            ))}
          </span>
        </div>
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

      <div className="economy-treasury-card" aria-label="Economy treasury status">
        <div className="economy-treasury-orb">
          <span>{Math.max(1, Math.round(bankScore / 100))}</span>
        </div>
        <div>
          <small>Treasury State</small>
          <strong>{treasuryState}</strong>
          <span>{dominantCurrency} leads the wallet · {restAction} rest node</span>
        </div>
        <em>{walletTier}</em>
      </div>

      <div className="currency-grid premium-currency-grid">
        {currencies.map((currency) => (
          <div className={`currency premium-currency-card currency-${currency.type}`} key={currency.label}>
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

function getDominantCurrency({ gold, crystals, essence }) {
  const resources = [
    ["Gold", Number(gold) || 0],
    ["Crystals", (Number(crystals) || 0) * 12],
    ["Essence", (Number(essence) || 0) * 20]
  ];
  const [label, score] = resources.sort((a, b) => b[1] - a[1])[0];

  return score > 0 ? label : "None";
}

function getRestStatus(lastRestTimestamp, now = Date.now()) {
  if (!lastRestTimestamp || Number(lastRestTimestamp) <= 0) {
    return { ready: true, label: "Rest Ready" };
  }

  const cooldown = 1000 * 60 * 30;
  const timeLeft = Math.max(0, Number(lastRestTimestamp) + cooldown - now);

  if (timeLeft <= 0) {
    return { ready: true, label: "Rest Ready" };
  }

  const minutes = Math.max(1, Math.ceil(timeLeft / (1000 * 60)));
  return { ready: false, label: `Rest in ${minutes}m` };
}
