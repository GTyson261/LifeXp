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
  const questsDone = state?.dailyQuests?.filter((item) => item.completed).length || 0;
  const totalQuests = state?.dailyQuests?.length || 0;
  const energy = Math.max(0, Math.min(100, state?.energy ?? 100));
  const questPercent = totalQuests === 0 ? 0 : Math.round((questsDone / totalQuests) * 100);
  const runReadiness = Math.round((energy + questPercent + (100 - hpPercent)) / 3);

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
        <div className="focus-target-meta">
          <span>{quest?.actionType || "focus"}</span>
          <span>{quest?.completed ? "Ready to claim" : "In progress"}</span>
        </div>
      </div>

      <div className="focus-readiness-card">
        <div>
          <small>Run Readiness</small>
          <strong>{runReadiness}%</strong>
        </div>
        <i aria-label={`Run readiness ${runReadiness}%`}>
          <b style={{ width: `${runReadiness}%` }} />
        </i>
      </div>

      <div className="focus-boss-strip">
        <span>{boss?.name || "No Boss"}</span>
        <div><i style={{ width: `${hpPercent}%` }} /></div>
        <small>{hpPercent}% HP</small>
      </div>

      <div className="focus-run-stats">
        <span>
          <small>Energy</small>
          <strong>{energy}%</strong>
        </span>
        <span>
          <small>Quests</small>
          <strong>{questsDone}/{totalQuests}</strong>
        </span>
        <span>
          <small>Last XP</small>
          <strong>+{state?.lastXpGain || 0}</strong>
        </span>
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
