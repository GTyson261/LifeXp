export default function BossEntrance({ boss, classMeta = {}, activeClass = "NOVICE" }) {
  if (!boss) return null;

  const meta = classMeta[activeClass] || classMeta.NOVICE || { icon: "◇", label: activeClass };
  const threat = Math.max(1, Math.min(10, Math.ceil((boss.level || 1) / 2)));

  return (
    <div className="boss-entrance" role="status">
      <div className="boss-entrance-card">
        <div className="boss-entrance-sigil">
          <span>{meta.icon}</span>
        </div>
        <div className="boss-entrance-copy">
          <small>{meta.label} Encounter</small>
          <strong>{boss.name}</strong>
          <em>{boss.element || "Shadow"} · Level {boss.level || 1}</em>
        </div>
        <div className="boss-threat-strip">
          <span>Threat</span>
          <div aria-label={`Threat ${threat} of 10`}>
            <i style={{ width: `${threat * 10}%` }} />
          </div>
          <strong>{threat}/10</strong>
        </div>
      </div>
    </div>
  );
}
