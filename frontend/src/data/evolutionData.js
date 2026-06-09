export const EVOLUTION_DATA = {
  NOVICE: [
    { level: 1, title: "Awakened Novice", outfit: "Novice Jacket", perk: "Learns the LifeXP basics.", mastery: "First steps through the gate." },
    { level: 10, title: "Path Seeker", outfit: "Starter Gear", perk: "Finds a stronger class identity.", mastery: "Ready to choose a true origin." },
    { level: 25, title: "Rising Hero", outfit: "Hero Gear", perk: "Turns consistency into broad power.", mastery: "A flexible hero with many paths." }
  ],

  CODER: [
    { level: 1, title: "Code Initiate", outfit: "Coder Hoodie", perk: "Coding and focus become efficient XP engines.", mastery: "Basic syntax, basic discipline." },
    { level: 10, title: "Debug Knight", outfit: "Cyber Jacket", perk: "Focused sessions cut deeper into bosses.", mastery: "Finds bugs before they spread." },
    { level: 25, title: "Systems Architect", outfit: "Tech Armor", perk: "Large builds generate stronger gold and XP gains.", mastery: "Designs structure from chaos." },
    { level: 50, title: "Neural Engineer", outfit: "Neural Suit", perk: "Coding streaks become elite boss pressure.", mastery: "Turns ideas into living systems." }
  ],

  GAMER: [
    { level: 1, title: "Arcade Rookie", outfit: "Arcade Jacket", perk: "Gaming actions earn combo gold.", mastery: "Learns to turn play into purpose." },
    { level: 10, title: "Combo Tactician", outfit: "Neon Gear", perk: "Quest rewards start stacking harder.", mastery: "Chains small wins into streaks." },
    { level: 25, title: "Raid Captain", outfit: "Pixel Armor", perk: "Gaming boss damage spikes during challenge runs.", mastery: "Coordinates goals like raids." },
    { level: 50, title: "Mythic Strategist", outfit: "Mythic Controller Suit", perk: "Quest claims and gaming sessions become high-yield combos.", mastery: "Plays the whole life map." }
  ],

  BOOKWORM: [
    { level: 1, title: "Page Turner", outfit: "Scholar Cloak", perk: "Reading with notes creates extra Essence.", mastery: "Collects useful knowledge." },
    { level: 10, title: "Rune Annotator", outfit: "Rune Robe", perk: "Long summaries become stronger XP boosts.", mastery: "Transforms notes into runes." },
    { level: 25, title: "Memory Archivist", outfit: "Ancient Library Coat", perk: "Reading boss damage and Essence rewards improve.", mastery: "Stores wisdom under pressure." },
    { level: 50, title: "Grand Lorebinder", outfit: "Mythic Tome Robe", perk: "Deep study becomes premium progression fuel.", mastery: "Binds knowledge into power." }
  ],

  EXPLORER: [
    { level: 1, title: "Trail Walker", outfit: "Explorer Coat", perk: "Travel is cheaper and discovery grants gold.", mastery: "Moves past routine." },
    { level: 10, title: "Mapbreaker", outfit: "Utility Vest", perk: "World travel grants more XP.", mastery: "Reads routes others miss." },
    { level: 25, title: "Compass Warden", outfit: "Compass Armor", perk: "Exploration actions unlock stronger boss pressure.", mastery: "Protects the path forward." },
    { level: 50, title: "World Ranger", outfit: "Legendary Scout Gear", perk: "Every new zone becomes a major reward event.", mastery: "Belongs anywhere." }
  ],

  ZEN: [
    { level: 1, title: "Quiet Mind", outfit: "Zen Robe", perk: "Meditation and focus restore energy.", mastery: "Breath before action." },
    { level: 10, title: "Stillwater Sage", outfit: "Spirit Wrap", perk: "Calm sessions protect energy better.", mastery: "Moves without panic." },
    { level: 25, title: "Balance Keeper", outfit: "Temple Robe", perk: "Focus and meditation boss damage rises.", mastery: "Turns pressure into poise." },
    { level: 50, title: "Ascended Monk", outfit: "Celestial Garb", perk: "Recovery and calm power become elite class tools.", mastery: "Peace becomes force." }
  ],

  MUSICIAN: [
    { level: 1, title: "Rhythm Starter", outfit: "Rhythm Jacket", perk: "Music practice earns bonus Crystals.", mastery: "Keeps time under friction." },
    { level: 10, title: "Loop Weaver", outfit: "Stage Coat", perk: "Music costs less energy and hits bosses harder.", mastery: "Turns repetition into skill." },
    { level: 25, title: "Sound Mage", outfit: "Neon Performer Gear", perk: "Practice sessions become crystal-rich progress.", mastery: "Shapes sound into momentum." },
    { level: 50, title: "Concert Legend", outfit: "Mythic Sound Suit", perk: "Music practice becomes a high-value creative engine.", mastery: "Commands the whole stage." }
  ],

  CHEF: [
    { level: 1, title: "Kitchen Rookie", outfit: "Battle Apron", perk: "Cooking restores energy and earns gold.", mastery: "Preps fuel for the grind." },
    { level: 10, title: "Flame Artisan", outfit: "Heat Apron", perk: "Meal prep becomes stronger recovery.", mastery: "Controls heat and habit." },
    { level: 25, title: "Culinary Alchemist", outfit: "Inferno Coat", perk: "Cooking damage and resource rewards improve.", mastery: "Turns ingredients into upgrades." },
    { level: 50, title: "Master Flame Chef", outfit: "Legendary Flame Gear", perk: "Cooking becomes elite recovery and boss pressure.", mastery: "Feeds the whole adventure." }
  ],

  SPORT_MASTER: [
    { level: 1, title: "Training Rookie", outfit: "Arena Gear", perk: "Movement costs less and restores energy.", mastery: "Builds the baseline." },
    { level: 10, title: "Endurance Striker", outfit: "Titan Gear", perk: "Walking and workouts produce stronger recovery.", mastery: "Outlasts the slump." },
    { level: 25, title: "Arena Champion", outfit: "Champion Armor", perk: "Physical actions hit bosses much harder.", mastery: "Turns training into power." },
    { level: 50, title: "Limit Breaker", outfit: "Mythic Power Suit", perk: "Movement becomes elite XP, recovery, and damage.", mastery: "Breaks the ceiling." }
  ]
};

export function getEvolution(activeClass, level) {
  const track = EVOLUTION_DATA[activeClass] || EVOLUTION_DATA.NOVICE;

  return track
    .filter((stage) => level >= stage.level)
    .at(-1) || track[0];
}

export function getNextEvolution(activeClass, level) {
  const track = EVOLUTION_DATA[activeClass] || EVOLUTION_DATA.NOVICE;

  return track.find((stage) => level < stage.level) || null;
}
