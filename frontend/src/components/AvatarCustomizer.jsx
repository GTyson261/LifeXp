const BODY_TYPES = ["Lean", "Average", "Athletic", "Strong"];

const HAIR_STYLES = [
  "Fade",
  "Curly",
  "Locs",
  "Afro",
  "Short",
  "Long"
];

const OUTFITS = [
  "Novice Jacket",
  "Coder Hoodie",
  "Scholar Cloak",
  "Arena Gear",
  "Arcade Jacket",
  "Explorer Coat",
  "Zen Robe",
  "Rhythm Jacket",
  "Battle Apron"
];

export default function AvatarCustomizer({
  avatarDraft,
  setAvatarDraft,
  onSave
}) {
  function updateAvatarField(field, value) {
    setAvatarDraft({
      ...avatarDraft,
      [field]: value
    });
  }

  const selectedBodyType =
    avatarDraft?.bodyType || "Average";

  const selectedBodyIndex = Math.max(
    0,
    BODY_TYPES.indexOf(selectedBodyType)
  );

  return (
    <div className="panel avatar-customizer premium-customizer">

      <div className="section-heading-row">
        <div>
          <h3>Avatar Customizer</h3>
          <p>Customize your avatar. Changes preview live.</p>
        </div>
      </div>

      <section className="customizer-section">
        <h4>🧍 Body Type</h4>

        <div className="body-slider-card">

          <div className="body-slider-header">
            <span className="body-icon">♟</span>
            <strong>{selectedBodyType}</strong>
          </div>

          <input
            className="body-type-slider"
            type="range"
            min="0"
            max={BODY_TYPES.length - 1}
            step="1"
            value={selectedBodyIndex}
            onChange={(event) => {
              const nextIndex = Number(event.target.value);

              updateAvatarField(
                "bodyType",
                BODY_TYPES[nextIndex]
              );
            }}
          />

          <div className="body-slider-labels">
            {BODY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={
                  selectedBodyType === type
                    ? "active"
                    : ""
                }
                onClick={() =>
                  updateAvatarField("bodyType", type)
                }
              >
                {type}
              </button>
            ))}
          </div>

        </div>
      </section>

      <section className="customizer-section">
        <h4>🎨 Skin Tone</h4>

        <input
          type="color"
          value={avatarDraft?.skinTone || "#8d5524"}
          onChange={(event) =>
            updateAvatarField(
              "skinTone",
              event.target.value
            )
          }
        />

        <code>
          {avatarDraft?.skinTone || "#8d5524"}
        </code>
      </section>

      <section className="customizer-section">
        <h4>💇 Hair Style</h4>

        <div className="choice-card-grid hair-choice-grid">

          {HAIR_STYLES.map((style) => (
            <button
              key={style}
              className={
                avatarDraft?.hairStyle === style
                  ? "choice-card active"
                  : "choice-card"
              }
              onClick={() =>
                updateAvatarField("hairStyle", style)
              }
              type="button"
            >
              <span className="hair-preview-dot" />
              <strong>{style}</strong>
            </button>
          ))}

        </div>
      </section>

      <section className="customizer-section">
        <h4>👕 Outfit</h4>

        <div className="choice-card-grid outfit-choice-grid">

          {OUTFITS.map((outfit) => (
            <button
              key={outfit}
              className={
                avatarDraft?.outfit === outfit
                  ? "choice-card active"
                  : "choice-card"
              }
              onClick={() =>
                updateAvatarField("outfit", outfit)
              }
              type="button"
            >
              <span className="outfit-preview-tile" />
              <strong>{outfit}</strong>
            </button>
          ))}

        </div>
      </section>

      <button
        className="save-avatar-button"
        onClick={onSave}
        type="button"
      >
        Save Avatar
      </button>

    </div>
  );
}