import {
  getBodyClass,
  getHairClass,
  getOutfitClass,
  getOutfitTheme,
} from "../data/avatarOptions";

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
  const hairStyle = avatar?.hairStyle || "Fade";
  const bodyType = avatar?.bodyType || "Average";
  const outfit = avatar?.outfit || "Novice Jacket";
  const icon = classMeta?.[safeClass]?.icon || "✨";
  const label = classMeta?.[safeClass]?.label || safeClass.replaceAll("_", " ");
  const outfitTheme = getOutfitTheme(outfit);
  const powerScore = Math.max(
    100,
    level * 120 + skillPoints * 40 + Math.floor(xp / 10),
  );
  const subtitle = getHeroSubtitle(safeClass);

  return (
    <div
      className={`hero-card-avatar ${safeClass.toLowerCase()} ${getBodyClass(bodyType)} ${getHairClass(hairStyle)} ${getOutfitClass(outfit)}`}
      style={{
        "--avatar-skin": skinTone,
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
          <strong>{label}</strong>
          <small>{subtitle}</small>
        </div>
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

      <div className="hero-card-bottom">
        <div>
          <small>OUTFIT</small>
          <span>{outfit}</span>
        </div>

        <div>
          <small>HAIR</small>
          <strong>{hairStyle}</strong>
        </div>
      </div>

      <div className="hero-card-nav" aria-hidden="true">
        <span>☆</span>
        <span>♙</span>
        <span>⚙</span>
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
