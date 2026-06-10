export default function BossEntrance({ boss, classMeta = {}, activeClass = "NOVICE" }) {
  if (!boss) return null;

  const meta = classMeta[activeClass] || classMeta.NOVICE || { icon: "◇", label: activeClass };

  return (
    <div className="boss-entrance" role="status">
      <div className="boss-entrance-card">
        <span>{meta.icon}</span>
        <small>{meta.label} Encounter</small>
        <strong>{boss.name}</strong>
        <em>{boss.element || "Shadow"} · Level {boss.level || 1}</em>
      </div>
    </div>
  );
}
