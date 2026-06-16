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
import ProfilePanel from "./components/ProfilePanel";
import ClassMasteryPanel from "./components/ClassMasteryPanel";
import WeeklyQuestPanel from "./components/WeeklyQuestPanel";
import BattleRecap from "./components/BattleRecap";
import AchievementToast from "./components/AchievementToast";
import SettingsPanel from "./components/SettingsPanel";
import RewardBurst from "./components/RewardBurst";
import BossEntrance from "./components/BossEntrance";
import VictoryScreen from "./components/VictoryScreen";
import DailyLoginReward from "./components/DailyLoginReward";
import FocusModePanel from "./components/FocusModePanel";
import CompanionPanel from "./components/CompanionPanel";
import FriendlyBattlePanel from "./components/FriendlyBattlePanel";
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
  claimDailyLoginReward,
  resetGame,
  registerUser,
  loginUser,
  getStoredSession,
  clearStoredSession,
  createFriendlyBattleRoom,
  joinFriendlyBattleRoom,
  getFriendlyBattleRoom,
  chooseFriendlyBattleMove,
  leaveFriendlyBattleRoom,
  getFriendlyBattleInvites,
  getActiveFriendlyBattleRoom,
  joinFriendlyBattleMatchmaking,
  leaveFriendlyBattleMatchmaking,
  getFriendlyBattleHistory,
  getFriendlyBattleStats,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest
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
  { key: "profile", label: "Profile", icon: "◉" },
  { key: "avatar", label: "Avatar", icon: "♙" },
  { key: "quests", label: "Quests", icon: "◇" },
  { key: "shop", label: "Shop", icon: "◈" },
  { key: "friends", label: "Battle", icon: "⚔" },
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

const INTRO_MODEL_TYPES = ["Male", "Female"];

const INTRO_BODY_TYPES = ["Lean", "Average", "Athletic", "Strong"];

const INTRO_HAIR_STYLES = [
  "Fade",
  "Curly",
  "Locs",
  "Afro",
  "Short",
  "Long"
];

const INTRO_OUTFITS = [
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

const INTRO_SKIN_TONES = [
  "#f1d1b5",
  "#e0ac69",
  "#c68642",
  "#a66a3f",
  "#8d5524",
  "#6b3f28",
  "#4b2a1f"
];

const INTRO_HAIR_COLORS = [
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

const INTRO_CLASS_OUTFITS = {
  CODER: "Coder Hoodie",
  BOOKWORM: "Scholar Cloak",
  SPORT_MASTER: "Arena Gear",
  GAMER: "Arcade Jacket",
  EXPLORER: "Explorer Coat",
  ZEN: "Zen Robe",
  MUSICIAN: "Rhythm Jacket",
  CHEF: "Battle Apron"
};

function getRandomIntroItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeAvatarDraft(avatar = {}) {
  return JSON.stringify({
    displayName: avatar.displayName || "",
    gender: avatar.gender === "Female" ? "Female" : "Male",
    pronouns: avatar.pronouns || "",
    bodyType: avatar.bodyType || "Average",
    skinTone: avatar.skinTone || "#8d5524",
    hairStyle: avatar.hairStyle || "Fade",
    hairColor: avatar.hairColor || "#020617",
    outfit: avatar.outfit || "Novice Jacket",
    aura: avatar.aura || "Starter Glow"
  });
}

function cosmeticUnlocksFromState(state) {
  const ownedOutfits = new Set([
    "Novice Jacket",
    state?.avatar?.outfit
  ]);

  const ownedAuras = new Set([
    "Starter Glow",
    state?.avatar?.aura
  ]);

  const ownedFrames = new Set([
    "Starter Frame",
    state?.equippedFrame
  ]);

  (state?.inventory || []).forEach((item) => {
    if (item.type === "outfit") ownedOutfits.add(item.name);
    if (item.type === "aura") ownedAuras.add(item.name);
    if (item.type === "frame") ownedFrames.add(item.name);
  });

  return {
    outfits: ownedOutfits,
    auras: ownedAuras,
    frames: ownedFrames
  };
}

function bossPhase(boss) {
  if (!boss?.maxHp) return "Active";
  const percent = Math.max(0, Math.round((boss.hp / boss.maxHp) * 100));

  if (percent <= 25) return "Enraged";
  if (percent <= 50) return "Wounded";
  return "Active";
}

function findNewAchievement(previousState, nextState) {
  const previousUnlocked = new Set(
    (previousState?.achievements || [])
      .filter((achievement) => achievement.unlocked)
      .map((achievement) => achievement.id)
  );

  return (nextState?.achievements || []).find(
    (achievement) => achievement.unlocked && !previousUnlocked.has(achievement.id)
  );
}

function createBattleRecap(previousState, nextState, label) {
  const previousBoss = previousState?.currentBoss;
  const nextBoss = nextState?.currentBoss;

  if (!nextBoss) return null;

  const previousHp = previousBoss?.hp ?? nextBoss.hp;
  const damage = Math.max(0, previousHp - nextBoss.hp);
  const phase = bossPhase(nextBoss);

  return {
    title: label,
    summary: damage > 0
      ? `${nextBoss.name} took ${damage} damage.`
      : `${nextBoss.name} is still watching your next move.`,
    xp: nextState?.lastXpGain || 0,
    damage,
    phase
  };
}

function classRankTitle(className = "NOVICE", mastery = 0, level = 1) {
  const tier = level >= 25 || mastery >= 300
    ? 3
    : level >= 10 || mastery >= 120
      ? 2
      : mastery >= 35
        ? 1
        : 0;

  const ranks = {
    CODER: ["Script Runner", "Debug Adept", "System Weaver", "Cyber Architect"],
    BOOKWORM: ["Page Scout", "Margin Mage", "Rune Scholar", "Lore Keeper"],
    SPORT_MASTER: ["Warmup Spark", "Arena Strider", "Titan Breaker", "Champion Form"],
    GAMER: ["Combo Rookie", "Quest Tactician", "Arcade Captain", "Nexus Legend"],
    EXPLORER: ["Trail Finder", "Route Maker", "Frontier Seeker", "Worldwalker"],
    ZEN: ["Quiet Breath", "Still Water", "Spirit Guide", "Life Sage"],
    MUSICIAN: ["Beat Finder", "Rhythm Caster", "Stage Current", "Sound Sage"],
    CHEF: ["Prep Flame", "Kitchen Tempo", "Flame Artisan", "Culinary Legend"],
    NOVICE: ["Gatebound Novice", "Momentum Finder", "Path Shaper", "LifeXP Hero"]
  };

  return (ranks[className] || ranks.NOVICE)[tier];
}

function isDailyRewardAvailable(state) {
  if (!state) return false;
  return state.lastLoginRewardDate !== new Date().toISOString().slice(0, 10);
}

function playFeedbackTone(kind, enabled) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequency = kind === "victory" ? 740 : kind === "boss" ? 180 : kind === "claim" ? 520 : 360;

    oscillator.type = kind === "boss" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.35, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
  } catch {
    // Audio feedback is optional and should never interrupt gameplay.
  }
}

