

export default function SkillTreePanel({ skills = [], skillPoints = 0, onUnlockSkill }) {
  const unlockedCount = skills.filter((skill) => skill.unlocked).length;
  const unlockPercent = skills.length === 0 ? 0 : Math.round((unlockedCount / skills.length) * 100);

  return (
    <div className="panel skill-panel premium-skill-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Progression</p>
          <h3>Skill Tree</h3>
          <p>{unlockedCount} / {skills.length} unlocked</p>
        </div>

        <div className="skill-points-chip">
          ⭐ {skillPoints} SP
        </div>
      </div>

      <div className="skill-progress-track">
        <div style={{ width: `${unlockPercent}%` }} />
      </div>

      <div className="skill-grid premium-skill-grid">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              skillPoints={skillPoints}
              onUnlockSkill={onUnlockSkill}
            />
          ))
        ) : (
          <div className="empty-state-card">
            <strong>No skills loaded.</strong>
            <p>Level up to reveal skill upgrades.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillCard({ skill, skillPoints, onUnlockSkill }) {
  const canUnlock = !skill.unlocked && skillPoints > 0;

  return (
    <button
      className={skill.unlocked ? "skill-card unlocked" : "skill-card"}
      disabled={!canUnlock}
      onClick={() => onUnlockSkill(skill.id)}
      type="button"
    >
      <div className="skill-icon">
        {skill.unlocked ? "✨" : "🔒"}
      </div>

      <div className="skill-card-content">
        <strong>{skill.name}</strong>
        <span>{skill.description}</span>
      </div>

      <small>{skill.unlocked ? "Unlocked" : canUnlock ? "Unlock" : "Need SP"}</small>
    </button>
  );
}