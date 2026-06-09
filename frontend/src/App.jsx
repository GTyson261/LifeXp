import { useEffect, useState } from "react";
import DashboardHUD from "./components/DashboardHUD";
import AvatarCustomizer from "./components/AvatarCustomizer";
import AvatarPreview from "./components/AvatarPreview";
import AchievementPanel from "./components/AchievementPanel";
import QuestPanel from "./components/QuestPanel";
import BossPanel from "./components/BossPanel";
import ShopPanel from "./components/ShopPanel";
import InventoryPanel from "./components/InventoryPanel";
import EconomyPanel from "./components/EconomyPanel";
import WorldMapPanel from "./components/WorldMapPanel";
import LootPanel from "./components/LootPanel";
import SkillTreePanel from "./components/SkillTreePanel";
import ActivityLogPanel from "./components/ActivityLogPanel";
import EquipmentPanel from "./components/EquipmentPanel";
import ClassPanel from "./components/ClassPanel";
import ActivityPanel from "./components/ActivityPanel";
import SanctuaryPanel from "./components/SanctuaryPanel";
import TimerPanel from "./components/TimerPanel";
import AvatarShowcase from "./components/AvatarShowcase";
import {
  getGameState,
  completeActivity,
  changePrimaryClassAtSanctuary,
  chooseIntroClass,
  updateAvatar,
  unlockSkill,
  claimQuest,
  buyShopItem,
  equipInventoryItem,
  travelToWorld,
  restEnergy,
  resetGame
} from "./services/api";
import "./styles.css";
import "./styles/dashboard.css";
import "./styles/sidebar.css";
import "./styles/customizer.css";
import "./styles/shop.css";
import "./styles/intro.css";
import "./styles/animations.css";
import "./styles/avatar.css";
import "./styles/avatarShowcase.css";
import "./styles/heroCard.css";
import "./styles/classes.css";
import "./styles/responsive.css";
import { CLASSES, CLASS_META, ACTIVITIES } from "./data/gameData";

const DASHBOARD_TABS = [
  { key: "overview", label: "Overview", icon: "⌂" },
  { key: "avatar", label: "Avatar", icon: "♙" },
  { key: "quests", label: "Quests", icon: "◇" },
  { key: "shop", label: "Shop", icon: "◈" },
  { key: "world", label: "World", icon: "⌖" },
  { key: "log", label: "Log", icon: "☰" }
];

const INTRO_OPENINGS = {
  CODER: {
    title: "Enter the Cyber District",
    hook: "Turn debugging, focus, and late-night builds into power.",
    promise: "Your first gate opens in neon code and clean momentum.",
    signal: "Compile discipline. Break the Bug Lord.",
    perk: "Coding and focus cost less energy, earn bonus XP, gold, and boss damage."
  },
  BOOKWORM: {
    title: "Enter the Knowledge Forest",
    hook: "Every page, note, and study session becomes living magic.",
    promise: "Your first gate opens through glowing shelves and memory runes.",
    signal: "Read deeper. Outlast the Forgetfulness Wraith.",
    perk: "Reading notes create bonus XP, Essence, and extra boss damage."
  },
  SPORT_MASTER: {
    title: "Enter Titan Arena",
    hook: "Movement becomes strength, streaks become armor.",
    promise: "Your first gate opens under arena lights and electric pressure.",
    signal: "Train the body. Stand down the Burnout Titan.",
    perk: "Walking and workouts cost less energy, restore energy, and hit harder."
  },
  GAMER: {
    title: "Enter Arcade Nexus",
    hook: "Stack real actions like combos and turn quests into score.",
    promise: "Your first gate opens in green neon, pixel sparks, and challenge runs.",
    signal: "Play with purpose. Defeat the Doomscroll Phantom.",
    perk: "Gaming earns combo gold and boss damage; quest claims pay extra."
  },
  EXPLORER: {
    title: "Enter the Lost Frontier",
    hook: "Trying new things, routes, and ideas becomes map progress.",
    promise: "Your first gate opens onto compass light and unknown roads.",
    signal: "Move beyond routine. Face the Fear of Unknown.",
    perk: "Travel costs less, grants XP and gold, and discovery actions pay more."
  },
  ZEN: {
    title: "Enter Spirit Temple",
    hook: "Reflection, rest, and calm effort become quiet force.",
    promise: "Your first gate opens in blue air, still water, and steady breath.",
    signal: "Protect your peace. Break the Stress Serpent.",
    perk: "Meditation and focus cost less energy, restore energy, and damage bosses."
  },
  MUSICIAN: {
    title: "Enter Rhythm Realm",
    hook: "Practice, timing, and creative flow become soundwave XP.",
    promise: "Your first gate opens on stage light and pulsing rhythm.",
    signal: "Keep time. Challenge the Silence Reaper.",
    perk: "Music practice costs less energy and earns bonus Crystals and damage."
  },
  CHEF: {
    title: "Enter Culinary Kingdom",
    hook: "Cooking, prep, and nourishment become flame-forged mastery.",
    promise: "Your first gate opens through steam, copper light, and recipe fire.",
    signal: "Feed the grind. Tame the Chaos Chef.",
    perk: "Cooking costs less energy, restores energy, earns gold, and hits bosses."
  }
};

