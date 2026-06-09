import {
  getBodyClass,
  getHairClass,
  getOutfitClass,
  getOutfitTheme,
} from "../data/avatarOptions";
import { getEvolution, getNextEvolution } from "../data/evolutionData";

export default function HeroCard({
  activeClass,
  avatar,
  classMeta = {},
  title,
  level = 1,
  xp = 0,
  skillPoints = 0,
}) {
  const safeClass = activeClass || "NOVICE";
  const skinTone = avatar?.skinTone || "#8d5524";
  const hairColor = avatar?.hairColor || "#020617";
  const hairStyle = avatar?.hairStyle || "Fade";
  const bodyType = avatar?.bodyType || "Average";
  const modelType = avatar?.gender === "Female" ? "model-female" : "model-male";
  const outfit = avatar?.outfit || "Novice Jacket";
  const icon = classMeta?.[safeClass]?.icon || "✨";
  const label = classMeta?.[safeClass]?.label || safeClass.replaceAll("_", " ");
  const outfitTheme = getOutfitTheme(outfit);
  const playerName = avatar?.displayName || "PlayerOne";
  const pronouns = avatar?.pronouns || "they/them";
  const currentEvolution = getEvolution(safeClass, level);
  const nextEvolution = getNextEvolution(safeClass, level);
  const xpNeeded = Math.max(100, level * 100);
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const powerScore = Math.max(
    100,
    level * 120 + skillPoints * 40 + Math.floor(xp / 10),
  );

  return (
    <div
      className={`hero-card-avatar ${safeClass.toLowerCase()} ${modelType} ${getBodyClass(bodyType)} ${getHairClass(hairStyle)} ${getOutfitClass(outfit)}`}
      style={{
        "--avatar-skin": skinTone,
        "--avatar-hair": hairColor,
        "--outfit-trim": outfitTheme.trim,
        "--outfit-glow": outfitTheme.glow,
      }}
    >
      <div className="hero-card-bg" />
      <div className="hero-card-corners" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="hero-class-fx" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="hero-foreground-fx" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="hero-card-scanlines" />
      <div className="hero-card-top">
        <span>{icon}</span>
        <div>
          <strong>{playerName}</strong>
          <small>{title || currentEvolution?.title || getHeroSubtitle(safeClass)}</small>
        </div>
        <em>{label}</em>
      </div>

      <div className="hero-card-evolution-badge">
        <span>Current Evolution</span>
        <strong>{currentEvolution?.title}</strong>
        <small>{currentEvolution?.perk}</small>
      </div>

      <div className="hero-portrait">
        <div className="hero-portrait-aura" />

        <div className="hero-portrait-head">
          <div className="hero-portrait-hair" />
          <div className="hero-portrait-face">
            <span />
            <span />
          </div>
        </div>

        <div className="hero-portrait-neck" />

        <div className="hero-portrait-body">
          <div className="hero-portrait-coat left" />
          <div className="hero-portrait-coat right" />
          <div className="hero-portrait-symbol">{icon}</div>
        </div>
      </div>

      <div className="hero-card-stats">
        <div>
          <small>LV</small>
          <strong>{level}</strong>
        </div>

        <div>
          <small>XP</small>
          <strong>{xp}</strong>
        </div>

        <div>
          <small>POWER</small>
          <strong>{powerScore}</strong>
        </div>
      </div>

      <div className="hero-card-xp-track" aria-label={`${xp} of ${xpNeeded} XP`}>
        <div>
          <span style={{ width: `${xpPercent}%` }} />
        </div>
        <small>{xp} / {xpNeeded} XP</small>
      </div>

      <div className="hero-card-bottom">
        <div>
          <small>OUTFIT</small>
          <strong>{outfit}</strong>
        </div>

        <div>
          <small>NEXT</small>
          <strong>{nextEvolution ? `${nextEvolution.title} L${nextEvolution.level}` : "Maxed"}</strong>
        </div>

        <div>
          <small>PRONOUNS</small>
          <strong>{pronouns}</strong>
        </div>
      </div>
    </div>
  );
}
function getHeroSubtitle(className = "NOVICE") {
  const subtitles = {
    NOVICE: "Begin Your Gate",
    CODER: "Code Infinite",
    GAMER: "Arcade Legend",
    ZEN: "Inner Peace",
    EXPLORER: "Beyond Limits",
    SPORT_MASTER: "Train. Push. Win.",
    BOOKWORM: "Knowledge Is Power",
    CHEF: "Flame Alchemist",
  };

  return subtitles[className] || "Become Legendary";
}
