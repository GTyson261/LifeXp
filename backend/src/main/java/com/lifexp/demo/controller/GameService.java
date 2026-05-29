package com.lifexp.demo.controller;

import org.springframework.stereotype.Service;

@Service
public class GameService {
    private final SaveService saveService;
    private final DailyResetService dailyResetService;
    private PlayerState state;

    public GameService(SaveService saveService, DailyResetService dailyResetService) {
        this.saveService = saveService;
        this.dailyResetService = dailyResetService;
        this.state = saveService.loadOrCreateNew();

        dailyResetService.applyDailyResetIfNeeded(this.state);
    }

    public PlayerState getState() {
        return state;
    }

    public PlayerState reset() {
        state = saveService.resetSave();
        return state;
    }

    public PlayerState travelToWorld(String worldId) {
        if (worldId == null || worldId.isBlank()) {
            return state;
        }

        for (PlayerState.WorldZone world : state.worlds) {
            if (world.id.equals(worldId)) {
                if (!world.unlocked) {
                    state.activityLog.add(0, "World locked: " + world.name);
                    trimLog();
                    return state;
                }

                state.currentWorldId = world.id;
                state.activeClass = world.classTheme;

                int bossHp = 500 + state.level * 75;

                state.currentBoss = new PlayerState.Boss(
                        world.bossName,
                        world.description,
                        bossHp,
                        bossHp
                );

                state.activityLog.add(0, "Traveled to " + world.name + ". Boss appeared: " + world.bossName + ".");
                trimLog();
                saveState();
                return state;
            }
        }

        state.activityLog.add(0, "World not found.");
        trimLog();
        return state;
    }

