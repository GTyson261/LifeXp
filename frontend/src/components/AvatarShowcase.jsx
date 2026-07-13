const CLASS_AVATARS = {
  CODER: {
    hairStyle: "Short",
    bodyType: "Lean",
    outfit: "Coder Hoodie",
    skinTone: "#8d5524",
    hairColor: "#0f172a"
  },
  BOOKWORM: {
    hairStyle: "Short",
    bodyType: "Average",
    outfit: "Scholar Cloak",
    skinTone: "#c68642",
    hairColor: "#4c1d95"
  },
  SPORT_MASTER: {
    hairStyle: "Fade",
    bodyType: "Strong",
    outfit: "Arena Gear",
    skinTone: "#a0522d",
    hairColor: "#7c2d12"
  },
  GAMER: {
    hairStyle: "Curly",
    bodyType: "Athletic",
    outfit: "Arcade Jacket",
    skinTone: "#f1c27d",
    hairColor: "#14532d"
  },
  EXPLORER: {
    hairStyle: "Short",
    bodyType: "Average",
    outfit: "Explorer Coat",
    skinTone: "#6b3f28",
    hairColor: "#713f12"
  },
  ZEN: {
    hairStyle: "Short",
    bodyType: "Lean",
    outfit: "Zen Robe",
    skinTone: "#d1a17a",
    hairColor: "#e5e7eb"
  },
  MUSICIAN: {
    hairStyle: "Afro",
    bodyType: "Average",
    outfit: "Rhythm Jacket",
    skinTone: "#7a4a2a",
    hairColor: "#831843"
  },
  CHEF: {
    hairStyle: "Curly",
    bodyType: "Athletic",
    outfit: "Battle Apron",
    skinTone: "#b46b46",
    hairColor: "#7f1d1d"
  }
};

const SAMPLE_LINEUP = [
  { hairStyle: "Fade", bodyType: "Lean", outfit: "Coder Hoodie", skinTone: "#7c4a2f", hairColor: "#020617", className: "CODER" },
  { hairStyle: "Long", bodyType: "Average", outfit: "Scholar Cloak", skinTone: "#e0ac69", hairColor: "#7c3aed", className: "BOOKWORM" },
  { hairStyle: "Afro", bodyType: "Strong", outfit: "Arena Gear", skinTone: "#4b2a1f", hairColor: "#a16207", className: "SPORT_MASTER" },
  { hairStyle: "Short", bodyType: "Athletic", outfit: "Arcade Jacket", skinTone: "#c68642", hairColor: "#22c55e", className: "GAMER" },
  { hairStyle: "Locs", bodyType: "Average", outfit: "Explorer Coat", skinTone: "#5c3526", hairColor: "#d6a35d", className: "EXPLORER" },
  { hairStyle: "Curly", bodyType: "Lean", outfit: "Zen Robe", skinTone: "#f1c27d", hairColor: "#e5e7eb", className: "ZEN" },
  { hairStyle: "Long", bodyType: "Average", outfit: "Rhythm Jacket", skinTone: "#8d5524", hairColor: "#ec4899", className: "MUSICIAN" },
  { hairStyle: "Curly", bodyType: "Athletic", outfit: "Battle Apron", skinTone: "#b06a45", hairColor: "#7f1d1d", className: "CHEF" }
];

const FEATURE_LABELS = [
  "Level up in real life",
  "Complete quests",
  "Build habits",
  "Defeat bosses",
  "Unlock your potential"
];

export default function AvatarShowcase({
  classes = [],
  classMeta = {},
  activeClass,
  onClassSelect
}) {
  const showcaseClasses = classes.filter((className) => className !== "NOVICE");

  return (
    <div className="panel avatar-showcase-panel">
      <aside className="avatar-showcase-rail">
        <h2>LifeXP</h2>
        <p className="eyebrow">Real-life RPG simulator</p>
        <strong>Choose your path. Become legendary.</strong>
        <small>Your journey. Your story. Your world.</small>

        <div className="showcase-season-strip">
          <span>
            <small>Classes</small>
            <strong>{showcaseClasses.length}</strong>
          </span>
          <span>
            <small>Active</small>
            <strong>{classMeta[activeClass]?.label || "None"}</strong>
          </span>
        </div>

        <ul>
          {FEATURE_LABELS.map((label) => (
            <li key={label}>
              <span>+</span>
              {label}
            </li>
          ))}
        </ul>
      </aside>

      <section className="avatar-class-showcase" aria-label="Class archetypes">
        {showcaseClasses.map((className) => {
          const meta = classMeta[className] || {};
          const avatar = CLASS_AVATARS[className] || CLASS_AVATARS.CODER;
          const isActive = activeClass === className;

          return (
            <button
              key={className}
              type="button"
              className={isActive ? "showcase-class-card active" : "showcase-class-card"}
              style={{ "--showcase-color": meta.color || "#22d3ee" }}
              disabled={isActive}
              onClick={() => onClassSelect(className)}
            >
              <span className="showcase-class-status">{isActive ? "Selected" : "Path"}</span>
              <span className="showcase-class-icon">{meta.icon || "+"}</span>
              <strong>{meta.label || className}</strong>
              <small>{meta.archetype || meta.world || "Hero"}</small>
              <div className="showcase-class-footer">
                <span>{meta.world || "Unknown World"}</span>
              </div>
              <div className="showcase-avatar-window">
                <AvatarPortrait avatar={avatar} color={meta.color || "#22d3ee"} />
              </div>
            </button>
          );
        })}
      </section>

      <section className="avatar-example-strip" aria-label="Avatar examples">
        <div className="avatar-example-copy">
          <p className="eyebrow">Diverse avatar examples</p>
          <strong>Millions of ways to be you.</strong>
        </div>

        <div className="avatar-example-lineup">
          {SAMPLE_LINEUP.map((avatar, index) => (
            <div
              className="avatar-example-card"
              style={{ "--showcase-color": classMeta[avatar.className]?.color || "#22d3ee" }}
              key={`${avatar.className}-${index}`}
            >
              <AvatarPortrait avatar={avatar} color={classMeta[avatar.className]?.color || "#22d3ee"} compact />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AvatarPortrait({ avatar, color, compact = false }) {
  return (
    <div
      className={compact ? "showcase-portrait compact" : "showcase-portrait"}
      style={{
        "--portrait-skin": avatar.skinTone,
        "--portrait-color": color,
        "--portrait-eye": color,
        "--portrait-hair": avatar.hairColor || "#020617"
      }}
    >
      <div className={`portrait-hair hair-${avatar.hairStyle.toLowerCase()}`} />
      <div className="portrait-head">
        <span className="portrait-eye left" />
        <span className="portrait-eye right" />
        <span className="portrait-mouth" />
      </div>
      <div className={`portrait-outfit outfit-${avatar.outfit.toLowerCase().replaceAll(" ", "-")}`}>
        <span className="portrait-trim" />
      </div>
    </div>
  );
}
