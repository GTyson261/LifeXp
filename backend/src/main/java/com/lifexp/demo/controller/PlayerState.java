package com.lifexp.demo.controller;

import java.util.ArrayList;
import java.util.List;

public class PlayerState {
    public boolean introCompleted = false;

    public String primaryClass = "NOVICE";
    public String activeClass = "NOVICE";

    public int level = 1;
    public int xp = 0;
    public int skillPoints = 0;
    public int lastXpGain = 0;
    public int bossesDefeated = 0;

    public int classMastery = 0;
    public int xpPenaltyActionsLeft = 0;

    public int gold = 100;
    public int crystals = 10;
    public int essence = 0;
    public int energy = 100;

    public long lastDailyReset = System.currentTimeMillis();
    public int loginStreak = 1;
    public long lastActivityTimestamp = System.currentTimeMillis();
    public long lastRestTimestamp = 0L;

    public String title = "Gatebound Novice";
    public String pronouns = "they/them";

    public String equippedTheme = "Default Cyber Grid";
    public String equippedFrame = "Starter Frame";
    public String equippedAura = "Starter Glow";

    public String currentWorldId = "world_gate";

    public Avatar avatar = new Avatar();

    public Boss currentBoss = new Boss(
            "Procrastination King",
            "A shadow ruler that grows stronger whenever you delay your goals.",
            500,
            500
    );

    public List<String> activityLog = new ArrayList<>();
    public List<String> lastLootDrops = new ArrayList<>();
    public List<String> lootHistory = new ArrayList<>();
    public List<Quest> dailyQuests = new ArrayList<>();
    public List<Skill> skills = new ArrayList<>();
    public List<Achievement> achievements = new ArrayList<>();
    public List<ShopItem> shopItems = new ArrayList<>();
    public List<InventoryItem> inventory = new ArrayList<>();
    public List<WorldZone> worlds = new ArrayList<>();

    public PlayerState() {
        activityLog.add("LifeXP initialized. The gate is waiting.");

        dailyQuests.add(new Quest("q1", "Start Your Grind", "Complete any real-life action today.", false, false, 40, 15));
        dailyQuests.add(new Quest("q2", "Focus Spark", "Complete a focus, coding, or reading session.", false, false, 55, 20));
        dailyQuests.add(new Quest("q3", "Boss Damage", "Damage the current boss with any activity.", false, false, 65, 25));

        skills.add(new Skill("s1", "XP Flow", "Gain +5 bonus XP from every activity.", false));
        skills.add(new Skill("s2", "Iron Focus", "Focus and coding actions deal extra boss damage.", false));
        skills.add(new Skill("s3", "Loot Sense", "Gain more gold from completed actions.", false));
        skills.add(new Skill("s4", "Aura Control", "Unlock stronger visual aura effects.", false));

        achievements.add(new Achievement("a1", "Night Architect", "Complete a coding action.", false));
        achievements.add(new Achievement("a2", "Lore Keeper", "Complete a reading action.", false));
        achievements.add(new Achievement("a3", "Boss Breaker", "Defeat your first boss.", false));
        achievements.add(new Achievement("a4", "Life Sage", "Reach level 5.", false));
        achievements.add(new Achievement("a5", "First Victory", "Claim your first boss loot drop.", false));
        achievements.add(new Achievement("a6", "Loot Hunter", "Defeat 3 bosses.", false));

        shopItems.add(new ShopItem("shop_aura_blue", "Blue Terminal Aura", "aura", "gold", 75, "A glowing coder-style aura."));
        shopItems.add(new ShopItem("shop_aura_purple", "Purple Rune Aura", "aura", "crystals", 5, "A magical bookworm aura."));
        shopItems.add(new ShopItem("shop_theme_arcade", "Arcade Nexus Theme", "theme", "gold", 120, "RGB arcade dashboard theme."));
        shopItems.add(new ShopItem("shop_theme_temple", "Spirit Temple Theme", "theme", "essence", 4, "Calm spiritual dashboard theme."));
        shopItems.add(new ShopItem("shop_frame_legend", "Legendary Neon Frame", "frame", "crystals", 8, "A glowing profile frame."));
        shopItems.add(new ShopItem("shop_outfit_cyber", "Cyber Runner Outfit", "outfit", "gold", 90, "A futuristic neon jacket."));
        shopItems.add(new ShopItem("shop_outfit_scholar", "Arcane Scholar Outfit", "outfit", "gold", 90, "A magical library coat."));

        inventory.add(new InventoryItem("starter_frame", "Starter Frame", "frame", true));
        inventory.add(new InventoryItem("starter_aura", "Starter Glow", "aura", true));
        inventory.add(new InventoryItem("starter_theme", "Default Cyber Grid", "theme", true));

        worlds.add(new WorldZone("world_gate", "Awakening Gate", "NOVICE", "Procrastination King", "Your starting zone.", true));
        worlds.add(new WorldZone("world_cyber", "Cyber District", "CODER", "Bug Lord", "A neon city powered by code.", true));
        worlds.add(new WorldZone("world_knowledge", "Knowledge Forest", "BOOKWORM", "Forgetfulness Wraith", "A glowing forest of books and memory.", true));
        worlds.add(new WorldZone("world_arena", "Titan Arena", "SPORT_MASTER", "Burnout Titan", "A battle zone for physical discipline.", true));
        worlds.add(new WorldZone("world_arcade", "Arcade Nexus", "GAMER", "Doomscroll Phantom", "A chaotic RGB world of focus and reflex.", true));
        worlds.add(new WorldZone("world_frontier", "Lost Frontier", "EXPLORER", "Fear of Unknown", "A map-based world for discovery.", true));
        worlds.add(new WorldZone("world_temple", "Spirit Temple", "ZEN", "Stress Serpent", "A calm temple for meditation and balance.", true));
        worlds.add(new WorldZone("world_rhythm", "Rhythm Realm", "MUSICIAN", "Silence Reaper", "A soundwave world for practice and flow.", true));
        worlds.add(new WorldZone("world_culinary", "Culinary Kingdom", "CHEF", "Chaos Chef", "A fire-and-steam world for cooking mastery.", true));
    }