const INTRO_CLASSES = CLASSES.filter((className) => className !== "NOVICE");

export default function App() {
  const [state, setState] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [introClass, setIntroClass] = useState("CODER");
  const [introName, setIntroName] = useState("");
  const [introPronouns, setIntroPronouns] = useState("they/them");

  const [activityType, setActivityType] = useState("coding");
  const [amount, setAmount] = useState("");
  const [summary, setSummary] = useState("");
  const [verified, setVerified] = useState(false);

  const [timerActivity, setTimerActivity] = useState("coding");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [floatingXp, setFloatingXp] = useState(null);

  async function loadGame() {
    try {
      setLoadError("");
      const data = await getGameState();
      setState(data);
      setAvatarDraft({
        ...(data.avatar || {}),
        displayName: data.playerName || data.avatar?.displayName || "PlayerOne",
        pronouns: data.pronouns || data.avatar?.pronouns || "they/them"
      });
      setIntroClass(data.primaryClass && data.primaryClass !== "NOVICE" ? data.primaryClass : "CODER");
      setIntroName(data.playerName === "PlayerOne" ? "" : data.playerName || "");
      setIntroPronouns(data.pronouns || data.avatar?.pronouns || "they/them");
      setShowIntro(!data.introCompleted);
    } catch (error) {
      setLoadError(error.message || "Could not connect to the LifeXP backend.");
    }
  }

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  if (!state && loadError) {
    return (
      <div className="loading-screen loading-error-screen">
        <div className="loading-error-card">
          <p className="eyebrow">Connection Needed</p>
          <h1>LifeXP backend is offline</h1>
          <p>
            Start the Spring Boot backend on port 8080, then retry the dashboard.
          </p>
          <button type="button" onClick={loadGame}>
            Retry Connection
          </button>
          <small>{loadError}</small>
        </div>
      </div>
    );
  }

  if (!state) {
    return <div className="loading-screen">Booting LifeXP...</div>;
  }

  const activeClass = state.activeClass || "NOVICE";
  const meta = CLASS_META[activeClass] || CLASS_META.NOVICE;
  const xpNeeded = state.level * 100;
  const xpPercent = Math.min(100, Math.round((state.xp / xpNeeded) * 100));

  function showXp(xp) {
    setFloatingXp(`+${xp} XP`);
    setTimeout(() => setFloatingXp(null), 1200);
  }

  async function openGate() {
    const trimmedName = introName.trim();
    const trimmedPronouns = introPronouns.trim() || "they/them";

    if (!trimmedName) {
      return;
    }

    await updateAvatar({
      ...(avatarDraft || state.avatar || {}),
      displayName: trimmedName,
      pronouns: trimmedPronouns
    });

    await chooseIntroClass(introClass);

    const updated = await completeActivity({
      type: "intro",
      amount: 0,
      summary: `Opened the ${CLASS_META[introClass]?.world || "LifeXP"} Gate`,
      verified: true
    });

    setState(updated);
    setAvatarDraft({
      ...(updated.avatar || {}),
      displayName: updated.playerName || trimmedName,
      pronouns: updated.pronouns || trimmedPronouns
    });
    setShowIntro(false);
  }

  async function handleClassChoice(className) {
    const currentAvatar = avatarDraft || state?.avatar || {};
    const updated = await changePrimaryClassAtSanctuary(className);

    const preservedAvatar = {
      ...(updated.avatar || {}),
      ...currentAvatar,
      displayName: currentAvatar.displayName || updated.playerName || "PlayerOne",
      pronouns: currentAvatar.pronouns || updated.pronouns || "they/them"
    };

    setState({
      ...updated,
      avatar: preservedAvatar
    });

    setAvatarDraft(preservedAvatar);
  }

  async function submitActivity(event) {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) return;

    const updated = await completeActivity({
      type: activityType,
      amount: Number(amount),
      summary,
      verified
    });

    showXp(updated.lastXpGain);
    setState(updated);
    setAvatarDraft(updated.avatar);
    setAmount("");
    setSummary("");
    setVerified(false);
  }

  async function stopTimerAndClaim() {
    const minutes = Math.max(1, Math.round(timerSeconds / 60));

    const updated = await completeActivity({
      type: timerActivity,
      amount: minutes,
      summary: `Verified ${timerActivity} timer session`,
      verified: true
    });

    showXp(updated.lastXpGain);
    setState(updated);
    setAvatarDraft(updated.avatar);
    setTimerRunning(false);
    setTimerSeconds(0);
  }

  async function saveAvatar() {
    const updated = await updateAvatar(avatarDraft);
    setState(updated);
    setAvatarDraft(updated.avatar);
  }

  async function handleBuyItem(itemId) {
    const updated = await buyShopItem(itemId);
    setState(updated);
    setAvatarDraft(updated.avatar);
  }

  async function handleEquipItem(itemId) {
    const updated = await equipInventoryItem(itemId);
    setState(updated);
    setAvatarDraft(updated.avatar);
  }

  async function handleTravel(worldId) {
    const updated = await travelToWorld(worldId);
    setState(updated);
    setAvatarDraft(updated.avatar);
  }

  async function handleRest() {
    const updated = await restEnergy();
    setState(updated);
    setAvatarDraft(updated.avatar);
  }

  async function handleUnlockSkill(skillId) {
    const updated = await unlockSkill(skillId);
    setState(updated);
  }

  async function handleClaimQuest(questId) {
    const updated = await claimQuest(questId);
    if (updated.lastXpGain > 0) {
      showXp(updated.lastXpGain);
    }
    setState(updated);
    setAvatarDraft(updated.avatar);
  }

  async function hardReset() {
    const updated = await resetGame();
    setState(updated);
    setAvatarDraft(updated.avatar);
    setIntroClass("CODER");
    setIntroName("");
    setIntroPronouns("they/them");
    setShowIntro(true);
    setTimerRunning(false);
    setTimerSeconds(0);
  }

  if (showIntro) {
    const introMeta = CLASS_META[introClass] || CLASS_META.CODER;
    const introOpening = INTRO_OPENINGS[introClass] || INTRO_OPENINGS.CODER;
    const canOpenGate = introName.trim().length > 0;

    return (
      <div
        className={`intro-screen intro-${introClass.toLowerCase()}`}
        style={{ "--intro-color": introMeta.color }}
      >
        <div className="intro-stage">
          <section className="intro-hero">
            <div className="intro-copy">
              <p className="eyebrow">Choose your origin</p>
              <h1>{introOpening.title}</h1>
              <h2>{introOpening.hook}</h2>
              <p>{introOpening.promise}</p>

              <div className="intro-identity-panel">
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={introName}
                    placeholder="Choose your hero name"
                    maxLength="32"
                    onChange={(event) => setIntroName(event.target.value)}
                  />
                </label>

                <label>
                  <span>Pronouns</span>
                  <input
                    type="text"
                    value={introPronouns}
                    placeholder="they/them"
                    maxLength="24"
                    onChange={(event) => setIntroPronouns(event.target.value)}
                  />
                </label>
              </div>

              <div className="intro-signal-row">
                <span>{introMeta.icon}</span>
                <strong>{introMeta.archetype}</strong>
                <small>{introOpening.signal}</small>
                <em>{introOpening.perk}</em>
              </div>

              <button className="gate-button" disabled={!canOpenGate} onClick={openGate}>
                {canOpenGate ? `Open ${introMeta.world} Gate` : "Name Your Hero First"}
              </button>
            </div>

            <div className="portal-scene" aria-hidden="true">
              <div className="portal-door">
                <div className="door-core">
                  <span>{introMeta.icon}</span>
                </div>
              </div>
              <div className="portal-floor" />
            </div>
          </section>

          <section className="origin-grid" aria-label="Class origin choices">
            {INTRO_CLASSES.map((className) => {
              const classMeta = CLASS_META[className];
              const opening = INTRO_OPENINGS[className];
              const selected = introClass === className;

              return (
                <button
                  key={className}
                  type="button"
                  className={selected ? "origin-card selected" : "origin-card"}
                  style={{ "--origin-color": classMeta.color }}
                  aria-pressed={selected}
                  onClick={() => setIntroClass(className)}
                >
                  <span>{classMeta.icon}</span>
                  <strong>{classMeta.label}</strong>
                  <small>{opening.title.replace("Enter ", "")}</small>
                  <em>{opening.perk}</em>
                </button>
              );
            })}
          </section>

          <div className="intro-footer-strip">
            <span>Real actions become XP</span>
            <span>Daily quests unlock rewards</span>
            <span>World bosses track your momentum</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`app-shell ${themeClass(state.equippedTheme)} class-${activeClass.toLowerCase()}`}
      style={{ "--class-color": meta.color }}
    >
      {floatingXp && <div className="floating-xp">{floatingXp}</div>}

      <div className="premium-dashboard-layout">
        <div className="premium-dashboard-main">
          <DashboardHUD
            state={{ ...state, onReset: hardReset, onRest: handleRest }}
            classMeta={CLASS_META}
          />

          <nav className="dashboard-tabs" aria-label="Dashboard views">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-label={`Show ${tab.label} view`}
                aria-pressed={activeView === tab.key}
                className={activeView === tab.key ? "dashboard-tab active" : "dashboard-tab"}
                onClick={() => setActiveView(tab.key)}
              >
                <span>{tab.icon}</span>
                <strong>{tab.label}</strong>
              </button>
            ))}
          </nav>

          <section className={`dashboard-grid view-${activeView}`}>
            {activeView === "overview" && (
              <>
                <HeroProgressPanel
                  state={state}
                  xpNeeded={xpNeeded}
                  xpPercent={xpPercent}
                />

                <AvatarPreview
                  state={state}
                  classMeta={CLASS_META}
                  avatarDraft={avatarDraft}
                  timerRunning={timerRunning}
                />

                <TimerPanel
                  activities={ACTIVITIES}
                  timerActivity={timerActivity}
                  setTimerActivity={setTimerActivity}
                  timerRunning={timerRunning}
                  timerSeconds={timerSeconds}
                  onStart={() => setTimerRunning(true)}
                  onStopAndClaim={stopTimerAndClaim}
                  formatTime={formatTime}
                />

                <ActivityPanel
                  activities={ACTIVITIES}
                  activityType={activityType}
                  setActivityType={setActivityType}
                  amount={amount}
                  setAmount={setAmount}
                  summary={summary}
                  setSummary={setSummary}
                  verified={verified}
                  setVerified={setVerified}
                  energy={state.energy}
                  energyCost={calculateEnergyCost(amount)}
                  onSubmit={submitActivity}
                />

                <BossPanel
                  boss={state.currentBoss}
                  bossesDefeated={state.bossesDefeated}
                />

                <QuestPanel quests={state.dailyQuests || []} onClaimQuest={handleClaimQuest} />
              </>
            )}

            {activeView === "avatar" && (
              <>
                <AvatarShowcase
                  classes={CLASSES}
                  classMeta={CLASS_META}
                  activeClass={state.primaryClass || activeClass}
                  onClassSelect={handleClassChoice}
                />

                <AvatarPreview
                  state={state}
                  classMeta={CLASS_META}
                  avatarDraft={avatarDraft}
                  timerRunning={timerRunning}
                />

                <AvatarCustomizer
                  avatarDraft={avatarDraft}
                  setAvatarDraft={setAvatarDraft}
                  onSave={saveAvatar}
                />

                <EquipmentPanel
                  equippedTheme={state.equippedTheme}
                  equippedFrame={state.equippedFrame}
                  equippedAura={state.equippedAura}
                  outfit={state.avatar?.outfit}
                />

                <ClassPanel
                  classes={CLASSES}
                  classMeta={CLASS_META}
                  primaryClass={state.primaryClass}
                  level={state.level}
                  onClassSelect={handleClassChoice}
                />

                <SanctuaryPanel state={state} classMeta={CLASS_META} />
              </>
            )}

            {activeView === "quests" && (
              <>
                <QuestPanel quests={state.dailyQuests || []} onClaimQuest={handleClaimQuest} />

                <SkillTreePanel
                  skills={state.skills || []}
                  skillPoints={state.skillPoints}
                  onUnlockSkill={handleUnlockSkill}
                />

                <AchievementPanel achievements={state.achievements || []} />

                <ActivityPanel
                  activities={ACTIVITIES}
                  activityType={activityType}
                  setActivityType={setActivityType}
                  amount={amount}
                  setAmount={setAmount}
                  summary={summary}
                  setSummary={setSummary}
                  verified={verified}
                  setVerified={setVerified}
                  energy={state.energy}
                  energyCost={calculateEnergyCost(amount)}
                  onSubmit={submitActivity}
                />
              </>
            )}

            {activeView === "shop" && (
              <>
                <EconomyPanel
                  gold={state.gold}
                  crystals={state.crystals}
                  essence={state.essence}
                  energy={state.energy}
                  lastRestTimestamp={state.lastRestTimestamp}
                  onRest={handleRest}
                />

                <ShopPanel items={state.shopItems || []} onBuyItem={handleBuyItem} />

                <InventoryPanel
                  items={state.inventory || []}
                  onEquipItem={handleEquipItem}
                />

                <LootPanel
                  bossesDefeated={state.bossesDefeated}
                  lastLootDrops={state.lastLootDrops || []}
                  lootHistory={state.lootHistory || []}
                />
              </>
            )}

            {activeView === "world" && (
              <>
                <WorldMapPanel
                  worlds={state.worlds || []}
                  currentWorldId={state.currentWorldId}
                  onTravel={handleTravel}
                />

                <BossPanel
                  boss={state.currentBoss}
                  bossesDefeated={state.bossesDefeated}
                />

                <LootPanel
                  bossesDefeated={state.bossesDefeated}
                  lastLootDrops={state.lastLootDrops || []}
                  lootHistory={state.lootHistory || []}
                />
              </>
            )}

            {activeView === "log" && (
              <>
                <ActivityLogPanel activityLog={state.activityLog || []} />

                <SanctuaryPanel state={state} classMeta={CLASS_META} />

                <EconomyPanel
                  gold={state.gold}
                  crystals={state.crystals}
                  essence={state.essence}
                  energy={state.energy}
                  lastRestTimestamp={state.lastRestTimestamp}
                  onRest={handleRest}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function HeroProgressPanel({ state, xpNeeded, xpPercent }) {
  return (
    <div className="panel hero-panel">
      <p className="eyebrow">Primary Class</p>
      <h2>
        {CLASS_META[state.primaryClass]?.icon || "✨"} {CLASS_META[state.primaryClass]?.label || state.primaryClass}
      </h2>

      <p>Active Class: {CLASS_META[state.activeClass]?.label || state.activeClass}</p>
      <p>World: {CLASS_META[state.activeClass]?.world || "Unknown"}</p>

      <div className="level-orb">
        <span>LVL</span>
        <strong>{state.level}</strong>
      </div>

      <div className="xp-bar">
        <div style={{ width: `${xpPercent}%` }} />
      </div>

      <p>
        {state.xp} / {xpNeeded} XP
      </p>
    </div>
  );
}

function calculateEnergyCost(amount) {
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return 0;
  }

  const cappedAmount = Math.min(numericAmount, 60);
  return Math.max(1, Math.floor(cappedAmount / 5));
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hrs, mins, secs]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function themeClass(themeName = "") {
  const value = themeName.toLowerCase();

  if (value.includes("arcade")) return "theme-arcade";
  if (value.includes("temple")) return "theme-temple";

  return "theme-default";
}
