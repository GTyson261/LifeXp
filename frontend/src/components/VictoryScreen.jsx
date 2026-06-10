export default function VictoryScreen({ reward, onDismiss }) {
  if (!reward) return null;

  const loot = reward.loot?.length ? reward.loot : ["Victory logged"];

  return (
    <div className="victory-screen" role="dialog" aria-modal="true">
      <div className="victory-card">
        <p className="eyebrow">Boss Defeated</p>
        <h2>{reward.bossName}</h2>
        <p>Your momentum cracked the encounter open.</p>

        <div className="victory-loot-grid">
          {loot.slice(0, 4).map((item, index) => (
            <span key={`${item}-${index}`} style={{ "--loot-index": index }}>
              {item}
            </span>
          ))}
        </div>

        <button type="button" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}
