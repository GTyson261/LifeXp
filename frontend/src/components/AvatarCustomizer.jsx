import { OUTFIT_STYLE_MAP } from "../data/avatarOptions";

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

const SKIN_TONES = [
  "#f1d1b5",
  "#e0ac69",
  "#c68642",
  "#a66a3f",
  "#8d5524",
  "#6b3f28",
  "#4b2a1f"
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
          <p className="eyebrow">Customize everything</p>
          <h3>Avatar Forge</h3>
          <p>You are the hero of this story.</p>
        </div>
      </div>

      <section className="customizer-section">
        <h4>Body Type</h4>

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
        <h4>Skin Tone</h4>

        <div className="skin-tone-strip" aria-label="Skin tone presets">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone}
              type="button"
              aria-label={`Set skin tone ${tone}`}
              className={
                (avatarDraft?.skinTone || "#8d5524") === tone
                  ? "skin-tone-swatch active"
                  : "skin-tone-swatch"
              }
              style={{ "--skin-tone": tone }}
              onClick={() => updateAvatarField("skinTone", tone)}
            />
          ))}
        </div>

        <input
          className="skin-tone-input"
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
        <h4>Hairstyles</h4>

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
        <h4>Fashion Styles</h4>

        <div className="choice-card-grid outfit-choice-grid">

          {OUTFITS.map((outfit) => (
            <button
              key={outfit}
              style={{
                "--outfit-trim": OUTFIT_STYLE_MAP[outfit]?.trim || "#94a3b8",
                "--outfit-glow": OUTFIT_STYLE_MAP[outfit]?.glow || "#64748b"
              }}
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
