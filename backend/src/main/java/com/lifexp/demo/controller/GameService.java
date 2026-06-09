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
        syncCatalog();
        unlockAvailableWorlds();
        saveState();
    }

    public PlayerState getState() {
        dailyResetService.applyDailyResetIfNeeded(state);
        syncCatalog();
        unlockAvailableWorlds();
        return state;
    }

    public PlayerState reset() {
        state = saveService.resetSave();
        syncCatalog();
        return state;
    }

    public PlayerState travelToWorld(String worldId) {
        if (worldId == null || worldId.isBlank()) {
            return state;
        }

        syncCatalog();
        unlockAvailableWorlds();

        for (PlayerState.WorldZone world : state.worlds) {
            if (world.id.equals(worldId)) {
                if (!world.unlocked) {
                    state.activityLog.add(0, "World locked: " + world.name + " needs level " + world.minLevel + " and " + world.requiredBosses + " boss win(s).");
                    trimLog();
                    return state;
                }

                int travelCost = hasSkill("s5") ? 0 : classAdjustedTravelCost(world.travelCost);

                if (state.energy < travelCost) {
                    state.activityLog.add(0, "Not enough energy to travel to " + world.name + ".");
                    trimLog();
                    return state;
                }

                state.energy -= travelCost;
                state.currentWorldId = world.id;
                state.activeClass = world.classTheme;

                state.currentBoss = createBossForWorld(world);
                advanceQuest("travel", 1);

                if (state.primaryClass.equals("EXPLORER")) {
                    int travelXp = 25 + Math.max(0, world.requiredBosses * 5) + classUpgradeBonusStep() * 8;
                    int travelGold = 10 + classUpgradeBonusStep() * 4;
                    state.xp += travelXp;
                    state.gold += travelGold;
                    state.lastXpGain = travelXp;
                    checkLevelUp();
                    state.activityLog.add(0, "Explorer upgrade perk: +" + travelXp + " XP and +" + travelGold + " Gold for scouting " + world.name + ".");
                }

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
        applyClassTheme(className);
        state.classMastery = 0;
        state.xpPenaltyActionsLeft = 3;

        state.activityLog.add(0, "Class Sanctuary complete. Primary class changed to " + className + ".");
        state.activityLog.add(0, "Class mastery reset. Temporary XP penalty active for 3 actions.");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState chooseIntroClass(String className) {
        if (className == null || className.isBlank() || state.introCompleted) {
            return state;
        }

        applyClassTheme(className);
        state.classMastery = 0;
        state.xpPenaltyActionsLeft = 0;
        state.activityLog.add(0, "Origin chosen: " + className + ".");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState completeActivity(ActivityRequest request) {
        if (request == null) return state;

        dailyResetService.applyDailyResetIfNeeded(state);
        syncCatalog();
        unlockAvailableWorlds();

        String type = safe(request.type);
        int amount = dailyResetService.sanitizeActivityAmount((int) Math.min(request.amount, 60));
        String summary = safe(request.summary);

        int energyCost = classAdjustedEnergyCost(type, Math.max(1, amount / 5));

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

        applyPrimaryClassPerks(type, amount, summary);

        int damage = Math.max(5, xpGain / 2);
        damage += primaryClassBossDamageBonus(type);

        if (hasSkill("s2") && (type.equals("coding") || type.equals("focus"))) {
            damage += 15;
        }

        if (hasSkill("s6")) {
            damage = (int) Math.round(damage * 1.25);
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
        unlockAvailableWorlds();
        saveState();
        return state;
    }

    public PlayerState updateAvatar(PlayerState.Avatar avatar) {
        if (avatar == null) return state;

        String displayName = safe(avatar.displayName);
        String pronouns = safe(avatar.pronouns);

        if (displayName.isBlank()) {
            displayName = state.playerName == null || state.playerName.isBlank()
                    ? "PlayerOne"
                    : state.playerName;
        }

        if (pronouns.isBlank()) {
            pronouns = state.pronouns == null || state.pronouns.isBlank()
                    ? "they/them"
                    : state.pronouns;
        }

        avatar.displayName = displayName;
        avatar.pronouns = pronouns;
        state.avatar = avatar;
        state.playerName = displayName;
        state.pronouns = pronouns;
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
        syncCatalog();

        for (PlayerState.Skill skill : state.skills) {
            if (skill.id.equals(skillId) && !skill.unlocked) {
                int cost = Math.max(1, skill.cost);
                if (state.skillPoints < cost) {
                    state.activityLog.add(0, "Not enough skill points for " + skill.name + ".");
                    trimLog();
                    return state;
                }

                if (!skill.prerequisiteId.isBlank() && !hasSkill(skill.prerequisiteId)) {
                    state.activityLog.add(0, "Skill locked: unlock its prerequisite first.");
                    trimLog();
                    return state;
                }

                skill.unlocked = true;
                state.skillPoints -= cost;
                state.activityLog.add(0, "Unlocked skill: " + skill.name);
                trimLog();
                unlockAvailableWorlds();
                saveState();
                break;
            }
        }

        return state;
    }

    public PlayerState claimQuest(String questId) {
        if (questId == null || questId.isBlank()) {
            return state;
        }

        syncCatalog();

        for (PlayerState.Quest quest : state.dailyQuests) {
            if (!quest.id.equals(questId)) {
                continue;
            }

            if (!quest.completed) {
                state.activityLog.add(0, "Quest not complete yet: " + quest.name + ".");
                trimLog();
                return state;
            }

            if (quest.claimed) {
                state.activityLog.add(0, "Quest already claimed: " + quest.name + ".");
                trimLog();
                return state;
            }

            int rewardXp = quest.rewardXp + (hasSkill("s7") ? 20 : 0);
            int rewardGold = quest.rewardGold + (hasSkill("s3") ? 10 : 0);

            if (state.primaryClass.equals("GAMER")) {
                rewardXp += 15 + classUpgradeBonusStep() * 5;
                rewardGold += 10 + classUpgradeBonusStep() * 5;
            }

            quest.claimed = true;
            state.xp += rewardXp;
            state.gold += rewardGold;
            state.essence += quest.rewardEssence;
            state.lastXpGain = rewardXp;

            checkLevelUp();
            unlockAvailableWorlds();
            state.activityLog.add(0, "Quest claimed: " + quest.name + " (+" + rewardXp + " XP, +" + rewardGold + " Gold).");
            trimLog();
            saveState();
            return state;
        }

        state.activityLog.add(0, "Quest not found.");
        trimLog();
        return state;
    }

    private int calculateXp(String type, int amount, String summary, boolean verified) {
        int xp;
        int upgradeStep = classUpgradeBonusStep();

        switch (type) {
            case "coding":
                xp = amount * 3;
                if (state.primaryClass.equals("CODER")) xp += 25 + upgradeStep * 8;
                break;
            case "reading":
                xp = amount * 2;
                if (summary.length() > 80) xp += 20;
                else if (summary.length() > 30) xp += 10;
                if (state.primaryClass.equals("BOOKWORM")) xp += 25 + upgradeStep * (summary.length() >= 30 ? 10 : 6);
                if (state.primaryClass.equals("EXPLORER")) xp += 12 + upgradeStep * 5;
                break;
            case "walking":
                xp = amount * 2;
                if (state.primaryClass.equals("SPORT_MASTER")) xp += 20 + upgradeStep * 7;
                if (state.primaryClass.equals("EXPLORER")) xp += 18 + upgradeStep * 5;
                break;
            case "workout":
                xp = amount * 4;
                if (state.primaryClass.equals("SPORT_MASTER")) xp += 25 + upgradeStep * 9;
                break;
            case "focus":
                xp = amount * 3;
                if (state.primaryClass.equals("CODER")) xp += 15 + upgradeStep * 6;
                if (state.primaryClass.equals("ZEN")) xp += 18 + upgradeStep * 6;
                if (state.primaryClass.equals("EXPLORER")) xp += 12 + upgradeStep * 5;
                break;
            case "meditation":
                xp = amount * 2;
                if (state.primaryClass.equals("ZEN")) xp += 25 + upgradeStep * 8;
                break;
            case "music":
                xp = amount * 3;
                if (state.primaryClass.equals("MUSICIAN")) xp += 25 + upgradeStep * 8;
                break;
            case "cooking":
                xp = amount * 3;
                if (state.primaryClass.equals("CHEF")) xp += 25 + upgradeStep * 8;
                break;
            case "gaming":
                xp = amount * 2;
                if (state.primaryClass.equals("GAMER")) xp += 25 + upgradeStep * 8;
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

    private int classAdjustedEnergyCost(String type, int baseCost) {
        int cost = Math.max(1, baseCost);
        int upgradeStep = classUpgradeBonusStep();

        if (state.primaryClass.equals("CODER") && (type.equals("coding") || type.equals("focus"))) {
            return Math.max(1, cost - 1 - Math.min(2, upgradeStep));
        }

        if (state.primaryClass.equals("SPORT_MASTER") && (type.equals("walking") || type.equals("workout"))) {
            return Math.max(1, cost / 2 - Math.min(1, upgradeStep));
        }

        if (state.primaryClass.equals("ZEN") && (type.equals("meditation") || type.equals("focus"))) {
            return Math.max(1, cost - 2 - Math.min(2, upgradeStep));
        }

        if (state.primaryClass.equals("MUSICIAN") && type.equals("music")) {
            return Math.max(1, cost - 1 - Math.min(2, upgradeStep));
        }

        if (state.primaryClass.equals("CHEF") && type.equals("cooking")) {
            return Math.max(1, cost - 1 - Math.min(2, upgradeStep));
        }

        return cost;
    }

    private int classAdjustedTravelCost(int baseCost) {
        int cost = Math.max(0, baseCost);

        if (state.primaryClass.equals("EXPLORER")) {
            return Math.max(0, cost / 2 - classUpgradeBonusStep());
        }

        return cost;
    }

    private void applyPrimaryClassPerks(String type, int amount, String summary) {
        int upgradeStep = classUpgradeBonusStep();

        switch (state.primaryClass) {
            case "CODER":
                if (type.equals("coding") || type.equals("focus")) {
                    int gold = 5 + upgradeStep * 3;
                    state.gold += gold;
                    state.activityLog.add(0, "Coder upgrade perk: +" + gold + " Gold from clean execution.");
                }
                break;
            case "BOOKWORM":
                if (type.equals("reading") && summary.length() >= 30) {
                    int essence = 1 + Math.max(0, upgradeStep / 2);
                    state.essence += essence;
                    state.activityLog.add(0, "Bookworm upgrade perk: +" + essence + " Essence from thoughtful notes.");
                }
                break;
            case "SPORT_MASTER":
                if (type.equals("walking") || type.equals("workout")) {
                    int recovered = Math.max(2, amount / 12) + upgradeStep * 2;
                    state.energy = Math.min(100, state.energy + recovered);
                    state.activityLog.add(0, "Sport Master upgrade perk: recovered " + recovered + " Energy.");
                }
                break;
            case "GAMER":
                if (type.equals("gaming")) {
                    int gold = 15 + upgradeStep * 5;
                    state.gold += gold;
                    state.activityLog.add(0, "Gamer upgrade perk: +" + gold + " Gold combo bonus.");
                }
                break;
            case "EXPLORER":
                if (type.equals("walking") || type.equals("reading") || type.equals("focus")) {
                    int gold = 8 + upgradeStep * 4;
                    state.gold += gold;
                    state.activityLog.add(0, "Explorer upgrade perk: +" + gold + " Gold from discovery.");
                }
                break;
            case "ZEN":
                if (type.equals("meditation") || type.equals("focus")) {
                    int recovered = 8 + upgradeStep * 3;
                    state.energy = Math.min(100, state.energy + recovered);
                    state.activityLog.add(0, "Zen upgrade perk: restored " + recovered + " Energy.");
                }
                break;
            case "MUSICIAN":
                if (type.equals("music")) {
                    int crystals = 1 + Math.max(0, upgradeStep / 2);
                    state.crystals += crystals;
                    state.activityLog.add(0, "Musician upgrade perk: +" + crystals + " Crystal(s) from rhythm practice.");
                }
                break;
            case "CHEF":
                if (type.equals("cooking")) {
                    int recovered = 10 + upgradeStep * 3;
                    int gold = 5 + upgradeStep * 4;
                    state.energy = Math.min(100, state.energy + recovered);
                    state.gold += gold;
                    state.activityLog.add(0, "Chef upgrade perk: +" + recovered + " Energy and +" + gold + " Gold from meal prep.");
                }
                break;
            default:
                break;
        }
    }

    private int primaryClassBossDamageBonus(String type) {
        int upgradeStep = classUpgradeBonusStep();

        switch (state.primaryClass) {
            case "CODER":
                return (type.equals("coding") || type.equals("focus")) ? 15 + upgradeStep * 6 : 0;
            case "BOOKWORM":
                return type.equals("reading") ? 12 + upgradeStep * 5 : 0;
            case "SPORT_MASTER":
                return (type.equals("walking") || type.equals("workout")) ? 14 + upgradeStep * 6 : 0;
            case "GAMER":
                return type.equals("gaming") ? 18 + upgradeStep * 7 : 0;
            case "EXPLORER":
                return (type.equals("walking") || type.equals("focus")) ? 10 + upgradeStep * 5 : 0;
            case "ZEN":
                return (type.equals("meditation") || type.equals("focus")) ? 10 + upgradeStep * 5 : 0;
            case "MUSICIAN":
                return type.equals("music") ? 12 + upgradeStep * 6 : 0;
            case "CHEF":
                return type.equals("cooking") ? 12 + upgradeStep * 6 : 0;
            default:
                return 0;
        }
    }

    private int classUpgradeBonusStep() {
        return classUpgradeTier() - 1;
    }

    private int classUpgradeTier() {
        if (state.level >= 50) return 4;
        if (state.level >= 25) return 3;
        if (state.level >= 10) return 2;
        return 1;
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
            markCurrentWorldBossDefeated();
            unlockAvailableWorlds();

            if (hasSkill("s8") && state.bossesDefeated % 3 == 0) {
                state.skillPoints++;
                state.activityLog.add(0, "Legend Pulse granted +1 skill point.");
            }

            PlayerState.WorldZone currentWorld = findWorld(state.currentWorldId);
            state.currentBoss = createBossForWorld(currentWorld == null ? state.worlds.get(0) : currentWorld);

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

        if (hasSkill("s4")) {
            state.essence += 5;
            addLootDrop("5 Bonus Essence");
        }

        addLootDrop(goldReward + " Gold");
        addLootDrop(crystalReward + " Crystals");
        addLootDrop(essenceReward + " Essence");

        if (bossName.equals("Procrastination King")) {
            addCosmeticDrop("inv_shadow_crown", "Shadow Crown Frame", "frame");
        } else if (bossName.equals("Bug Lord")) {
            addCosmeticDrop("inv_glitch_aura", "Glitch Debug Aura", "aura");
        } else if (bossName.equals("Forgetfulness Wraith")) {
            addCosmeticDrop("inv_wraith_pages_theme", "Wraith Pages Theme", "theme");
        } else if (bossName.equals("Burnout Titan")) {
            addCosmeticDrop("inv_titan_flame_outfit", "Titan Flame Outfit", "outfit");
        } else if (bossName.equals("Doomscroll Phantom")) {
            addCosmeticDrop("inv_phantom_arcade_theme", "Phantom Arcade Theme", "theme");
        } else if (bossName.equals("Stress Serpent")) {
            addCosmeticDrop("inv_serpent_calm_aura", "Serpent Calm Aura", "aura");
        } else if (bossName.equals("Silence Reaper")) {
            addCosmeticDrop("inv_soundwave_frame", "Soundwave Frame", "frame");
        } else if (bossName.equals("Chaos Chef")) {
            addCosmeticDrop("inv_steam_flame_aura", "Steam Flame Aura", "aura");
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
        advanceQuest("any", 1);
        advanceQuest(type, 1);

        if (type.equals("coding") || type.equals("reading") || type.equals("focus")) {
            advanceQuest("focus", 1);
        }

        if (type.equals("walking") || type.equals("workout")) {
            advanceQuest("movement", 1);
        }

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
        if (skillId == null || skillId.isBlank()) {
            return true;
        }
        return state.skills.stream().anyMatch(skill -> skill.id.equals(skillId) && skill.unlocked);
    }

    private void syncCatalog() {
        PlayerState defaults = new PlayerState();

        for (PlayerState.Quest defaultQuest : defaults.dailyQuests) {
            PlayerState.Quest existing = findQuest(defaultQuest.id);
            if (existing == null) {
                state.dailyQuests.add(defaultQuest);
            } else {
                existing.name = defaultQuest.name;
                existing.description = defaultQuest.description;
                existing.rewardXp = defaultQuest.rewardXp;
                existing.rewardGold = defaultQuest.rewardGold;
                existing.rewardEssence = defaultQuest.rewardEssence;
                existing.actionType = defaultQuest.actionType;
                existing.target = defaultQuest.target;
                if (existing.completed && existing.progress == 0) {
                    existing.progress = existing.target;
                }
            }
        }

        for (PlayerState.Skill defaultSkill : defaults.skills) {
            PlayerState.Skill existing = findSkill(defaultSkill.id);
            if (existing == null) {
                state.skills.add(defaultSkill);
            } else {
                existing.name = defaultSkill.name;
                existing.description = defaultSkill.description;
                existing.cost = defaultSkill.cost;
                existing.prerequisiteId = defaultSkill.prerequisiteId;
                existing.tier = defaultSkill.tier;
                existing.category = defaultSkill.category;
            }
        }

        for (PlayerState.WorldZone defaultWorld : defaults.worlds) {
            PlayerState.WorldZone existing = findWorld(defaultWorld.id);
            if (existing == null) {
                state.worlds.add(defaultWorld);
            } else {
                existing.name = defaultWorld.name;
                existing.classTheme = defaultWorld.classTheme;
                existing.bossName = defaultWorld.bossName;
                existing.description = defaultWorld.description;
                existing.minLevel = defaultWorld.minLevel;
                existing.requiredBosses = defaultWorld.requiredBosses;
                existing.travelCost = defaultWorld.travelCost;
                existing.unlocked = existing.unlocked || defaultWorld.unlocked;
            }
        }

        if (state.currentBoss.worldId == null || state.currentBoss.worldId.isBlank()) {
            state.currentBoss.worldId = state.currentWorldId;
        }

        if (state.currentBoss.level <= 0) {
            state.currentBoss.level = Math.max(1, state.level);
        }

        if (state.currentBoss.element == null || state.currentBoss.element.isBlank()) {
            state.currentBoss.element = elementForClass(state.activeClass);
        }

        if (state.playerName == null || state.playerName.isBlank()) {
            state.playerName = state.avatar != null && state.avatar.displayName != null && !state.avatar.displayName.isBlank()
                    ? state.avatar.displayName
                    : "PlayerOne";
        }

        if (state.pronouns == null || state.pronouns.isBlank()) {
            state.pronouns = state.avatar != null && state.avatar.pronouns != null && !state.avatar.pronouns.isBlank()
                    ? state.avatar.pronouns
                    : "they/them";
        }

        if (state.avatar != null) {
            state.avatar.displayName = state.playerName;
            state.avatar.pronouns = state.pronouns;
        }
    }

    private void unlockAvailableWorlds() {
        for (PlayerState.WorldZone world : state.worlds) {
            boolean shouldUnlock = world.unlocked
                    || (state.level >= world.minLevel && state.bossesDefeated >= world.requiredBosses)
                    || (hasSkill("s5") && state.level + 1 >= world.minLevel && state.bossesDefeated >= world.requiredBosses);

            if (shouldUnlock && !world.unlocked) {
                world.unlocked = true;
                state.activityLog.add(0, "World unlocked: " + world.name + ".");
                trimLog();
            }
        }
    }

    private void advanceQuest(String actionType, int amount) {
        for (PlayerState.Quest quest : state.dailyQuests) {
            if (quest.claimed || quest.completed || quest.actionType == null) {
                continue;
            }

            if (quest.actionType.equals(actionType)) {
                quest.progress = Math.min(Math.max(1, quest.target), quest.progress + amount);
                quest.completed = quest.progress >= quest.target;
            }
        }
    }

    private PlayerState.Quest findQuest(String questId) {
        for (PlayerState.Quest quest : state.dailyQuests) {
            if (quest.id.equals(questId)) {
                return quest;
            }
        }
        return null;
    }

    private PlayerState.Skill findSkill(String skillId) {
        for (PlayerState.Skill skill : state.skills) {
            if (skill.id.equals(skillId)) {
                return skill;
            }
        }
        return null;
    }

    private PlayerState.WorldZone findWorld(String worldId) {
        for (PlayerState.WorldZone world : state.worlds) {
            if (world.id.equals(worldId)) {
                return world;
            }
        }
        return null;
    }

    private PlayerState.Boss createBossForWorld(PlayerState.WorldZone world) {
        int bossLevel = Math.max(1, state.level + world.requiredBosses);
        int bossHp = 420 + bossLevel * 90 + world.requiredBosses * 120;

        return new PlayerState.Boss(
                world.bossName,
                bossDescriptionForWorld(world),
                bossHp,
                bossHp,
                world.id,
                bossLevel,
                elementForClass(world.classTheme)
        );
    }

    private String bossDescriptionForWorld(PlayerState.WorldZone world) {
        return world.description + " Recommended level " + world.minLevel + ". Defeat it to push the world map forward.";
    }

    private String elementForClass(String className) {
        switch (className) {
            case "CODER": return "Cyber";
            case "BOOKWORM": return "Memory";
            case "SPORT_MASTER": return "Titan";
            case "GAMER": return "Arcade";
            case "EXPLORER": return "Frontier";
            case "ZEN": return "Spirit";
            case "MUSICIAN": return "Rhythm";
            case "CHEF": return "Flame";
            default: return "Shadow";
        }
    }

    private void markCurrentWorldBossDefeated() {
        PlayerState.WorldZone world = findWorld(state.currentWorldId);
        if (world != null) {
            world.bossDefeated = true;
        }
        advanceQuest("boss_damage", 1);
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

    private void applyClassTheme(String className) {
        state.primaryClass = className;
        state.activeClass = className;
        state.title = titleForClass(className);
        state.avatar.outfit = outfitForClass(className);
        state.avatar.aura = auraForClass(className);
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
