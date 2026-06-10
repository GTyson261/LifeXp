export default function RewardBurst({ reward }) {
  if (!reward) return null;

  const particles = [
    { label: "XP", value: reward.xp || 0 },
    { label: "Gold", value: reward.gold || 0 },
    { label: "Crystals", value: reward.crystals || 0 },
    { label: "Essence", value: reward.essence || 0 }
  ].filter((item) => item.value > 0);

  return (
    <div className="reward-burst" aria-live="polite">
      {particles.map((item, index) => (
        <span key={item.label} style={{ "--reward-index": index }}>
          +{item.value} {item.label}
        </span>
      ))}
    </div>
  );
}
