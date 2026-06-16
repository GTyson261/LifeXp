export default function EquipmentPanel({
  equippedTheme,
  equippedFrame,
  equippedAura,
  outfit
}) {
  const equippedItems = [
    {
      label: "Theme",
      value: equippedTheme || "Default Cyber Grid",
      icon: "🌌"
    },
    {
      label: "Frame",
      value: equippedFrame || "Starter Frame",
      icon: "🖼️"
    },
    {
      label: "Aura",
      value: equippedAura || "Starter Glow",
      icon: "✨"
    },
    {
      label: "Outfit",
      value: outfit || "Novice Jacket",
      icon: "👕"
    }
  ];
  const rareSignals = equippedItems.filter((item) => equipmentTier(item.value) !== "Standard").length;
  const gearScore = equippedItems.length * 25 + rareSignals * 15;
  const loadoutPower = Math.min(100, Math.round((gearScore / 160) * 100));
  const signatureSlot = equippedItems.find((item) => equipmentTier(item.value) !== "Standard") || equippedItems[0];

  return (
    <div className="panel equipment-panel premium-equipment-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Loadout</p>
          <h3>Equipped Cosmetics</h3>
          <p>Your active visual customization setup.</p>
        </div>

        <div className="equipment-chip">
          ⚔️ {equippedItems.length} equipped
        </div>
      </div>

      <div className="equipment-score-strip" aria-label="Equipment power summary">
        <span>
          <small>Gear Score</small>
          <strong>{gearScore}</strong>
        </span>
        <span>
          <small>Slots</small>
          <strong>{equippedItems.length}/4 Live</strong>
        </span>
        <span>
          <small>Signature</small>
          <strong>{signatureSlot.value}</strong>
        </span>
        <i aria-hidden="true">
          <b style={{ width: `${loadoutPower}%` }} />
        </i>
      </div>

      <div className="equipment-grid">
        {equippedItems.map((item) => (
          <div className="equipment-card" key={item.label}>
            <div className="equipment-icon">{item.icon}</div>

            <div>
              <div className="equipment-card-title">
                <span>{item.label}</span>
                <em>{equipmentTier(item.value)}</em>
              </div>
              <strong>{item.value}</strong>
              <small>{equipmentStatus(item.label)}</small>
              <div className="equipment-card-meter" aria-hidden="true">
                <b style={{ width: `${equipmentPower(item.value)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function equipmentTier(value = "") {
  const normalized = value.toLowerCase();

  if (normalized.includes("legendary") || normalized.includes("victory")) return "Mythic";
  if (normalized.includes("shadow") || normalized.includes("terminal") || normalized.includes("rune")) return "Epic";
  if (normalized.includes("neon") || normalized.includes("glitch") || normalized.includes("flame")) return "Rare";

  return "Standard";
}

function equipmentPower(value = "") {
  const tier = equipmentTier(value);

  if (tier === "Mythic") return 100;
  if (tier === "Epic") return 82;
  if (tier === "Rare") return 66;

  return 48;
}

function equipmentStatus(label = "") {
  if (label === "Theme") return "World render";
  if (label === "Frame") return "Profile border";
  if (label === "Aura") return "Combat glow";
  if (label === "Outfit") return "Hero model";

  return "Equipped";
}
