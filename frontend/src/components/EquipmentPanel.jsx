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

      <div className="equipment-grid">
        {equippedItems.map((item) => (
          <div className="equipment-card" key={item.label}>
            <div className="equipment-icon">{item.icon}</div>

            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