    public PlayerState changePrimaryClassAtSanctuary(String className) {
        if (className == null || className.isBlank()) {
            return state;
        }

        if (state.primaryClass.equals(className)) {
            state.activityLog.add(0, "You are already bound to " + className + ".");
            trimLog();
            return state;
        }

        if (state.gold < 25) {
            state.activityLog.add(0, "Not enough Gold to change primary class at the Sanctuary.");
            trimLog();
            return state;
        }

        state.gold -= 25;
        state.primaryClass = className;
        state.activeClass = className;
        state.classMastery = 0;
        state.xpPenaltyActionsLeft = 3;

        state.title = titleForClass(className);
        state.avatar.outfit = outfitForClass(className);
        state.avatar.aura = auraForClass(className);

        state.activityLog.add(0, "Class Sanctuary complete. Primary class changed to " + className + ".");
        state.activityLog.add(0, "Class mastery reset. Temporary XP penalty active for 3 actions.");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState completeActivity(ActivityRequest request) {
        if (request == null) return state;

        dailyResetService.applyDailyResetIfNeeded(state);

        String type = safe(request.type);
        int amount = dailyResetService.sanitizeActivityAmount((int) Math.min(request.amount, 60));
        String summary = safe(request.summary);

        int energyCost = Math.max(1, amount / 5);

        if (!type.equals("intro") && state.energy < energyCost) {
            state.activityLog.add(0, "Not enough energy for this activity.");
            trimLog();
            saveState();
            return state;
        }

        if (!type.equals("intro")) {
            state.energy -= energyCost;
        }

        if (type.equals("intro")) {
            state.introCompleted = true;
            state.activityLog.add(0, "The LifeXP Gate opened.");
            trimLog();
            saveState();
            return state;
        }

        state.activeClass = activeClassForActivity(type);

        int xpGain = calculateXp(type, amount, summary, request.verified);

        if (hasSkill("s1")) {
            xpGain += 5;
        }

        if (state.xpPenaltyActionsLeft > 0) {
            xpGain = (int) Math.round(xpGain * 0.75);
            state.xpPenaltyActionsLeft--;
        }

        if (dailyResetService.isSuspiciousGain(xpGain)) {
            state.activityLog.add(0, "Suspicious XP gain blocked.");
            trimLog();
            return state;
        }

        state.lastXpGain = xpGain;
        state.lastActivityTimestamp = System.currentTimeMillis();
        state.xp += xpGain;
        state.gold += Math.max(1, xpGain / 10);

        if (state.activeClass.equals(state.primaryClass)) {
            state.classMastery += Math.max(1, xpGain / 20);
        }

        if (hasSkill("s3")) {
            state.gold += 5;
        }

        int damage = Math.max(5, xpGain / 2);

        if (hasSkill("s2") && (type.equals("coding") || type.equals("focus"))) {
            damage += 15;
        }

        damageBoss(damage);
        checkLevelUp();
        completeQuests(type);
        checkAchievements(type);

        String log = capitalize(type) + " completed: +" + xpGain + " XP";
        if (!summary.isBlank()) {
            log += " — " + summary;
        }

        state.activityLog.add(0, log);
        trimLog();
        saveState();
        return state;
    }

    public PlayerState updateAvatar(PlayerState.Avatar avatar) {
        if (avatar == null) return state;

        state.avatar = avatar;
        state.pronouns = avatar.pronouns;
        state.activityLog.add(0, "Avatar updated live.");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState rest() {
        dailyResetService.applyDailyResetIfNeeded(state);

        long now = System.currentTimeMillis();
        long cooldown = 1000L * 60 * 30;

        if (state.energy >= 100) {
            state.activityLog.add(0, "Energy is already full.");
            trimLog();
            saveState();
            return state;
        }

        if (state.lastRestTimestamp > 0 && now - state.lastRestTimestamp < cooldown) {
            long minutesLeft = Math.max(1, (cooldown - (now - state.lastRestTimestamp)) / (1000L * 60));
            state.activityLog.add(0, "Rest is on cooldown. Try again in " + minutesLeft + " minute(s).");
            trimLog();
            saveState();
            return state;
        }

        int before = state.energy;
        state.energy = Math.min(100, state.energy + 25);
        state.lastRestTimestamp = now;
        state.activityLog.add(0, "Rested and recovered " + (state.energy - before) + " energy.");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState unlockSkill(String skillId) {
        if (state.skillPoints <= 0) return state;

        for (PlayerState.Skill skill : state.skills) {
            if (skill.id.equals(skillId) && !skill.unlocked) {
                skill.unlocked = true;
                state.skillPoints -= 1;
                state.activityLog.add(0, "Unlocked skill: " + skill.name);
                trimLog();
                saveState();
                break;
            }
        }

        return state;
    }

    private int calculateXp(String type, int amount, String summary, boolean verified) {
        int xp;

        switch (type) {
            case "coding":
                xp = amount * 3;
                if (state.primaryClass.equals("CODER")) xp += 25;
                break;
            case "reading":
                xp = amount * 2;
                if (summary.length() > 80) xp += 20;
                else if (summary.length() > 30) xp += 10;
                if (state.primaryClass.equals("BOOKWORM")) xp += 25;
                break;
            case "walking":
                xp = amount * 2;
                if (state.primaryClass.equals("SPORT_MASTER")) xp += 20;
                break;
            case "workout":
                xp = amount * 4;
                if (state.primaryClass.equals("SPORT_MASTER")) xp += 25;
                break;
            case "focus":
                xp = amount * 3;
                break;
            case "meditation":
                xp = amount * 2;
                if (state.primaryClass.equals("ZEN")) xp += 25;
                break;
            case "music":
                xp = amount * 3;
                if (state.primaryClass.equals("MUSICIAN")) xp += 25;
                break;
            case "cooking":
                xp = amount * 3;
                if (state.primaryClass.equals("CHEF")) xp += 25;
                break;
            case "gaming":
                xp = amount * 2;
                if (state.primaryClass.equals("GAMER")) xp += 25;
                break;
            default:
                xp = amount;
                break;
        }

        if (verified) {
            xp = (int) Math.round(xp * 1.25);
        } else {
            xp = (int) Math.round(xp * 0.85);
        }

        return Math.max(1, xp);
    }

    private void checkLevelUp() {
        while (state.xp >= state.level * 100) {
            state.xp -= state.level * 100;
            state.level++;
            state.skillPoints++;
            state.crystals += 2;
            state.essence += 1;
            state.energy = Math.min(100, state.energy + 10);
            state.activityLog.add(0, "LEVEL UP! You reached level " + state.level + ".");
        }
    }

    private void damageBoss(int damage) {
        state.currentBoss.hp = Math.max(0, state.currentBoss.hp - damage);

        if (state.currentBoss.hp == 0) {
            String defeatedBossName = state.currentBoss.name;
            state.bossesDefeated++;

            unlockAchievement("a3");
            unlockAchievement("a5");

            if (state.bossesDefeated >= 3) {
                unlockAchievement("a6");
            }

            grantBossLoot(defeatedBossName);

            int bossHp = 800 + state.level * 100;

            state.currentBoss = new PlayerState.Boss(
                    nextBossName(defeatedBossName),
                    nextBossDescription(defeatedBossName),
                    bossHp,
                    bossHp
            );

            state.activityLog.add(0, "Boss defeated: " + defeatedBossName + ". New boss appeared: " + state.currentBoss.name + ".");
        }
    }

    private void grantBossLoot(String bossName) {
        state.lastLootDrops.clear();

        int goldReward = 75 + state.level * 10;
        int crystalReward = 3 + Math.max(1, state.level / 2);
        int essenceReward = 2 + Math.max(1, state.bossesDefeated / 2);

        state.gold += goldReward;
        state.crystals += crystalReward;
        state.essence += essenceReward;

        addLootDrop(goldReward + " Gold");
        addLootDrop(crystalReward + " Crystals");
        addLootDrop(essenceReward + " Essence");

        if (bossName.equals("Procrastination King")) {
            addCosmeticDrop("inv_shadow_crown", "Shadow Crown Frame", "frame");
        } else if (bossName.equals("Bug Lord")) {
            addCosmeticDrop("inv_glitch_aura", "Glitch Debug Aura", "aura");
        } else if (bossName.equals("Burnout Titan")) {
            addCosmeticDrop("inv_titan_flame_outfit", "Titan Flame Outfit", "outfit");
        } else if (bossName.equals("Doomscroll Phantom")) {
            addCosmeticDrop("inv_phantom_arcade_theme", "Phantom Arcade Theme", "theme");
        } else {
            addCosmeticDrop("inv_victory_neon_frame_" + state.bossesDefeated, "Victory Neon Frame", "frame");
        }

        state.activityLog.add(0, "Loot found: " + String.join(", ", state.lastLootDrops));
    }

    private void addLootDrop(String loot) {
        state.lastLootDrops.add(loot);
        state.lootHistory.add(0, loot);
        trimLootHistory();
    }

    private void addCosmeticDrop(String id, String name, String type) {
        if (!alreadyOwns(name, type)) {
            state.inventory.add(new PlayerState.InventoryItem(id, name, type, false));
            addLootDrop(name);
        } else {
            addLootDrop("Bonus 25 Essence");
            state.essence += 25;
        }
    }

    private String nextBossName(String defeatedBossName) {
        switch (defeatedBossName) {
            case "Procrastination King":
                return "Bug Lord";
            case "Bug Lord":
                return "Burnout Titan";
            case "Burnout Titan":
                return "Doomscroll Phantom";
            case "Doomscroll Phantom":
                return "Stress Serpent";
            case "Stress Serpent":
                return "Silence Reaper";
            default:
                return "Procrastination King";
        }
    }

    private String nextBossDescription(String defeatedBossName) {
        switch (defeatedBossName) {
            case "Procrastination King":
                return "A corrupted beast made of bugs, errors, and broken focus.";
            case "Bug Lord":
                return "A massive beast that attacks your energy and consistency.";
            case "Burnout Titan":
                return "A phantom that drains time through endless scrolling.";
            case "Doomscroll Phantom":
                return "A serpent that feeds on stress and scattered attention.";
            case "Stress Serpent":
                return "A silent reaper that punishes unused creative gifts.";
            default:
                return "A shadow ruler that grows stronger whenever you delay your goals.";
        }
    }

    private void completeQuests(String type) {
        for (PlayerState.Quest quest : state.dailyQuests) {
            if (quest.id.equals("q1")) quest.completed = true;

            if (quest.id.equals("q2") &&
                    (type.equals("coding") || type.equals("reading") || type.equals("focus"))) {
                quest.completed = true;
            }

            if (quest.id.equals("q3")) quest.completed = true;
        }
    }

    private void checkAchievements(String type) {
        if (type.equals("coding")) unlockAchievement("a1");
        if (type.equals("reading")) unlockAchievement("a2");
        if (state.level >= 5) unlockAchievement("a4");
    }

    private void unlockAchievement(String achievementId) {
        for (PlayerState.Achievement achievement : state.achievements) {
            if (achievement.id.equals(achievementId) && !achievement.unlocked) {
                achievement.unlocked = true;
                state.gold += 50;
                state.essence += 2;
                state.activityLog.add(0, "Achievement unlocked: " + achievement.name);
            }
        }
    }

    private boolean hasSkill(String skillId) {
        return state.skills.stream().anyMatch(skill -> skill.id.equals(skillId) && skill.unlocked);
    }

    private String activeClassForActivity(String type) {
        switch (type) {
            case "coding":
            case "focus":
                return "CODER";
            case "reading":
                return "BOOKWORM";
            case "walking":
            case "workout":
                return "SPORT_MASTER";
            case "meditation":
                return "ZEN";
            case "music":
                return "MUSICIAN";
            case "cooking":
                return "CHEF";
            case "gaming":
                return "GAMER";
            default:
                return state.primaryClass;
        }
    }

    private String titleForClass(String className) {
        switch (className) {
            case "CODER": return "Cyber Architect";
            case "BOOKWORM": return "Lore Keeper";
            case "SPORT_MASTER": return "Arena Strider";
            case "GAMER": return "Arcade Tactician";
            case "EXPLORER": return "Frontier Seeker";
            case "ZEN": return "Life Sage";
            case "MUSICIAN": return "Rhythm Caster";
            case "CHEF": return "Flame Artisan";
            default: return "Gatebound Novice";
        }
    }

    private String outfitForClass(String className) {
        switch (className) {
            case "CODER": return "Neon Tech Jacket";
            case "BOOKWORM": return "Arcane Scholar Coat";
            case "SPORT_MASTER": return "Titan Arena Gear";
            case "GAMER": return "RGB Arcade Hoodie";
            case "EXPLORER": return "Explorer Utility Vest";
            case "ZEN": return "Spirit Temple Robe";
            case "MUSICIAN": return "Soundwave Performer Fit";
            case "CHEF": return "Flame Kitchen Coat";
            default: return "Novice Jacket";
        }
    }

    private String auraForClass(String className) {
        switch (className) {
            case "CODER": return "Blue Terminal Aura";
            case "BOOKWORM": return "Purple Rune Aura";
            case "SPORT_MASTER": return "Orange Battle Aura";
            case "GAMER": return "Green RGB Aura";
            case "EXPLORER": return "Golden Compass Aura";
            case "ZEN": return "Calm Spirit Aura";
            case "MUSICIAN": return "Pink Soundwave Aura";
            case "CHEF": return "Steam Flame Aura";
            default: return "Starter Glow";
        }
    }

    private void trimLog() {
        while (state.activityLog.size() > 12) {
            state.activityLog.remove(state.activityLog.size() - 1);
        }
    }

    private void trimLootHistory() {
        while (state.lootHistory.size() > 20) {
            state.lootHistory.remove(state.lootHistory.size() - 1);
        }
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) return "";
        return value.substring(0, 1).toUpperCase() + value.substring(1);
    }
    public PlayerState buyShopItem(String itemId) {
        if (itemId == null || itemId.isBlank()) {
            return state;
        }

        PlayerState.ShopItem itemToBuy = null;

        for (PlayerState.ShopItem item : state.shopItems) {
            if (item.id.equals(itemId)) {
                itemToBuy = item;
                break;
            }
        }

        if (itemToBuy == null) {
            state.activityLog.add(0, "Shop item not found.");
            trimLog();
            return state;
        }

        if (alreadyOwns(itemToBuy.name, itemToBuy.type)) {
            state.activityLog.add(0, "You already own " + itemToBuy.name + ".");
            trimLog();
            return state;
        }

        if (!canAfford(itemToBuy.currency, itemToBuy.cost)) {
            state.activityLog.add(0, "Not enough " + itemToBuy.currency + " to buy " + itemToBuy.name + ".");
            trimLog();
            return state;
        }

        spendCurrency(itemToBuy.currency, itemToBuy.cost);

        state.inventory.add(new PlayerState.InventoryItem(
                itemToBuy.id.replace("shop_", "inv_"),
                itemToBuy.name,
                itemToBuy.type,
                false
        ));

        state.activityLog.add(0, "Purchased cosmetic: " + itemToBuy.name + ".");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState equipInventoryItem(String itemId) {
        if (itemId == null || itemId.isBlank()) {
            return state;
        }

        PlayerState.InventoryItem selected = null;

        for (PlayerState.InventoryItem item : state.inventory) {
            if (item.id.equals(itemId)) {
                selected = item;
                break;
            }
        }

        if (selected == null) {
            state.activityLog.add(0, "Inventory item not found.");
            trimLog();
            return state;
        }

        for (PlayerState.InventoryItem item : state.inventory) {
            if (item.type.equals(selected.type)) {
                item.equipped = false;
            }
        }

        selected.equipped = true;

        switch (selected.type) {
            case "aura":
                state.equippedAura = selected.name;
                state.avatar.aura = selected.name;
                break;
            case "theme":
                state.equippedTheme = selected.name;
                break;
            case "frame":
                state.equippedFrame = selected.name;
                break;
            case "outfit":
                state.avatar.outfit = selected.name;
                break;
            default:
                break;
        }

        state.activityLog.add(0, "Equipped: " + selected.name + ".");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState forceSave() {
        saveState();
        return state;
    }

    public PlayerState reloadSave() {
        state = saveService.loadOrCreateNew();
        return state;
    }

    public String getSaveLocation() {
        return saveService.getSaveLocation();
    }

    private boolean alreadyOwns(String name, String type) {
        for (PlayerState.InventoryItem item : state.inventory) {
            if (item.name.equals(name) && item.type.equals(type)) {
                return true;
            }
        }
        return false;
    }

    private boolean canAfford(String currency, int cost) {
        switch (currency) {
            case "gold": return state.gold >= cost;
            case "crystals": return state.crystals >= cost;
            case "essence": return state.essence >= cost;
            case "energy": return state.energy >= cost;
            default: return false;
        }
    }

    private void spendCurrency(String currency, int cost) {
        switch (currency) {
            case "gold":
                state.gold -= cost;
                break;
            case "crystals":
                state.crystals -= cost;
                break;
            case "essence":
                state.essence -= cost;
                break;
            case "energy":
                state.energy -= cost;
                break;
            default:
                break;
        }
    }
    private void saveState() {
        saveService.save(state);
    }
}