    public static class Avatar {
        public String gender = "Custom";
        public String pronouns = "they/them";
        public String bodyType = "Average";
        public String skinTone = "#8d5524";
        public String hairStyle = "Fade";
        public String outfit = "Novice Jacket";
        public String aura = "Starter Glow";
    }

    public static class Boss {
        public String name;
        public String description;
        public int hp;
        public int maxHp;

        public Boss(String name, String description, int hp, int maxHp) {
            this.name = name;
            this.description = description;
            this.hp = hp;
            this.maxHp = maxHp;
        }
    }

    public static class Quest {
        public String id;
        public String name;
        public String description;
        public boolean completed;
        public boolean claimed;
        public int rewardXp;
        public int rewardGold;

        public Quest(String id, String name, String description, boolean completed, boolean claimed, int rewardXp, int rewardGold) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.completed = completed;
            this.claimed = claimed;
            this.rewardXp = rewardXp;
            this.rewardGold = rewardGold;
        }
    }

    public static class Skill {
        public String id;
        public String name;
        public String description;
        public boolean unlocked;

        public Skill(String id, String name, String description, boolean unlocked) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.unlocked = unlocked;
        }
    }

    public static class Achievement {
        public String id;
        public String name;
        public String description;
        public boolean unlocked;

        public Achievement(String id, String name, String description, boolean unlocked) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.unlocked = unlocked;
        }
    }

    public static class ShopItem {
        public String id;
        public String name;
        public String type;
        public String currency;
        public int cost;
        public String description;

        public ShopItem(String id, String name, String type, String currency, int cost, String description) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.currency = currency;
            this.cost = cost;
            this.description = description;
        }
    }

    public static class InventoryItem {
        public String id;
        public String name;
        public String type;
        public boolean equipped;

        public InventoryItem(String id, String name, String type, boolean equipped) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.equipped = equipped;
        }
    }

    public static class WorldZone {
        public String id;
        public String name;
        public String classTheme;
        public String bossName;
        public String description;
        public boolean unlocked;

        public WorldZone(String id, String name, String classTheme, String bossName, String description, boolean unlocked) {
            this.id = id;
            this.name = name;
            this.classTheme = classTheme;
            this.bossName = bossName;
            this.description = description;
            this.unlocked = unlocked;
        }
    }
}
