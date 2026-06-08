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
  timerRunning = false
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

  return (
    <div className={`panel avatar-panel ${frameClass(equippedFrame)}`}>
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

      {avatarMode === "live" ? (
        <FakeAvatar
          activeClass={activeClass}
          timerRunning={timerRunning}
          auraName={equippedAura}
          avatar={avatar}
          classMeta={classMeta}
          level={state?.level || 1}
        />
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
      <div className="avatar-loadout-grid">
        <LoadoutStat label="Outfit" value={avatar?.outfit || "Novice Jacket"} />
        <LoadoutStat label="Hair" value={avatar?.hairStyle || "Fade"} />
        <LoadoutStat label="Body" value={avatar?.bodyType || "Average"} />
        <LoadoutStat label="Aura" value={equippedAura} />
        <LoadoutStat label="Frame" value={equippedFrame} />
        <LoadoutStat label="Pronouns" value={avatar?.pronouns || "they/them"} />
      </div>
      <div className="avatar-evolution-panel">
        <h4>Evolution Path</h4>

        <div className="avatar-evolution-current">
          <span>Current Evolution</span>
          <strong>{currentEvolution?.title}</strong>
          <small>{currentEvolution?.outfit}</small>
        </div>

        {nextEvolution && (
          <div className="avatar-evolution-next">
            <span>Next Evolution</span>
            <strong>{nextEvolution.title}</strong>
            <small>Unlocks at Level {nextEvolution.level}</small>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadoutStat({ label, value }) {
  return (
    <div className="avatar-loadout-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function FakeAvatar({ activeClass, timerRunning, auraName, avatar, classMeta, level = 1 }) {
  const skinTone = avatar?.skinTone || "#8d5524";
  const hairStyle = avatar?.hairStyle || "Fade";
  const bodyType = avatar?.bodyType || "Average";
  const outfit = avatar?.outfit || "Novice Jacket";
  const icon = classMeta?.[activeClass]?.icon || "✨";
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
      } ${getBodyClass(bodyType)} ${getHairClass(hairStyle)} ${getOutfitClass(outfit)}`}
      style={{
        "--avatar-skin": skinTone,
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
          <div className="avatar-core">{icon}</div>
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
