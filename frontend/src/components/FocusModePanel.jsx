export default function FocusModePanel({
  state,
  classMeta = {},
  onQuickAction,
  onOpenQuests
}) {
  const activeClass = state?.activeClass || "NOVICE";
  const meta = classMeta[activeClass] || classMeta.NOVICE || { icon: "◇", label: activeClass };
  const quest = (state?.dailyQuests || []).find((item) => !item.claimed && !item.completed)
    || (state?.dailyQuests || []).find((item) => item.completed && !item.claimed);
  const boss = state?.currentBoss;
  const hpPercent = boss?.maxHp
    ? Math.max(0, Math.round((boss.hp / boss.maxHp) * 100))
    : 0;

  return (
    <div className="panel focus-mode-panel">
      <div className="focus-mode-header">
        <span>{meta.icon}</span>
        <div>
          <p className="eyebrow">Focus Mode</p>
          <h3>{meta.label} Run</h3>
        </div>
      </div>

      <div className="focus-mode-target">
        <small>Current Quest</small>
        <strong>{quest?.name || "Pick one real action"}</strong>
        <p>{quest?.description || "Log a short action to keep your run moving."}</p>
      </div>

      <div className="focus-boss-strip">
        <span>{boss?.name || "No Boss"}</span>
        <div><i style={{ width: `${hpPercent}%` }} /></div>
        <small>{hpPercent}% HP</small>
      </div>

      <div className="focus-actions">
        <button type="button" onClick={() => onQuickAction?.(quest?.actionType || "focus")}>
          Log 10-Min Action
        </button>
        <button type="button" onClick={onOpenQuests}>
          View Quests
        </button>
      </div>
    </div>
  );
}
