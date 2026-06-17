import { useState } from "react";
import HeroCard from "./HeroCard";
import {
  getBodyClass,
  getHairClass,
  getOutfitClass,
  getOutfitTheme
} from "../data/avatarOptions";
import { getEvolution, getNextEvolution } from "../data/evolutionData";

export default function AvatarPreview({
  state,
  classMeta = {},
  avatarDraft,
  timerRunning = false,
  className = ""
}) {
  const activeClass = state?.activeClass || "NOVICE";
  const avatar = avatarDraft || state?.avatar || {};
  const equippedAura = state?.equippedAura || avatar.aura || "Starter Glow";
  const equippedFrame = state?.equippedFrame || "Starter Frame";
  const meta = classMeta?.[activeClass] || {
    icon: "✨",
    label: activeClass,
    color: "#9ca3af"
  };
  const [avatarMode, setAvatarMode] = useState("live");

  const currentEvolution = getEvolution(activeClass, state?.level || 1);
  const nextEvolution = getNextEvolution(activeClass, state?.level || 1);
  const avatarLevel = Number(state?.level || 1);
  const avatarPower = avatarLevel * 120 + Number(state?.skillPoints || 0) * 40 + Math.floor(Number(state?.xp || 0) / 10);
  const nextGate = nextEvolution ? `Next gate L${nextEvolution.level}` : "Legend tier capped";
  const loadoutSlots = [
    avatar?.outfit,
    avatar?.hairStyle,
    avatar?.bodyType,
    equippedAura,
    equippedFrame,
    avatar?.pronouns
  ];
  const filledLoadout = loadoutSlots.filter(Boolean).length;
  const loadoutPercent = Math.round((filledLoadout / loadoutSlots.length) * 100);

  return (
    <div className={`panel avatar-panel ${frameClass(equippedFrame)} ${className}`.trim()}>
      <div className="avatar-card-header">
        <div>
          <p className="eyebrow">Avatar Preview</p>
          <h3>{state?.title || "Gatebound Novice"}</h3>
        </div>

        <div className="avatar-class-pill">
          <span>{meta.icon}</span>
          {meta.label}
        </div>
      </div>

      <div className="avatar-mode-toggle" role="group" aria-label="Avatar display mode">
        <button
          type="button"
          className={avatarMode === "live" ? "active" : ""}
          onClick={() => setAvatarMode("live")}
        >
          Live Avatar
        </button>
        <button
          type="button"
          className={avatarMode === "hero" ? "active" : ""}
          onClick={() => setAvatarMode("hero")}
        >
          Hero Card
        </button>
      </div>

      <div className="avatar-identity-strip" aria-label="Avatar identity summary">
        <span>
          <small>Level</small>
          <strong>{avatarLevel}</strong>
        </span>
        <span>
          <small>Power</small>
          <strong>{avatarPower}</strong>
        </span>
        <span>
          <small>Evolution</small>
          <strong>{currentEvolution?.title || "Novice"}</strong>
        </span>
        <span>
          <small>Loadout</small>
          <strong>{loadoutPercent}%</strong>
        </span>
      </div>

      <div className={`avatar-stage avatar-stage-${avatarMode}`}>
        {avatarMode === "live" ? (
          <div className="avatar-rpg-shell">
            <div className="avatar-stage-crest">
              <span>{meta.icon}</span>
              <div>
                <small>{currentEvolution?.title || "Novice"}</small>
                <strong>{state?.title || "Gatebound Novice"}</strong>
              </div>
              <em>Rank {avatarLevel}</em>
            </div>

            <div className="avatar-rpg-backdrop" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>

            <FakeAvatar
              activeClass={activeClass}
              timerRunning={timerRunning}
              auraName={equippedAura}
              avatar={avatar}
              level={state?.level || 1}
            />

            <div className="avatar-rpg-plinth">
              <span>{meta.label}</span>
              <strong>{avatarPower} Power</strong>
              <small>{nextGate}</small>
            </div>

            <div className="avatar-stage-badges" aria-label="Avatar RPG loadout">
              <span><small>Aura</small><strong>{equippedAura}</strong></span>
              <span><small>Frame</small><strong>{equippedFrame}</strong></span>
              <span><small>Loadout</small><strong>{loadoutPercent}%</strong></span>
            </div>
          </div>
        ) : (
          <HeroCard
            activeClass={activeClass}
            avatar={avatar}
            classMeta={classMeta}
            title={state?.title || "Gatebound Novice"}
            level={state?.level || 1}
            xp={state?.xp || 0}
            skillPoints={state?.skillPoints || 0}
          />
        )}
      </div>
      <div className="avatar-loadout-grid">
        <LoadoutStat label="Outfit" value={avatar?.outfit || "Novice Jacket"} status="Hero model" />
        <LoadoutStat label="Hair" value={avatar?.hairStyle || "Fade"} status="Silhouette" />
        <LoadoutStat label="Body" value={avatar?.bodyType || "Average"} status="Rig profile" />
        <LoadoutStat label="Aura" value={equippedAura} status="Battle FX" />
        <LoadoutStat label="Frame" value={equippedFrame} status="Profile art" />
        <LoadoutStat label="Pronouns" value={avatar?.pronouns || "they/them"} status="Identity" />
      </div>
      <div className="avatar-loadout-score" aria-hidden="true">
        <span>Loadout Sync</span>
        <i>
          <b style={{ width: `${loadoutPercent}%` }} />
        </i>
      </div>
      <div className="avatar-evolution-panel">
        <h4>Evolution Path</h4>

        <div className="avatar-evolution-current">
          <span>Current Evolution</span>
          <strong>{currentEvolution?.title}</strong>
          <small>{currentEvolution?.outfit}</small>
          <p>{currentEvolution?.perk}</p>
          <em>{currentEvolution?.mastery}</em>
        </div>

        {nextEvolution && (
          <div className="avatar-evolution-next">
            <span>Next Evolution</span>
            <strong>{nextEvolution.title}</strong>
            <small>Unlocks at Level {nextEvolution.level}</small>
            <p>{nextEvolution.perk}</p>
            <em>{nextEvolution.mastery}</em>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadoutStat({ label, value, status }) {
  return (
    <div className="avatar-loadout-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {status && <small>{status}</small>}
    </div>
  );
}

export function FakeAvatar({ activeClass, timerRunning, auraName, avatar, level = 1 }) {
  const skinTone = avatar?.skinTone || "#8d5524";
  const hairColor = avatar?.hairColor || "#020617";
  const hairStyle = avatar?.hairStyle || "Fade";
  const bodyType = avatar?.bodyType || "Average";
  const modelType = avatar?.gender === "Female" ? "model-female" : "model-male";
  const outfit = avatar?.outfit || "Novice Jacket";
  const outfitTheme = getOutfitTheme(outfit);
  const playerLevel = Number(level || 1);
  const evolutionTier =
    playerLevel >= 100 ? "evo-100" :
      playerLevel >= 75 ? "evo-75" :
        playerLevel >= 50 ? "evo-50" :
          playerLevel >= 25 ? "evo-25" :
            "evo-1";

  return (
    <div
      className={`fake-avatar premium-avatar ${activeClass.toLowerCase()} ${evolutionTier} ${
        timerRunning ? "avatar-active" : ""
      } ${modelType} ${getBodyClass(bodyType)} ${getHairClass(hairStyle)} ${getOutfitClass(outfit)}`}
      style={{
        "--avatar-skin": skinTone,
        "--avatar-hair": hairColor,
        "--outfit-trim": outfitTheme.trim,
        "--outfit-glow": outfitTheme.glow
      }}
    >
      <div className={`avatar-aura ${auraClass(auraName)}`} />
      <div className="avatar-back-glow" />
      <div className="avatar-class-effects" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="avatar-rpg-weapon" aria-hidden="true">
        <i />
        <b />
      </div>

      <div className="avatar-head">
        <div className="avatar-ear left" />
        <div className="avatar-ear right" />
        <div className="avatar-hair" />
        <div className="avatar-brow left" />
        <div className="avatar-brow right" />
        <div className="avatar-face">
          <span className="eye">
            <i className="iris" />
          </span>
          <span className="eye">
            <i className="iris" />
          </span>
        </div>
        <div className="avatar-nose" />
        <div className="avatar-mouth" />
        <div className="avatar-face-shine" />
      </div>

      <div className="avatar-neck" />

      <div className="avatar-collar">
        <span />
        <span />
      </div>

      <div className="avatar-arms">
        <span className="left-arm">
          <i />
        </span>
        <span className="right-arm">
          <i />
        </span>
      </div>

      <div className="avatar-body">
        <div className="avatar-torso">
          <div className="avatar-shoulder left" />
          <div className="avatar-shoulder right" />

          <div className="avatar-jacket-panel left" />
          <div className="avatar-jacket-panel right" />

          <div className="avatar-chest-plate" />

          <div className="avatar-outfit-layer" aria-hidden="true">
            <span className="outfit-strap strap-left" />
            <span className="outfit-strap strap-right" />
            <span className="outfit-sash" />
            <span className="outfit-pouch pouch-left" />
            <span className="outfit-pouch pouch-right" />
            <span className="outfit-apron" />
            <span className="outfit-robe-left" />
            <span className="outfit-robe-right" />
          </div>

          <div className="avatar-glow-line line-one" />
          <div className="avatar-glow-line line-two" />

          <div className="avatar-belt" />
          <div className="avatar-gauntlet left" />
          <div className="avatar-gauntlet right" />
          <div className="avatar-core" />
        </div>
      </div>

      <div className="avatar-legs">
        <span className="left-leg">
          <i />
        </span>
        <span className="right-leg">
          <i />
        </span>
      </div>

      <div className="avatar-ground-ring" />
      <div className="avatar-shadow" />
    </div>
  );
}

function frameClass(frameName = "") {
  const value = frameName.toLowerCase();

  if (value.includes("legendary")) return "frame-legendary";
  if (value.includes("shadow")) return "frame-shadow";
  if (value.includes("victory")) return "frame-victory";

  return "frame-starter";
}

function auraClass(auraName = "") {
  const value = auraName.toLowerCase();

  if (value.includes("terminal") || value.includes("blue")) return "aura-terminal";
  if (value.includes("rune") || value.includes("purple")) return "aura-rune";
  if (value.includes("glitch")) return "aura-glitch";
  if (value.includes("flame")) return "aura-flame";

  return "aura-starter";
}
