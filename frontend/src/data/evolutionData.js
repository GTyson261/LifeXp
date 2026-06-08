export const EVOLUTION_DATA = {
  NOVICE: [
    { level: 1, title: "Awakened Novice", outfit: "Novice Jacket" },
    { level: 10, title: "Path Seeker", outfit: "Starter Gear" },
    { level: 25, title: "Rising Hero", outfit: "Hero Gear" }
  ],

  CODER: [
    { level: 1, title: "Code Initiate", outfit: "Coder Hoodie" },
    { level: 10, title: "Developer", outfit: "Cyber Jacket" },
    { level: 25, title: "Software Architect", outfit: "Tech Armor" },
    { level: 50, title: "AI Engineer", outfit: "Neural Suit" }
  ],

  GAMER: [
    { level: 1, title: "Arcade Rookie", outfit: "Arcade Jacket" },
    { level: 10, title: "Combo Breaker", outfit: "Neon Gear" },
    { level: 25, title: "Raid Champion", outfit: "Pixel Armor" },
    { level: 50, title: "Game Legend", outfit: "Mythic Controller Suit" }
  ],

  BOOKWORM: [
    { level: 1, title: "Page Turner", outfit: "Scholar Cloak" },
    { level: 10, title: "Lore Keeper", outfit: "Rune Robe" },
    { level: 25, title: "Archivist", outfit: "Ancient Library Coat" },
    { level: 50, title: "Grand Scholar", outfit: "Mythic Tome Robe" }
  ],

  EXPLORER: [
    { level: 1, title: "Trail Walker", outfit: "Explorer Coat" },
    { level: 10, title: "Frontier Seeker", outfit: "Utility Vest" },
    { level: 25, title: "Pathfinder", outfit: "Compass Armor" },
    { level: 50, title: "World Ranger", outfit: "Legendary Scout Gear" }
  ],

  ZEN: [
    { level: 1, title: "Quiet Mind", outfit: "Zen Robe" },
    { level: 10, title: "Life Sage", outfit: "Spirit Wrap" },
    { level: 25, title: "Balance Master", outfit: "Temple Robe" },
    { level: 50, title: "Ascended Monk", outfit: "Celestial Garb" }
  ],

  MUSICIAN: [
    { level: 1, title: "Rhythm Starter", outfit: "Rhythm Jacket" },
    { level: 10, title: "Rhythm Caster", outfit: "Stage Coat" },
    { level: 25, title: "Sound Mage", outfit: "Neon Performer Gear" },
    { level: 50, title: "Concert Legend", outfit: "Mythic Sound Suit" }
  ],

  CHEF: [
    { level: 1, title: "Kitchen Rookie", outfit: "Battle Apron" },
    { level: 10, title: "Flame Artisan", outfit: "Heat Apron" },
    { level: 25, title: "Culinary Alchemist", outfit: "Inferno Coat" },
    { level: 50, title: "Master Chef Hero", outfit: "Legendary Flame Gear" }
  ],

  SPORT_MASTER: [
    { level: 1, title: "Training Rookie", outfit: "Arena Gear" },
    { level: 10, title: "Power Athlete", outfit: "Titan Gear" },
    { level: 25, title: "Arena Champion", outfit: "Champion Armor" },
    { level: 50, title: "Limit Breaker", outfit: "Mythic Power Suit" }
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