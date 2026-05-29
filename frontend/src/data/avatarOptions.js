export const BODY_STYLE_MAP = {
  Lean: {
    className: "body-lean",
    label: "Lean",
    description: "Slim agile build"
  },
  Average: {
    className: "body-average",
    label: "Average",
    description: "Balanced everyday build"
  },
  Athletic: {
    className: "body-athletic",
    label: "Athletic",
    description: "Heroic action build"
  },
  Strong: {
    className: "body-strong",
    label: "Strong",
    description: "Powerful tank build"
  }
};

export const HAIR_STYLE_MAP = {
  Fade: { className: "hair-fade", label: "Fade" },
  Curly: { className: "hair-curly", label: "Curly" },
  Locs: { className: "hair-locs", label: "Locs" },
  Afro: { className: "hair-afro", label: "Afro" },
  Short: { className: "hair-short", label: "Short" },
  Long: { className: "hair-long", label: "Long" }
};

export const OUTFIT_STYLE_MAP = {
  "Novice Jacket": {
    className: "outfit-novice",
    trim: "#94a3b8",
    glow: "#64748b"
  },

  "Coder Hoodie": {
    className: "outfit-cyber",
    trim: "#22d3ee",
    glow: "#00f5ff"
  },

  "Scholar Cloak": {
    className: "outfit-scholar",
    trim: "#c084fc",
    glow: "#a855f7"
  },

  "Arena Gear": {
    className: "outfit-titan",
    trim: "#fb923c",
    glow: "#f97316"
  },

  "Arcade Jacket": {
    className: "outfit-arcade",
    trim: "#22c55e",
    glow: "#22c55e"
  },

  "Explorer Coat": {
    className: "outfit-explorer",
    trim: "#eab308",
    glow: "#facc15"
  },

  "Zen Robe": {
    className: "outfit-zen",
    trim: "#38bdf8",
    glow: "#38bdf8"
  },

  "Rhythm Jacket": {
    className: "outfit-musician",
    trim: "#ec4899",
    glow: "#f472b6"
  },

  "Battle Apron": {
    className: "outfit-chef",
    trim: "#ef4444",
    glow: "#f97316"
  },

  // old names kept so nothing breaks
  "Neon Tech Jacket": {
    className: "outfit-cyber",
    trim: "#22d3ee",
    glow: "#00f5ff"
  },
  "Cyber Runner Outfit": {
    className: "outfit-cyber",
    trim: "#22d3ee",
    glow: "#00f5ff"
  },
  "Arcane Scholar Coat": {
    className: "outfit-scholar",
    trim: "#c084fc",
    glow: "#a855f7"
  },
  "Arcane Scholar Outfit": {
    className: "outfit-scholar",
    trim: "#c084fc",
    glow: "#a855f7"
  },
  "Titan Arena Gear": {
    className: "outfit-titan",
    trim: "#fb923c",
    glow: "#f97316"
  },
  "Titan Flame Outfit": {
    className: "outfit-titan",
    trim: "#fb923c",
    glow: "#f97316"
  },
  "RGB Arcade Hoodie": {
    className: "outfit-arcade",
    trim: "#22c55e",
    glow: "#22c55e"
  },
  "Explorer Utility Vest": {
    className: "outfit-explorer",
    trim: "#eab308",
    glow: "#facc15"
  },
  "Spirit Temple Robe": {
    className: "outfit-zen",
    trim: "#38bdf8",
    glow: "#38bdf8"
  },
  "Sound Weaver Jacket": {
    className: "outfit-musician",
    trim: "#f59e0b",
    glow: "#facc15"
  },
  "Flavor Alchemist Coat": {
    className: "outfit-chef",
    trim: "#ef4444",
    glow: "#f97316"
  }
};

export function getBodyClass(bodyType = "Average") {
  return BODY_STYLE_MAP[bodyType]?.className || BODY_STYLE_MAP.Average.className;
}

export function getHairClass(hairStyle = "Fade") {
  return HAIR_STYLE_MAP[hairStyle]?.className || HAIR_STYLE_MAP.Fade.className;
}

export function getOutfitClass(outfit = "Novice Jacket") {
  return (
    OUTFIT_STYLE_MAP[outfit]?.className ||
    OUTFIT_STYLE_MAP["Novice Jacket"].className
  );
}

export function getOutfitTheme(outfit = "Novice Jacket") {
  return OUTFIT_STYLE_MAP[outfit] || OUTFIT_STYLE_MAP["Novice Jacket"];
}