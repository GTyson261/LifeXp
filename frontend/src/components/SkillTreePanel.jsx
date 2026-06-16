

export default function SkillTreePanel({ skills = [], skillPoints = 0, onUnlockSkill }) {
  const unlockedCount = skills.filter((skill) => skill.unlocked).length;
  const unlockPercent = skills.length === 0 ? 0 : Math.round((unlockedCount / skills.length) * 100);
  const skillNamesById = Object.fromEntries(skills.map((skill) => [skill.id, skill.name]));
  const unlockedById = Object.fromEntries(skills.map((skill) => [skill.id, skill.unlocked]));
  const readySkills = skills.filter((skill) => !skill.unlocked && skillPoints >= Math.max(1, skill.cost || 1) && (!skill.prerequisiteId || unlockedById[skill.prerequisiteId]));
  const nextSkill = readySkills[0] || skills.find((skill) => !skill.unlocked);
  const branchCount = new Set(skills.map((skill) => skill.category || "Core")).size;

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

      <div className="skill-planner-strip" aria-label="Skill upgrade planner">
        <div className="skill-planner-card primary">
          <small>Next Upgrade</small>
          <strong>{nextSkill?.name || "Tree Complete"}</strong>
          <span>{nextSkill ? `${Math.max(1, nextSkill.cost || 1)} SP cost` : "All skills online"}</span>
        </div>
        <div className="skill-planner-card">
          <small>Branches</small>
          <strong>{branchCount}</strong>
          <span>{readySkills.length} ready unlock{readySkills.length === 1 ? "" : "s"}</span>
        </div>
        <div className="skill-planner-card">
          <small>Tree Sync</small>
          <strong>{unlockPercent}%</strong>
          <span>{unlockedCount} nodes powered</span>
        </div>
      </div>

      <div className="skill-command-strip">
        <span>
          <small>Unlocked</small>
          <strong>{unlockedCount}/{skills.length}</strong>
        </span>
        <span>
          <small>Points</small>
          <strong>{skillPoints}</strong>
        </span>
        <span>
          <small>Ready</small>
          <strong>{skills.filter((skill) => !skill.unlocked && skillPoints >= Math.max(1, skill.cost || 1)).length}</strong>
        </span>
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
  const readiness = skill.unlocked ? 100 : Math.min(100, Math.round((skillPoints / cost) * 100));
  const branchRole = skill.unlocked ? "Active Node" : canUnlock ? "Ready Node" : dependencyUnlocked ? "Charging" : "Linked Lock";

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
        <div className="skill-node-meta">
          <span>{branchRole}</span>
          <span>{cost} SP</span>
        </div>
        <span>{skill.description}</span>
        {skill.prerequisiteId && (
          <small>Requires {prerequisiteName || skill.prerequisiteId}</small>
        )}
        <div className="skill-readiness-meter" aria-label={`${skill.name} readiness ${readiness}%`}>
          <i style={{ width: `${readiness}%` }} />
        </div>
      </div>

      <small>{skill.unlocked ? "Unlocked" : canUnlock ? `Unlock (${cost} SP)` : dependencyUnlocked ? `Need ${cost} SP` : "Prereq Locked"}</small>
    </button>
  );
}
