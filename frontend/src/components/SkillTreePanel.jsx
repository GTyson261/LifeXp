

export default function SkillTreePanel({ skills = [], skillPoints = 0, onUnlockSkill }) {
  const unlockedCount = skills.filter((skill) => skill.unlocked).length;
  const unlockPercent = skills.length === 0 ? 0 : Math.round((unlockedCount / skills.length) * 100);
  const skillNamesById = Object.fromEntries(skills.map((skill) => [skill.id, skill.name]));
  const unlockedById = Object.fromEntries(skills.map((skill) => [skill.id, skill.unlocked]));

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
              skillNamesById={skillNamesById}
              unlockedById={unlockedById}
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

function SkillCard({ skill, skillNamesById, unlockedById, skillPoints, onUnlockSkill }) {
  const cost = Math.max(1, skill.cost || 1);
  const prerequisiteName = skill.prerequisiteId ? skillNamesById[skill.prerequisiteId] : "";
  const dependencyUnlocked = !skill.prerequisiteId || Boolean(unlockedById[skill.prerequisiteId]);
  const canUnlock = !skill.unlocked && skillPoints >= cost && dependencyUnlocked;

  return (
    <button
      className={skill.unlocked ? "skill-card unlocked" : canUnlock ? "skill-card unlock-ready" : "skill-card"}
      disabled={!canUnlock}
      onClick={() => onUnlockSkill(skill.id)}
      type="button"
    >
      <div className="skill-icon">
        {skill.unlocked ? "✨" : "🔒"}
      </div>

      <div className="skill-card-content">
        <div className="skill-card-title-row">
          <strong>{skill.name}</strong>
          <span>{skill.category || "Core"} T{skill.tier || 1}</span>
        </div>
        <span>{skill.description}</span>
        {skill.prerequisiteId && (
          <small>Requires {prerequisiteName || skill.prerequisiteId}</small>
        )}
      </div>

      <small>{skill.unlocked ? "Unlocked" : canUnlock ? `Unlock (${cost} SP)` : dependencyUnlocked ? `Need ${cost} SP` : "Prereq Locked"}</small>
    </button>
  );
}
