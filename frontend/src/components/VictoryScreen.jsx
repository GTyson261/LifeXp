import { useEffect, useRef } from "react";

export default function VictoryScreen({ reward, onDismiss }) {
  const continueButtonRef = useRef(null);

  useEffect(() => {
    if (!reward) return;
    const previousFocus = document.activeElement;
    continueButtonRef.current?.focus();
    return () => previousFocus?.focus?.();
  }, [reward]);

  if (!reward) return null;

  const loot = reward.loot?.length ? reward.loot : ["Victory logged"];
  const score = (reward.xp || 0) + (reward.gold || 0) + (reward.crystals || 0) * 12 + (reward.essence || 0) * 18;
  const grade = score >= 220 ? "S" : score >= 140 ? "A" : score >= 70 ? "B" : "C";

  return (
    <div
      className="victory-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      aria-describedby="victory-description"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onDismiss();
        } else if (event.key === "Tab") {
          event.preventDefault();
          continueButtonRef.current?.focus();
        }
      }}
    >
      <div className="victory-card">
        <div className="victory-title-row">
          <div>
            <p className="eyebrow">Boss Defeated</p>
            <h2 id="victory-title">{reward.bossName}</h2>
            <p id="victory-description">Your momentum cracked the encounter open.</p>
          </div>
          <div className="victory-grade" aria-label={`Victory grade ${grade}`}>
            <small>Grade</small>
            <strong>{grade}</strong>
          </div>
        </div>

        <div className="victory-reward-strip">
          <span><small>XP</small><strong>+{reward.xp || 0}</strong></span>
          <span><small>Gold</small><strong>+{reward.gold || 0}</strong></span>
          <span><small>Crystals</small><strong>+{reward.crystals || 0}</strong></span>
          <span><small>Essence</small><strong>+{reward.essence || 0}</strong></span>
        </div>

        <div className="victory-loot-grid">
          {loot.slice(0, 4).map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`victory-loot-card loot-tier-${getLootTier(item)}`}
              style={{ "--loot-index": index }}
            >
              <small>{getLootTier(item)}</small>
              <strong>{item}</strong>
            </span>
          ))}
        </div>

        <button ref={continueButtonRef} type="button" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}

function getLootTier(item = "") {
  const normalized = item.toLowerCase();

  if (normalized.includes("legend") || normalized.includes("mythic") || normalized.includes("frame")) {
    return "legendary";
  }

  if (normalized.includes("crystal") || normalized.includes("essence") || normalized.includes("epic")) {
    return "epic";
  }

  if (normalized.includes("gold") || normalized.includes("rare")) {
    return "rare";
  }

  return "common";
}