export default function App() {
  const [session, setSession] = useState(() => getStoredSession());
  const [state, setState] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [introStep, setIntroStep] = useState("origin");
  const [introClass, setIntroClass] = useState("CODER");
  const [introName, setIntroName] = useState("");
  const [introPronouns, setIntroPronouns] = useState("they/them");
  const [avatarSaveStatus, setAvatarSaveStatus] = useState("saved");
  const [lockedOutfitPreview, setLockedOutfitPreview] = useState("");
  const [battleRecap, setBattleRecap] = useState(null);
  const [achievementToast, setAchievementToast] = useState(null);
  const [rewardBurst, setRewardBurst] = useState(null);
  const [bossEntrance, setBossEntrance] = useState(null);
  const [victoryReward, setVictoryReward] = useState(null);
  const [dailyRewardVisible, setDailyRewardVisible] = useState(false);
  const [battleRoom, setBattleRoom] = useState(null);
  const [battleCode, setBattleCode] = useState("");
  const [battleError, setBattleError] = useState("");
  const [friends, setFriends] = useState({ friends: [], incomingRequests: [], outgoingRequests: [] });
  const [friendUsername, setFriendUsername] = useState("");
  const [friendError, setFriendError] = useState("");
  const [battleInvites, setBattleInvites] = useState([]);
  const [matchmakingStatus, setMatchmakingStatus] = useState("");
  const [battleHistory, setBattleHistory] = useState([]);
  const [battleStats, setBattleStats] = useState(null);
  const [selectedFriendUsername, setSelectedFriendUsername] = useState("");
  const [socialToast, setSocialToast] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem("lifexp_reduce_motion") === "true");
  const [compactMobile, setCompactMobile] = useState(() => localStorage.getItem("lifexp_compact_mobile") === "true");
  const [audioFeedback, setAudioFeedback] = useState(() => localStorage.getItem("lifexp_audio_feedback") === "true");

  const [activityType, setActivityType] = useState("coding");
  const [amount, setAmount] = useState("");
  const [summary, setSummary] = useState("");
  const [verified, setVerified] = useState(false);

  const [timerActivity, setTimerActivity] = useState("coding");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [floatingXp, setFloatingXp] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  async function loadGame() {
    if (!getStoredSession()) {
      setState(null);
      return;
    }

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
      setIntroStep("origin");
    } catch (error) {
      if ((error.message || "").toLowerCase().includes("log in")) {
        setSession(null);
      }
      setLoadError(error.message || "Could not connect to the LifeXP backend.");
    }
  }

  useEffect(() => {
    if (session) {
      loadGame();
    }
  }, [session]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    localStorage.setItem("lifexp_reduce_motion", String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem("lifexp_compact_mobile", String(compactMobile));
  }, [compactMobile]);

  useEffect(() => {
    localStorage.setItem("lifexp_audio_feedback", String(audioFeedback));
  }, [audioFeedback]);

  useEffect(() => {
    if (state?.introCompleted && isDailyRewardAvailable(state)) {
      setDailyRewardVisible(true);
    }
  }, [state?.introCompleted, state?.lastLoginRewardDate]);

  useEffect(() => {
    if (activeView !== "friends" || !battleRoom?.code) return;

    const interval = setInterval(async () => {
      try {
        setBattleRoom(await getFriendlyBattleRoom(battleRoom.code));
      } catch {
        // Manual refresh will show actionable errors; silent polling should stay quiet.
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeView, battleRoom?.code]);

  useEffect(() => {
    if (activeView !== "friends") return;
    handleRefreshFriends();
    handleRefreshBattleInvites();
    handleRefreshBattleHistory({ quiet: true });
    handleRefreshBattleStats({ quiet: true });
  }, [activeView]);

  useEffect(() => {
    if (activeView !== "friends") return;

    const interval = setInterval(() => {
      handleRefreshFriends({ quiet: true });
      handleRefreshBattleInvites({ quiet: true });
      handleRefreshBattleStats({ quiet: true });
      if (battleRoom?.code) {
        handleRefreshBattleRoom({ quiet: true });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeView, battleRoom?.code]);

  useEffect(() => {
    if (!socialToast) return;
    const timeout = setTimeout(() => setSocialToast(null), 3600);
    return () => clearTimeout(timeout);
  }, [socialToast]);

  const hasUnsavedAvatarChanges = Boolean(
    state?.avatar &&
    avatarDraft &&
    normalizeAvatarDraft(avatarDraft) !== normalizeAvatarDraft(state.avatar)
  );

  useEffect(() => {
    if (hasUnsavedAvatarChanges) {
      setAvatarSaveStatus("unsaved");
    }
  }, [hasUnsavedAvatarChanges]);

  useEffect(() => {
    function warnBeforeLeave(event) {
      if (!hasUnsavedAvatarChanges) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [hasUnsavedAvatarChanges]);

  async function submitAuth(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");

    try {
      const nextSession = authMode === "register"
        ? await registerUser({ username: authUsername, password: authPassword })
        : await loginUser({ username: authUsername, password: authPassword });

      setSession({ token: nextSession.token, username: nextSession.username });
      setState(nextSession.player);
      setAvatarDraft({
        ...(nextSession.player.avatar || {}),
        displayName: nextSession.player.playerName || nextSession.player.avatar?.displayName || nextSession.username,
        pronouns: nextSession.player.pronouns || nextSession.player.avatar?.pronouns || "they/them"
      });
      setShowIntro(!nextSession.player.introCompleted);
      setIntroStep("origin");
      setAuthPassword("");
    } catch (error) {
      setAuthError(error.message || "Could not sign in.");
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    clearStoredSession();
    setSession(null);
    setState(null);
    setAvatarDraft(null);
    setLoadError("");
  }

  if (!session) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        username={authUsername}
        setUsername={setAuthUsername}
        password={authPassword}
        setPassword={setAuthPassword}
        error={authError}
        busy={authBusy}
        onSubmit={submitAuth}
      />
    );
  }

  if (!state && loadError) {
    return (
      <div className="loading-screen loading-error-screen">
        <div className="loading-error-card">
          <div className="boot-card-header">
            <span>!</span>
            <div>
              <p className="eyebrow">Connection Needed</p>
              <h1>LifeXP backend is offline</h1>
              <p>
                Start the Spring Boot backend on port 8080, then retry the dashboard.
              </p>
            </div>
          </div>
          <div className="boot-status-grid">
            <span><small>Frontend</small><strong>Online</strong></span>
            <span><small>Backend</small><strong>Offline</strong></span>
            <span><small>Port</small><strong>8080</strong></span>
          </div>
          <button type="button" onClick={loadGame}>
            Retry Connection
          </button>
          <button type="button" onClick={logout}>
            Log Out
          </button>
          <small>{loadError}</small>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="loading-screen">
        <div className="boot-card">
          <p className="eyebrow">Live Season Build</p>
          <h1>Booting LifeXP</h1>
          <div className="boot-progress-track">
            <span />
          </div>
          <div className="boot-status-grid">
            <span><small>Auth</small><strong>Linked</strong></span>
            <span><small>Save</small><strong>Loading</strong></span>
            <span><small>World</small><strong>Syncing</strong></span>
          </div>
        </div>
      </div>
    );
  }

  const activeClass = state.primaryClass || state.activeClass || "NOVICE";
  const meta = CLASS_META[activeClass] || CLASS_META.NOVICE;
  const xpNeeded = state.level * 100;
  const xpPercent = Math.min(100, Math.round((state.xp / xpNeeded) * 100));
  const navSignals = getDashboardNavSignals(state, activeClass);
  const navReadiness = getDashboardNavReadiness(state, activeClass);

  function showXp(xp) {
    setFloatingXp(`+${xp} XP`);
    setTimeout(() => setFloatingXp(null), 1200);
  }

  function showRewardBurst(reward) {
    setRewardBurst({ id: Date.now(), ...reward });
    setTimeout(() => setRewardBurst(null), 1600);
  }

  function applyGameStateUpdate(updated, options = {}) {
    const previousState = state;
    const newAchievement = findNewAchievement(previousState, updated);
    const bossChanged = previousState?.currentBoss?.name !== updated?.currentBoss?.name;
    const bossDefeated = (updated?.bossesDefeated || 0) > (previousState?.bossesDefeated || 0);

    setState(updated);
    setAvatarDraft(updated.avatar);

    if (newAchievement) {
      setAchievementToast(newAchievement);
      setTimeout(() => setAchievementToast(null), 4200);
    }

    if (options.recapLabel) {
      setBattleRecap(createBattleRecap(previousState, updated, options.recapLabel));
    }

    if ((options.bossEntrance || bossChanged) && updated?.currentBoss) {
      setBossEntrance({ id: Date.now(), boss: updated.currentBoss, activeClass: updated.activeClass });
      setTimeout(() => setBossEntrance(null), 1700);
      playFeedbackTone("boss", audioFeedback);
    }

    if (bossDefeated) {
      setVictoryReward({
        id: Date.now(),
        bossName: previousState?.currentBoss?.name || "World Boss",
        loot: updated.lastLootDrops || []
      });
      playFeedbackTone("victory", audioFeedback);
    }
  }

  async function openGate() {
    const trimmedName = introName.trim();
    const trimmedPronouns = introPronouns.trim() || "they/them";
    const selectedGender =
      avatarDraft?.gender === "Female" ? "Female" : "Male";

    if (!trimmedName) {
      return;
    }

    await updateAvatar({
      ...(avatarDraft || state.avatar || {}),
      displayName: trimmedName,
      pronouns: trimmedPronouns,
      gender: selectedGender
    });

    const updated = await chooseIntroClass(introClass);

    setState(updated);
    setAvatarDraft({
      ...(updated.avatar || {}),
      displayName: updated.playerName || trimmedName,
      pronouns: updated.pronouns || trimmedPronouns,
      gender: selectedGender
    });
    setIntroStep("avatar");
  }

  async function finishIntroCustomization() {
    const saved = await updateAvatar(avatarDraft || state.avatar || {});

    const updated = await completeActivity({
      type: "intro",
      amount: 0,
      summary: `Opened the ${CLASS_META[introClass]?.world || "LifeXP"} Gate`,
      verified: true
    });

    setState({
      ...updated,
      avatar: saved.avatar || updated.avatar
    });
    setAvatarDraft(saved.avatar || updated.avatar);
    setIntroStep("reveal");
    setActiveView("avatar");

    setTimeout(() => {
      setShowIntro(false);
      setIntroStep("origin");
    }, 1900);
  }

  async function handleClassChoice(className) {
    const currentAvatar = avatarDraft || state?.avatar || {};
    const updated = await changePrimaryClassAtSanctuary(className);

    const preservedAvatar = {
      ...(updated.avatar || {}),
      displayName: currentAvatar.displayName || updated.playerName || "PlayerOne",
      pronouns: currentAvatar.pronouns || updated.pronouns || "they/them",
      gender: currentAvatar.gender || updated.avatar?.gender,
      bodyType: currentAvatar.bodyType || updated.avatar?.bodyType,
      skinTone: currentAvatar.skinTone || updated.avatar?.skinTone,
      hairStyle: currentAvatar.hairStyle || updated.avatar?.hairStyle,
      hairColor: currentAvatar.hairColor || updated.avatar?.hairColor
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
    playFeedbackTone("claim", audioFeedback);
    applyGameStateUpdate(updated, { recapLabel: `${ACTIVITIES.find((activity) => activity.key === activityType)?.label || "Action"} complete` });
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
    playFeedbackTone("claim", audioFeedback);
    applyGameStateUpdate(updated, { recapLabel: `Timer ${timerActivity} complete` });
    setTimerRunning(false);
    setTimerSeconds(0);
  }

  async function saveAvatar() {
    setAvatarSaveStatus("saving");
    const updated = await updateAvatar(avatarDraft);
    setState(updated);
    setAvatarDraft(updated.avatar);
    setAvatarSaveStatus("saved");
  }

  function handleDashboardTabChange(nextView) {
    if (hasUnsavedAvatarChanges && activeView === "avatar" && nextView !== "avatar") {
      setAvatarSaveStatus("unsaved");
    }

    if (nextView !== "avatar") {
      setLockedOutfitPreview("");
    }

    setActiveView(nextView);
  }

  async function handleBuyItem(itemId) {
    const updated = await buyShopItem(itemId);
    applyGameStateUpdate(updated);
  }

  async function handleEquipItem(itemId) {
    const updated = await equipInventoryItem(itemId);
    applyGameStateUpdate(updated);
  }

  async function handleTravel(worldId) {
    const updated = await travelToWorld(worldId);
    applyGameStateUpdate(updated, { recapLabel: "World travel", bossEntrance: true });
  }

  async function handleRest() {
    const updated = await restEnergy();
    applyGameStateUpdate(updated);
  }

  async function handleUnlockSkill(skillId) {
    const updated = await unlockSkill(skillId);
    applyGameStateUpdate(updated);
  }

  async function handleClaimQuest(questId) {
    const quest = (state.dailyQuests || []).find((item) => item.id === questId);
    const updated = await claimQuest(questId);
    if (updated.lastXpGain > 0) {
      showXp(updated.lastXpGain);
    }
    showRewardBurst({
      xp: quest?.rewardXp || 0,
      gold: quest?.rewardGold || 0,
      essence: quest?.rewardEssence || 0
    });
    playFeedbackTone("claim", audioFeedback);
    applyGameStateUpdate(updated, { recapLabel: "Quest reward claimed" });
  }

  async function handleClaimDailyReward() {
    const previousGold = state.gold;
    const previousCrystals = state.crystals;
    const previousEssence = state.essence;
    const updated = await claimDailyLoginReward();

    showRewardBurst({
      xp: 0,
      gold: Math.max(0, updated.gold - previousGold),
      crystals: Math.max(0, updated.crystals - previousCrystals),
      essence: Math.max(0, updated.essence - previousEssence)
    });
    setDailyRewardVisible(false);
    playFeedbackTone("claim", audioFeedback);
    applyGameStateUpdate(updated);
  }

  async function handleQuickFocusAction(actionType = "focus") {
    const sanitizedType = actionType === "any" || actionType === "boss_damage" || actionType === "travel"
      ? "focus"
      : actionType;
    const updated = await completeActivity({
      type: sanitizedType,
      amount: 10,
      summary: "Quick focus mode action",
      verified: true
    });

    showXp(updated.lastXpGain);
    playFeedbackTone("claim", audioFeedback);
    applyGameStateUpdate(updated, { recapLabel: "Focus mode action" });
  }

  async function handleCreateBattleRoom(invitedUsername = "") {
    try {
      setBattleError("");
      const room = await createFriendlyBattleRoom(invitedUsername);
      setBattleRoom(room);
      setBattleCode(room.code || "");
      if (invitedUsername) {
        setSocialToast({ title: "Battle invite sent", message: `@${invitedUsername} can join from their Battle tab.` });
      }
      playFeedbackTone("boss", audioFeedback);
    } catch (error) {
      setBattleError(error.message || "Could not create battle room.");
    }
  }

  async function handleJoinBattleRoom(event) {
    event.preventDefault();

    try {
      setBattleError("");
      const room = await joinFriendlyBattleRoom(battleCode);
      setBattleRoom(room);
      setBattleInvites((current) => current.filter((invite) => invite.code !== room.code));
      playFeedbackTone("boss", audioFeedback);
    } catch (error) {
      setBattleError(error.message || "Could not join battle room.");
    }
  }

  async function handleRefreshBattleRoom(options = {}) {
    if (!battleRoom?.code) {
      await handleReconnectBattle();
      return;
    }

    try {
      if (!options.quiet) setBattleError("");
      setBattleRoom(await getFriendlyBattleRoom(battleRoom.code));
      if (!options.quiet) {
        setSocialToast({ title: "Battle refreshed", message: "Room state is up to date." });
      }
    } catch (error) {
      if (!options.quiet) setBattleError(error.message || "Could not refresh battle room.");
    }
  }

  async function handleLeaveBattleRoom() {
    if (!battleRoom?.code) return;

    try {
      setBattleError("");
      await leaveFriendlyBattleRoom(battleRoom.code);
      setBattleRoom(null);
      setBattleCode("");
      setMatchmakingStatus("");
      setSocialToast({ title: "Left battle", message: "You are out of the room and can start another match." });
      handleRefreshBattleStats({ quiet: true });
      handleRefreshBattleHistory({ quiet: true });
    } catch (error) {
      setBattleError(error.message || "Could not leave battle room.");
    }
  }

  async function handleChooseBattleMove(move) {
    if (!battleRoom?.code) return;

    try {
      setBattleError("");
      const updatedRoom = await chooseFriendlyBattleMove(battleRoom.code, move, battleRoom.round || 0);
      setBattleRoom(updatedRoom);
      if (updatedRoom.status === "COMPLETE") {
        handleRefreshBattleHistory({ quiet: true });
      }
      playFeedbackTone(updatedRoom.lastResult ? "victory" : "claim", audioFeedback);
    } catch (error) {
      setBattleError(error.message || "Could not lock in battle move.");
    }
  }

  async function handleReconnectBattle() {
    try {
      setBattleError("");
      const room = await getActiveFriendlyBattleRoom();
      if (room) {
        setBattleRoom(room);
        setBattleCode(room.code || "");
        setSocialToast({ title: "Battle restored", message: "You reconnected to your active room." });
      } else {
        setSocialToast({ title: "No active battle", message: "Create a room or join matchmaking to start one." });
      }
    } catch (error) {
      setBattleError(error.message || "Could not reconnect to battle.");
    }
  }

  async function handleJoinMatchmaking() {
    try {
      setBattleError("");
      const result = await joinFriendlyBattleMatchmaking();
      setMatchmakingStatus(result.status);
      if (result.room) {
        setBattleRoom(result.room);
        setBattleCode(result.room.code || "");
        setSocialToast({ title: "Match found", message: "A friendly opponent is ready." });
        playFeedbackTone("boss", audioFeedback);
      } else {
        setSocialToast({ title: "Searching for match", message: "Keep this tab open while another player joins." });
      }
      handleRefreshBattleStats({ quiet: true });
    } catch (error) {
      setBattleError(error.message || "Could not join matchmaking.");
    }
  }

  async function handleLeaveMatchmaking() {
    try {
      setBattleError("");
      const result = await leaveFriendlyBattleMatchmaking();
      setMatchmakingStatus(result.status);
      setSocialToast({ title: "Queue left", message: "You left matchmaking." });
      handleRefreshBattleStats({ quiet: true });
    } catch (error) {
      setBattleError(error.message || "Could not leave matchmaking.");
    }
  }

  async function handleRefreshBattleHistory(options = {}) {
    try {
      if (!options.quiet) setBattleError("");
      setBattleHistory(await getFriendlyBattleHistory());
    } catch (error) {
      if (!options.quiet) setBattleError(error.message || "Could not load battle history.");
    }
  }

  async function handleRefreshBattleStats(options = {}) {
    try {
      if (!options.quiet) setBattleError("");
      setBattleStats(await getFriendlyBattleStats());
    } catch (error) {
      if (!options.quiet) setBattleError(error.message || "Could not load battle stats.");
    }
  }

  async function handleRefreshFriends(options = {}) {
    try {
      if (!options.quiet) setFriendError("");
      setFriends(await getFriends());
    } catch (error) {
      if (!options.quiet) setFriendError(error.message || "Could not load friends.");
    }
  }

  async function handleRefreshBattleInvites(options = {}) {
    try {
      if (!options.quiet) setBattleError("");
      setBattleInvites(await getFriendlyBattleInvites());
    } catch (error) {
      if (!options.quiet) setBattleError(error.message || "Could not load battle invites.");
    }
  }

  async function handleInviteFriend(friend) {
    await handleCreateBattleRoom(friend.username);
    await handleRefreshBattleInvites({ quiet: true });
  }

  async function handleAcceptBattleInvite(invite) {
    try {
      setBattleCode(invite.code);
      setBattleError("");
      const room = await joinFriendlyBattleRoom(invite.code);
      setBattleRoom(room);
      setBattleInvites((current) => current.filter((item) => item.code !== invite.code));
      setSocialToast({ title: "Battle joined", message: `You joined ${invite.host?.displayName || "your friend"}'s room.` });
      playFeedbackTone("boss", audioFeedback);
    } catch (error) {
      setBattleError(error.message || "Could not join battle invite.");
    }
  }

  async function handleSendFriendRequest(event) {
    event.preventDefault();

    try {
      setFriendError("");
      const updatedFriends = await sendFriendRequest(friendUsername.trim());
      setFriends(updatedFriends);
      setFriendUsername("");
      setSocialToast({ title: "Friend request sent", message: "They will appear here once they accept." });
      playFeedbackTone("claim", audioFeedback);
    } catch (error) {
      setFriendError(error.message || "Could not send friend request.");
    }
  }

  async function handleAcceptFriend(friendshipId) {
    try {
      setFriendError("");
      setFriends(await acceptFriendRequest(friendshipId));
      setSocialToast({ title: "Friend added", message: "They are now in your party list." });
      playFeedbackTone("claim", audioFeedback);
    } catch (error) {
      setFriendError(error.message || "Could not accept friend request.");
    }
  }

  async function handleDeclineFriend(friendshipId) {
    try {
      setFriendError("");
      setFriends(await declineFriendRequest(friendshipId));
    } catch (error) {
      setFriendError(error.message || "Could not update friend request.");
    }
  }

  async function hardReset() {
    const updated = await resetGame();
    setState(updated);
    setAvatarDraft(updated.avatar);
    setBattleRecap(null);
    setAchievementToast(null);
    setRewardBurst(null);
    setBossEntrance(null);
    setVictoryReward(null);
    setDailyRewardVisible(false);
    setBattleRoom(null);
    setBattleCode("");
    setBattleError("");
    setFriends({ friends: [], incomingRequests: [], outgoingRequests: [] });
    setFriendUsername("");
    setFriendError("");
    setBattleInvites([]);
    setMatchmakingStatus("");
    setBattleHistory([]);
    setBattleStats(null);
    setSelectedFriendUsername("");
    setSocialToast(null);
    setIntroClass("CODER");
    setIntroName("");
    setIntroPronouns("they/them");
    setIntroStep("origin");
    setShowIntro(true);
    setTimerRunning(false);
    setTimerSeconds(0);
  }

  if (showIntro) {
    const introMeta = CLASS_META[introClass] || CLASS_META.CODER;
    const introOpening = INTRO_OPENINGS[introClass] || INTRO_OPENINGS.CODER;
    const canOpenGate = introName.trim().length > 0;
    const introModelType = avatarDraft?.gender === "Female" ? "Female" : "Male";
    const introDossier = [
      { label: "World", value: introMeta.world },
      { label: "Role", value: introMeta.archetype },
      { label: "Starter Perk", value: introOpening.perk }
    ];
    const introPreviewState = {
      ...state,
      primaryClass: introClass,
      activeClass: introClass,
      avatar: {
        ...(avatarDraft || state.avatar || {}),
        gender: introModelType
      },
      playerName: avatarDraft?.displayName || introName || state.playerName,
      pronouns: avatarDraft?.pronouns || introPronouns || state.pronouns,
      title: `${introMeta.label} Initiate`
    };

    function setIntroModelType(modelType) {
      setAvatarDraft({
        ...(avatarDraft || state.avatar || {}),
        displayName: avatarDraft?.displayName || introName || state.playerName,
        pronouns: avatarDraft?.pronouns || introPronouns || state.pronouns,
        gender: modelType
      });
    }

    function randomizeIntroAvatar() {
      setAvatarDraft({
        ...(avatarDraft || state.avatar || {}),
        displayName: avatarDraft?.displayName || introName || state.playerName,
        pronouns: avatarDraft?.pronouns || introPronouns || state.pronouns,
        gender: getRandomIntroItem(INTRO_MODEL_TYPES),
        bodyType: getRandomIntroItem(INTRO_BODY_TYPES),
        skinTone: getRandomIntroItem(INTRO_SKIN_TONES),
        hairStyle: getRandomIntroItem(INTRO_HAIR_STYLES),
        hairColor: getRandomIntroItem(INTRO_HAIR_COLORS),
        outfit: INTRO_CLASS_OUTFITS[introClass] || getRandomIntroItem(INTRO_OUTFITS),
        aura: "Starter Glow"
      });
    }

    const introClassEffects = (
      <div className="intro-class-effects" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    );

    if (introStep === "reveal") {
      return (
        <div
          className={`intro-screen intro-reveal-screen intro-${introClass.toLowerCase()}`}
          style={{ "--intro-color": introMeta.color, "--class-color": introMeta.color }}
        >
          {introClassEffects}
          <div className="intro-reveal-card">
            <p className="eyebrow">Hero awakened</p>
            <h1>{avatarDraft?.displayName || introName || "Your Hero"}</h1>
            <div className="intro-reveal-avatar">
              <AvatarPreview
                state={introPreviewState}
                classMeta={CLASS_META}
                avatarDraft={avatarDraft}
              />
            </div>
            <strong>
              {introMeta.icon} {introMeta.label} of {introMeta.world}
            </strong>
            <span>Entering LifeXP...</span>
          </div>
        </div>
      );
    }

    if (introStep === "avatar") {
      return (
        <div
          className={`intro-screen intro-avatar-screen intro-${introClass.toLowerCase()}`}
          style={{ "--intro-color": introMeta.color, "--class-color": introMeta.color }}
        >
          {introClassEffects}
          <div className="intro-stage intro-avatar-stage">
            <section className="intro-avatar-header">
              <div>
                <p className="eyebrow">Forge your hero</p>
                <h1>Customize {avatarDraft?.displayName || introName || "your hero"}</h1>
                <p>
                  Your class is set. Shape the avatar players will see before you enter the world.
                </p>
              </div>

              <div className="intro-avatar-class-chip">
                <span>{introMeta.icon}</span>
                <strong>{introMeta.label}</strong>
                <small>{introMeta.world}</small>
              </div>

              <div className="intro-model-picker" role="group" aria-label="First character model">
                {INTRO_MODEL_TYPES.map((modelType) => (
                  <button
                    key={modelType}
                    type="button"
                    className={introModelType === modelType ? "active" : ""}
                    aria-pressed={introModelType === modelType}
                    onClick={() => setIntroModelType(modelType)}
                  >
                    <em aria-hidden="true">{modelType === "Male" ? "♂" : "♀"}</em>
                    <i
                      className={`intro-model-silhouette ${modelType === "Male" ? "model-male" : "model-female"}`}
                      aria-hidden="true"
                    >
                      <b />
                    </i>
                    <span>{modelType}</span>
                    <strong>{modelType === "Male" ? "Broader build" : "Tapered build"}</strong>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="intro-randomize-button"
                onClick={randomizeIntroAvatar}
              >
                Random Hero
              </button>
            </section>

            <section className="intro-avatar-grid">
              <AvatarPreview
                state={introPreviewState}
                classMeta={CLASS_META}
                avatarDraft={avatarDraft}
              />

              <AvatarCustomizer
                avatarDraft={avatarDraft}
                setAvatarDraft={setAvatarDraft}
                onSave={saveAvatar}
              />
            </section>

            <div className="intro-avatar-actions">
              <button
                type="button"
                className="intro-secondary-button"
                onClick={() => setIntroStep("origin")}
              >
                Back to Class Choice
              </button>
              <button
                type="button"
                className="gate-button"
                onClick={finishIntroCustomization}
              >
                Enter LifeXP
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`intro-screen intro-${introClass.toLowerCase()}`}
        style={{ "--intro-color": introMeta.color }}
      >
        {introClassEffects}
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

              <div className="intro-dossier-grid" aria-label="Selected origin dossier">
                {introDossier.map((item) => (
                  <span key={item.label}>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                  </span>
                ))}
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

  const cosmeticUnlocks = cosmeticUnlocksFromState(state);
  const rankTitle = classRankTitle(state.primaryClass || activeClass, state.classMastery, state.level);
  const avatarPreviewDraft = lockedOutfitPreview
    ? { ...(avatarDraft || state.avatar || {}), outfit: lockedOutfitPreview }
    : avatarDraft;
  const localJoinUrl = `${window.location.protocol}//${window.location.hostname}:5174`;
  const selectedFriend =
    (friends.friends || []).find((friend) => friend.username === selectedFriendUsername)
    || (friends.friends || [])[0]
    || null;
  const friendLeaderboard = [...(friends.friends || [])].sort((left, right) => {
    if (right.level !== left.level) return right.level - left.level;
    if ((right.bossesDefeated || 0) !== (left.bossesDefeated || 0)) {
      return (right.bossesDefeated || 0) - (left.bossesDefeated || 0);
    }
    return (right.xp || 0) - (left.xp || 0);
  });

  return (
    <main
      className={[
        "app-shell",
        themeClass(state.equippedTheme),
        `class-${activeClass.toLowerCase()}`,
        reduceMotion ? "reduce-motion" : "",
        compactMobile ? "compact-mobile" : ""
      ].filter(Boolean).join(" ")}
      style={{ "--class-color": meta.color }}
    >
      {floatingXp && <div className="floating-xp">{floatingXp}</div>}
      <div className="game-backdrop" aria-hidden="true">
        <span className="game-backdrop-grid" />
        <span className="game-backdrop-scanline" />
        <span className="game-backdrop-vignette" />
      </div>
      <RewardBurst reward={rewardBurst} />
      <BossEntrance
        boss={bossEntrance?.boss}
        activeClass={bossEntrance?.activeClass || activeClass}
        classMeta={CLASS_META}
      />
      <VictoryScreen
        reward={victoryReward}
        onDismiss={() => setVictoryReward(null)}
      />
      {dailyRewardVisible && isDailyRewardAvailable(state) && (
        <DailyLoginReward
          state={state}
          onClaim={handleClaimDailyReward}
          onDismiss={() => setDailyRewardVisible(false)}
        />
      )}
      <AchievementToast
        achievement={achievementToast}
        onDismiss={() => setAchievementToast(null)}
      />

      <div className="premium-dashboard-layout">
        <div className="premium-dashboard-main">
          <DashboardHUD
            state={{ ...state, onReset: hardReset, onRest: handleRest }}
            classMeta={CLASS_META}
            rankTitle={rankTitle}
          />

          <nav className="dashboard-tabs" aria-label="Dashboard views">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-label={`Show ${tab.label} view`}
                aria-pressed={activeView === tab.key}
                className={activeView === tab.key ? "dashboard-tab active" : "dashboard-tab"}
                onClick={() => handleDashboardTabChange(tab.key)}
              >
                <span>{tab.icon}</span>
                <strong>{tab.label}</strong>
                <small>{navSignals[tab.key] || "Ready"}</small>
                <i
                  className="nav-readiness-meter"
                  aria-label={`${tab.label} readiness ${navReadiness[tab.key] || 0}%`}
                >
                  <b style={{ width: `${navReadiness[tab.key] || 0}%` }} />
                </i>
              </button>
            ))}
          </nav>

          <nav className="mobile-bottom-nav" aria-label="Mobile dashboard views">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-label={`Show ${tab.label} view`}
                aria-pressed={activeView === tab.key}
                className={activeView === tab.key ? "mobile-nav-button active" : "mobile-nav-button"}
                onClick={() => handleDashboardTabChange(tab.key)}
              >
                <span>{tab.icon}</span>
                <strong>{tab.label}</strong>
                <small>{navSignals[tab.key] || "Ready"}</small>
                <i
                  className="nav-readiness-meter"
                  aria-label={`${tab.label} readiness ${navReadiness[tab.key] || 0}%`}
                >
                  <b style={{ width: `${navReadiness[tab.key] || 0}%` }} />
                </i>
              </button>
            ))}
          </nav>

          <div className="account-strip">
            <span>Signed in as <strong>{session.username}</strong></span>
            <button type="button" onClick={logout}>Log Out</button>
          </div>

          <section className={`dashboard-grid view-${activeView}`}>
            {activeView === "overview" && (
              <>
                <HeroProgressPanel
                  state={state}
                  xpNeeded={xpNeeded}
                  xpPercent={xpPercent}
                />

                <FocusModePanel
                  state={state}
                  classMeta={CLASS_META}
                  onQuickAction={handleQuickFocusAction}
                  onOpenQuests={() => setActiveView("quests")}
                />

                <AvatarPreview
                  className="overview-detail-panel"
                  state={state}
                  classMeta={CLASS_META}
                  avatarDraft={avatarPreviewDraft}
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

                <CompanionPanel
                  state={state}
                  classMeta={CLASS_META}
                  rankTitle={rankTitle}
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
                  className="overview-detail-panel"
                  boss={state.currentBoss}
                  bossesDefeated={state.bossesDefeated}
                />

                <QuestPanel
                  className="overview-detail-panel"
                  quests={state.dailyQuests || []}
                  onClaimQuest={handleClaimQuest}
                  primaryClass={state.primaryClass}
                />

                <BattleRecap
                  recap={battleRecap}
                  onDismiss={() => setBattleRecap(null)}
                />
              </>
            )}

            {activeView === "profile" && (
              <>
                <ProfilePanel
                  state={state}
                  classMeta={CLASS_META}
                  xpNeeded={xpNeeded}
                  xpPercent={xpPercent}
                />

                <ClassMasteryPanel
                  state={state}
                  classMeta={CLASS_META}
                />

                <CompanionPanel
                  state={state}
                  classMeta={CLASS_META}
                  rankTitle={rankTitle}
                />

                <WeeklyQuestPanel
                  state={state}
                  classMeta={CLASS_META}
                />
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
                  avatarDraft={avatarPreviewDraft}
                  timerRunning={timerRunning}
                />

                <AvatarCustomizer
                  avatarDraft={avatarDraft}
                  setAvatarDraft={setAvatarDraft}
                  onSave={saveAvatar}
                  saveStatus={avatarSaveStatus}
                  hasUnsavedChanges={hasUnsavedAvatarChanges}
                  cosmeticUnlocks={cosmeticUnlocks}
                  onPreviewLockedOutfit={setLockedOutfitPreview}
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
                <QuestPanel
                  quests={state.dailyQuests || []}
                  onClaimQuest={handleClaimQuest}
                  primaryClass={state.primaryClass}
                />

                <WeeklyQuestPanel
                  state={state}
                  classMeta={CLASS_META}
                />

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

            {activeView === "friends" && (
              <>
                <FriendlyBattlePanel
                  battleRoom={battleRoom}
                  battleCode={battleCode}
                  setBattleCode={setBattleCode}
                  battleError={battleError}
                  onCreateRoom={handleCreateBattleRoom}
                  onJoinRoom={handleJoinBattleRoom}
                  onRefreshRoom={handleRefreshBattleRoom}
                  onLeaveRoom={handleLeaveBattleRoom}
                  onChooseMove={handleChooseBattleMove}
                  localJoinUrl={localJoinUrl}
                  friends={friends}
                  friendUsername={friendUsername}
                  setFriendUsername={setFriendUsername}
                  friendError={friendError}
                  onSendFriendRequest={handleSendFriendRequest}
                  onAcceptFriend={handleAcceptFriend}
                  onDeclineFriend={handleDeclineFriend}
                  onRefreshFriends={handleRefreshFriends}
                  battleInvites={battleInvites}
                  onRefreshBattleInvites={handleRefreshBattleInvites}
                  onInviteFriend={handleInviteFriend}
                  onAcceptBattleInvite={handleAcceptBattleInvite}
                  matchmakingStatus={matchmakingStatus}
                  onJoinMatchmaking={handleJoinMatchmaking}
                  onLeaveMatchmaking={handleLeaveMatchmaking}
                  onReconnectBattle={handleReconnectBattle}
                  battleHistory={battleHistory}
                  onRefreshBattleHistory={handleRefreshBattleHistory}
                  battleStats={battleStats}
                  selectedFriendUsername={selectedFriend?.username || ""}
                  selectedFriend={selectedFriend}
                  onSelectFriend={setSelectedFriendUsername}
                  friendLeaderboard={friendLeaderboard}
                  socialToast={socialToast}
                  classMeta={CLASS_META}
                />

                <CompanionPanel
                  state={state}
                  classMeta={CLASS_META}
                  rankTitle={rankTitle}
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

                <BattleRecap
                  recap={battleRecap}
                  onDismiss={() => setBattleRecap(null)}
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

                <SettingsPanel
                  username={session.username}
                  reduceMotion={reduceMotion}
                  setReduceMotion={setReduceMotion}
                  compactMobile={compactMobile}
                  setCompactMobile={setCompactMobile}
                  audioFeedback={audioFeedback}
                  setAudioFeedback={setAudioFeedback}
                  onReset={hardReset}
                  onLogout={logout}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function AuthScreen({
  mode,
  setMode,
  username,
  setUsername,
  password,
  setPassword,
  error,
  busy,
  onSubmit
}) {
  const isRegister = mode === "register";
  const authSignals = [
    { label: "Cloud Save", value: "Online" },
    { label: "Season", value: "Live" },
    { label: "Quest Feed", value: "Ready" }
  ];

  return (
    <div className="auth-screen">
      <div className="auth-launcher-shell">
        <section className="auth-launcher-panel" aria-label="LifeXP launcher status">
          <p className="eyebrow">LifeXP Launcher</p>
          <h1>Real Life RPG</h1>
          <p>Boot into your private save, sync your hero, and turn today&apos;s actions into XP.</p>

          <div className="auth-launcher-core" aria-hidden="true">
            <span />
            <strong>XP</strong>
          </div>

          <div className="auth-signal-grid">
            {authSignals.map((signal) => (
              <span key={signal.label}>
                <small>{signal.label}</small>
                <strong>{signal.value}</strong>
              </span>
            ))}
          </div>
        </section>

        <form className="auth-card" onSubmit={onSubmit}>
          <p className="eyebrow">Private LifeXP Account</p>
          <h1>{isRegister ? "Create your save" : "Log in to LifeXP"}</h1>
          <p>
            Your password is hashed before it is stored, and your game progress is saved under your username.
          </p>

          <label>
            <span>Username</span>
            <input
              type="text"
              value={username}
              placeholder="username"
              autoComplete="username"
              minLength="3"
              maxLength="32"
              onChange={(event) => setUsername(event.target.value)}
            />
            <small className="auth-helper">Use 3-32 lowercase letters, numbers, or underscores.</small>
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              placeholder="8+ characters"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength="8"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <strong className="auth-error">{error}</strong>}

          <button type="submit" disabled={busy}>
            {busy ? "Working..." : isRegister ? "Create Account" : "Log In"}
          </button>

          <button
            type="button"
            className="auth-mode-button"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
            }}
          >
            {isRegister ? "Already have an account? Log in" : "Need an account? Create one"}
          </button>
        </form>
      </div>
    </div>
  );
}

function HeroProgressPanel({ state, xpNeeded, xpPercent }) {
  const meta = CLASS_META[state.primaryClass] || CLASS_META[state.activeClass] || CLASS_META.NOVICE;
  const activeMeta = CLASS_META[state.activeClass] || meta;
  const xpRemaining = Math.max(0, xpNeeded - (state.xp || 0));

  return (
    <div className="panel hero-panel">
      <p className="eyebrow">Primary Class</p>
      <h2>
        {meta?.icon || "✨"} {meta?.label || state.primaryClass}
      </h2>

      <div className="campaign-chip-row">
        <span>Active: {activeMeta?.label || state.activeClass}</span>
        <span>World: {activeMeta?.world || "Unknown"}</span>
      </div>

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

      <div className="campaign-telemetry-grid">
        <span>
          <small>To Next</small>
          <strong>{xpRemaining} XP</strong>
        </span>
        <span>
          <small>Bosses</small>
          <strong>{state.bossesDefeated || 0}</strong>
        </span>
        <span>
          <small>Streak</small>
          <strong>{state.loginStreak || 1}</strong>
        </span>
      </div>
    </div>
  );
}

function getDashboardNavSignals(state = {}, activeClass = "NOVICE") {
  const quests = state.dailyQuests || [];
  const completedQuests = quests.filter((quest) => quest.completed).length;
  const claimReady = quests.filter((quest) => quest.completed && !quest.claimed).length;
  const inventory = state.inventory || [];
  const equippedItems = inventory.filter((item) => item.equipped).length;
  const activeWorld = (state.worlds || []).find((world) => world.id === state.currentWorldId);
  const activityCount = (state.activityLog || []).length;
  const classLabel = CLASS_META[activeClass]?.label || activeClass;

  return {
    overview: `L${state.level || 1}`,
    profile: classLabel,
    avatar: `${equippedItems} gear`,
    quests: claimReady > 0 ? `${claimReady} claim` : `${completedQuests}/${quests.length || 0}`,
    shop: `${state.gold || 0}g`,
    battle: `${state.bossesDefeated || 0} wins`,
    world: activeWorld?.name || "Map",
    log: `${activityCount} logs`
  };
}

function getDashboardNavReadiness(state = {}, activeClass = "NOVICE") {
  const quests = state.dailyQuests || [];
  const completedQuests = quests.filter((quest) => quest.completed).length;
  const claimReady = quests.filter((quest) => quest.completed && !quest.claimed).length;
  const inventory = state.inventory || [];
  const equippedItems = inventory.filter((item) => item.equipped).length;
  const worlds = state.worlds || [];
  const unlockedWorlds = worlds.filter((world) => world.unlocked).length;
  const activityCount = (state.activityLog || []).length;
  const energy = Math.max(0, Math.min(100, state.energy ?? 100));
  const boss = state.currentBoss;
  const bossPressure = boss?.maxHp ? Math.max(0, Math.round(100 - (boss.hp / boss.maxHp) * 100)) : 0;
  const mastery = Math.max(0, Math.min(100, state.classMastery || 0));
  const questPercent = quests.length === 0 ? 0 : Math.round((completedQuests / quests.length) * 100);

  return {
    overview: Math.max(energy, Math.min(100, state.level ? state.level * 12 : 12)),
    profile: Math.max(mastery, activeClass !== "NOVICE" ? 45 : 20),
    avatar: Math.min(100, equippedItems * 24 + ((state.avatar?.aura || state.equippedAura) ? 18 : 0)),
    quests: Math.max(questPercent, claimReady > 0 ? 100 : 0),
    shop: Math.min(100, Math.round(((state.gold || 0) / 600) * 100) + Math.min(25, state.crystals || 0)),
    battle: Math.max(bossPressure, Math.min(100, (state.bossesDefeated || 0) * 25)),
    world: worlds.length === 0 ? 0 : Math.round((unlockedWorlds / worlds.length) * 100),
    log: Math.min(100, activityCount * 8)
  };
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
