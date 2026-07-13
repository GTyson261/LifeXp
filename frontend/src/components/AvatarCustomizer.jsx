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

const OUTFITS = Object.keys(OUTFIT_STYLE_MAP);

const SKIN_TONES = [
  "#f1d1b5",
  "#e0ac69",
  "#c68642",
  "#a66a3f",
  "#8d5524",
  "#6b3f28",
  "#4b2a1f"
];

const HAIR_COLORS = [
  "#020617",
  "#4b2a1f",
  "#7c4a2f",
  "#a16207",
  "#d6a35d",
  "#e5e7eb",
  "#7c3aed",
  "#22d3ee",
  "#ec4899"
];

const PRONOUN_OPTIONS = [
  "they/them",
  "she/her",
  "he/him",
  "she/they",
  "he/they",
  "any"
];

const MODEL_TYPES = ["Male", "Female"];

export default function AvatarCustomizer({
  avatarDraft,
  setAvatarDraft,
  onSave,
  saveStatus = "saved",
  hasUnsavedChanges = true,
  cosmeticUnlocks = null,
  onPreviewLockedOutfit = null
}) {
  function updateAvatarField(field, value) {
    setAvatarDraft({
      ...avatarDraft,
      [field]: value
    });
  }

  function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomizeColorIdentity() {
    setAvatarDraft({
      ...avatarDraft,
      skinTone: getRandomItem(SKIN_TONES),
      hairColor: getRandomItem(HAIR_COLORS)
    });
  }

  const selectedBodyType =
    avatarDraft?.bodyType || "Average";

  const selectedModelType =
    avatarDraft?.gender === "Female" ? "Female" : "Male";

  const selectedBodyIndex = Math.max(
    0,
    BODY_TYPES.indexOf(selectedBodyType)
  );

  const unlockedOutfits = cosmeticUnlocks?.outfits;

  function isOutfitUnlocked(outfit) {
    if (!unlockedOutfits) return true;
    return unlockedOutfits.has(outfit);
  }

  const saveLabel = saveStatus === "saving"
    ? "Saving..."
    : hasUnsavedChanges
      ? "Save Avatar Changes"
      : "Avatar Saved";
  const identityFields = [
    avatarDraft?.displayName,
    avatarDraft?.pronouns,
    avatarDraft?.skinTone,
    avatarDraft?.hairColor,
    avatarDraft?.hairStyle,
    avatarDraft?.outfit
  ];
  const forgeCompletion = Math.round((identityFields.filter(Boolean).length / identityFields.length) * 100);

  return (
    <div className="panel avatar-customizer premium-customizer">

      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Customize everything</p>
          <h3>Avatar Forge</h3>
          <p>You are the hero of this story.</p>
        </div>
      </div>

      <div className="forge-status-strip">
        <span>
          <small>Model</small>
          <strong>{selectedModelType}</strong>
        </span>
        <span>
          <small>Build</small>
          <strong>{selectedBodyType}</strong>
        </span>
        <span>
          <small>Outfit</small>
          <strong>{avatarDraft?.outfit || "Default"}</strong>
        </span>
        <span>
          <small>Save State</small>
          <strong>{saveStatus === "saving" ? "Syncing" : hasUnsavedChanges ? "Draft" : "Saved"}</strong>
        </span>
      </div>

      <div className="forge-synthesis-card" aria-label="Avatar forge synthesis">
        <div>
          <small>Forge Sync</small>
          <strong>{forgeCompletion}%</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${forgeCompletion}%` }} />
        </i>
        <span>{hasUnsavedChanges ? "Draft changes pending" : "Avatar identity saved"} · {selectedModelType} {selectedBodyType}</span>
      </div>

      <section className="customizer-section">
        <h4>Identity</h4>

        <div className="identity-field-grid">
          <label className="identity-field">
            <span>Name</span>
            <input
              type="text"
              value={avatarDraft?.displayName || ""}
              placeholder="PlayerOne"
              maxLength="32"
              onChange={(event) =>
                updateAvatarField("displayName", event.target.value)
              }
            />
          </label>

          <label className="identity-field">
            <span>Pronouns</span>
            <input
              type="text"
              list="pronoun-options"
              value={avatarDraft?.pronouns || ""}
              placeholder="they/them"
              maxLength="24"
              onChange={(event) =>
                updateAvatarField("pronouns", event.target.value)
              }
            />
            <datalist id="pronoun-options">
              {PRONOUN_OPTIONS.map((pronouns) => (
                <option key={pronouns} value={pronouns} />
              ))}
            </datalist>
          </label>
        </div>
      </section>

      <section className="customizer-section">
        <h4>Model</h4>

        <div className="model-toggle" role="group" aria-label="Avatar model type">
          {MODEL_TYPES.map((modelType) => (
            <button
              key={modelType}
              type="button"
              aria-pressed={selectedModelType === modelType}
              className={
                selectedModelType === modelType
                  ? "model-toggle-button active"
                  : "model-toggle-button"
              }
              onClick={() => updateAvatarField("gender", modelType)}
            >
              <span>{modelType === "Male" ? "♂" : "♀"}</span>
              <strong>{modelType}</strong>
            </button>
          ))}
        </div>
      </section>

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
            aria-label="Body type"
            aria-valuetext={selectedBodyType}
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
                aria-pressed={selectedBodyType === type}
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
        <div className="customizer-section-title-row">
          <h4>Skin Tone</h4>
          <button
            className="randomize-colors-button"
            type="button"
            onClick={randomizeColorIdentity}
          >
            Randomize Colors
          </button>
        </div>

        <div className="skin-tone-strip" aria-label="Skin tone presets">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone}
              type="button"
              aria-label={`Set skin tone ${tone}`}
              aria-pressed={(avatarDraft?.skinTone || "#8d5524") === tone}
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
          aria-label="Custom skin tone"
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
        <h4>Hair Color</h4>

        <div className="hair-color-strip" aria-label="Hair color presets">
          {HAIR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Set hair color ${color}`}
              aria-pressed={(avatarDraft?.hairColor || "#020617") === color}
              className={
                (avatarDraft?.hairColor || "#020617") === color
                  ? "hair-color-swatch active"
                  : "hair-color-swatch"
              }
              style={{ "--hair-color": color }}
              onClick={() => updateAvatarField("hairColor", color)}
            />
          ))}
        </div>

        <input
          className="hair-color-input"
          type="color"
          aria-label="Custom hair color"
          value={avatarDraft?.hairColor || "#020617"}
          onChange={(event) =>
            updateAvatarField(
              "hairColor",
              event.target.value
            )
          }
        />

        <code>
          {avatarDraft?.hairColor || "#020617"}
        </code>
      </section>

      <section className="customizer-section">
        <h4>Hairstyles</h4>

        <div className="choice-card-grid hair-choice-grid">

          {HAIR_STYLES.map((style) => (
            <button
              key={style}
              aria-pressed={avatarDraft?.hairStyle === style}
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
              <span
                className="hair-preview-dot"
                style={{ "--hair-color": avatarDraft?.hairColor || "#020617" }}
              />
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
              aria-disabled={!isOutfitUnlocked(outfit)}
              aria-pressed={avatarDraft?.outfit === outfit}
              style={{
                "--outfit-trim": OUTFIT_STYLE_MAP[outfit]?.trim || "#94a3b8",
                "--outfit-glow": OUTFIT_STYLE_MAP[outfit]?.glow || "#64748b"
              }}
              className={
                [
                  "choice-card",
                  avatarDraft?.outfit === outfit ? "active" : "",
                  !isOutfitUnlocked(outfit) ? "locked-choice" : ""
                ].filter(Boolean).join(" ")
              }
              onClick={() =>
                isOutfitUnlocked(outfit) && updateAvatarField("outfit", outfit)
              }
              onMouseEnter={() => {
                if (!isOutfitUnlocked(outfit)) onPreviewLockedOutfit?.(outfit);
              }}
              onMouseLeave={() => {
                if (!isOutfitUnlocked(outfit)) onPreviewLockedOutfit?.("");
              }}
              onFocus={() => {
                if (!isOutfitUnlocked(outfit)) onPreviewLockedOutfit?.(outfit);
              }}
              onBlur={() => {
                if (!isOutfitUnlocked(outfit)) onPreviewLockedOutfit?.("");
              }}
              onTouchStart={() => {
                if (!isOutfitUnlocked(outfit)) onPreviewLockedOutfit?.(outfit);
              }}
              type="button"
            >
              <span className="outfit-preview-tile" />
              <strong>{outfit}</strong>
              {!isOutfitUnlocked(outfit) && <small>Unlock in shop or boss loot</small>}
            </button>
          ))}

        </div>
      </section>

      <button
        className={
          hasUnsavedChanges
            ? "save-avatar-button unsaved"
            : "save-avatar-button saved"
        }
        onClick={onSave}
        disabled={saveStatus === "saving" || !hasUnsavedChanges}
        type="button"
      >
        {saveLabel}
      </button>

      {hasUnsavedChanges && (
        <p className="avatar-save-hint">Unsaved avatar changes are previewing live.</p>
      )}

    </div>
  );
}
