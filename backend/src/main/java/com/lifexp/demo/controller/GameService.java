package com.lifexp.demo.controller;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Set;
import java.util.function.Supplier;

@Service
public class GameService {
    private static final Set<String> ACTIVITY_TYPES = Set.of(
            "coding", "reading", "walking", "workout", "focus",
            "meditation", "music", "cooking", "gaming"
    );
    private static final Set<String> CLASS_NAMES = Set.of(
            "NOVICE", "CODER", "BOOKWORM", "SPORT_MASTER", "GAMER",
            "EXPLORER", "ZEN", "MUSICIAN", "CHEF"
    );
    private static final Set<String> AVATAR_GENDERS = Set.of("Custom", "Male", "Female");
    private static final Set<String> AVATAR_BODY_TYPES = Set.of("Lean", "Average", "Athletic", "Strong");
    private static final Set<String> AVATAR_HAIR_STYLES = Set.of("Fade", "Curly", "Locs", "Afro", "Short", "Long");
    private static final Set<String> INVENTORY_TYPES = Set.of("aura", "theme", "frame", "outfit");
    private final SaveService saveService;
    private final DailyResetService dailyResetService;
    private UserAccount currentAccount;
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

    public synchronized PlayerState withAccount(UserAccount account, Supplier<PlayerState> action) {
        currentAccount = account;
        state = saveService.loadOrCreateNew(account);

        dailyResetService.applyDailyResetIfNeeded(state);
        syncCatalog();
        unlockAvailableWorlds();

        try {
            PlayerState result = action.get();
            saveState();
            return result;
        } finally {
            currentAccount = null;
        }
    }

    public PlayerState getState() {
        dailyResetService.applyDailyResetIfNeeded(state);
        syncCatalog();
        unlockAvailableWorlds();
        return state;
    }

    public PlayerState reset() {
        state = currentAccount == null ? saveService.resetSave() : saveService.resetSave(currentAccount);
        syncCatalog();
        return state;
    }

    public PlayerState travelToWorld(String worldId) {
        if (worldId == null || worldId.isBlank()) {
            throw new IllegalArgumentException("Choose a world to travel to.");
        }

        syncCatalog();
        unlockAvailableWorlds();

        for (PlayerState.WorldZone world : state.worlds) {
            if (world.id.equals(worldId)) {
                if (!world.unlocked) {
                    throw new IllegalArgumentException("World locked: " + world.name + " needs level " + world.minLevel + " and " + world.requiredBosses + " boss win(s).");
                }

                int travelCost = hasSkill("s5") ? 0 : classAdjustedTravelCost(world.travelCost);

                if (state.energy < travelCost) {
                    throw new IllegalArgumentException("You need " + travelCost + " energy to travel to " + world.name + ".");
                }

                boolean firstVisit = !state.visitedWorldIds.contains(world.id);
                state.energy -= travelCost;
                state.currentWorldId = world.id;
                if (firstVisit) {
                    state.visitedWorldIds.add(world.id);
                }

                state.currentBoss = createBossForWorld(world);
                advanceQuest("travel", 1);

                if (state.primaryClass.equals("EXPLORER") && firstVisit) {
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

        throw new IllegalArgumentException("World not found.");
    }

    public PlayerState changePrimaryClassAtSanctuary(String className) {
        className = requireClassName(className, true);

        if (state.primaryClass.equals(className)) {
            state.activityLog.add(0, "You are already bound to " + className + ".");
            trimLog();
            return state;
        }

        if (state.gold < 25) {
            throw new IllegalArgumentException("You need 25 Gold to change primary class at the Sanctuary.");
        }

        state.gold -= 25;
        applyClassTheme(className);
        state.classMastery = 0;
        state.xpPenaltyActionsLeft = 3;
        syncCatalog();

        state.activityLog.add(0, "Class Sanctuary complete. Primary class changed to " + className + ".");
        state.activityLog.add(0, "Class mastery reset. Temporary XP penalty active for 3 actions.");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState chooseIntroClass(String className) {
        if (state.introCompleted) {
            return state;
        }

        className = requireClassName(className, false);

        applyClassTheme(className);
        state.classMastery = 0;
        state.xpPenaltyActionsLeft = 0;
        syncCatalog();
        state.activityLog.add(0, "Origin chosen: " + className + ".");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState completeActivity(ActivityRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Activity details are required.");
        }

        dailyResetService.applyDailyResetIfNeeded(state);
        syncCatalog();
        unlockAvailableWorlds();

        String type = safe(request.type).toLowerCase();
        boolean isIntro = type.equals("intro");

        if (!isIntro && !ACTIVITY_TYPES.contains(type)) {
            throw new IllegalArgumentException("Choose a valid LifeXP activity type.");
        }

        if (!isIntro && (request.amount < 1 || request.amount > 60)) {
            throw new IllegalArgumentException("Activity amount must be between 1 and 60.");
        }

        int amount = isIntro ? 0 : dailyResetService.sanitizeActivityAmount((int) request.amount);
        String summary = clip(safe(request.summary), 240);

        int energyCost = classAdjustedEnergyCost(type, Math.max(1, amount / 5));

        if (!type.equals("intro") && state.energy < energyCost) {
            throw new IllegalArgumentException("You need " + energyCost + " energy for this activity.");
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

        String actionClass = activeClassForActivity(type);

        int xpGain = calculateXp(type, amount, summary, request.verified);

        if (hasSkill("s1")) {
            xpGain += 5;
        }

        if (state.xpPenaltyActionsLeft > 0) {
            xpGain = (int) Math.round(xpGain * 0.75);
            state.xpPenaltyActionsLeft--;
        }

        if (dailyResetService.isSuspiciousGain(xpGain)) {
            throw new IllegalArgumentException("This XP gain exceeded the allowed limit and was blocked.");
        }

        state.lastXpGain = xpGain;
        state.lastActivityTimestamp = System.currentTimeMillis();
        state.xp += xpGain;
        state.gold += Math.max(1, xpGain / 10);

        if (actionClass.equals(state.primaryClass)) {
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
        advanceQuest("boss_damage", 1);
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
        if (avatar == null) {
            throw new IllegalArgumentException("Avatar details are required.");
        }
        if (state.avatar == null) state.avatar = new PlayerState.Avatar();

        String displayName = clip(safe(avatar.displayName), 32);
        String pronouns = clip(safe(avatar.pronouns), 24);

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
        avatar.gender = allowedChoice(avatar.gender, AVATAR_GENDERS, state.avatar.gender);
        avatar.bodyType = allowedChoice(avatar.bodyType, AVATAR_BODY_TYPES, state.avatar.bodyType);
        avatar.hairStyle = allowedChoice(avatar.hairStyle, AVATAR_HAIR_STYLES, state.avatar.hairStyle);
        avatar.skinTone = validHexColor(avatar.skinTone) ? avatar.skinTone.toLowerCase() : state.avatar.skinTone;
        avatar.hairColor = validHexColor(avatar.hairColor) ? avatar.hairColor.toLowerCase() : state.avatar.hairColor;
        avatar.outfit = fallbackClipped(avatar.outfit, state.avatar.outfit, 64);
        avatar.aura = fallbackClipped(avatar.aura, state.avatar.aura, 64);

        if (state.introCompleted && !avatar.outfit.equals(state.avatar.outfit) && !alreadyOwns(avatar.outfit, "outfit")) {
            avatar.outfit = state.avatar.outfit;
        }
        if (state.introCompleted && !avatar.aura.equals(state.avatar.aura) && !alreadyOwns(avatar.aura, "aura")) {
            avatar.aura = state.avatar.aura;
        }
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
            throw new IllegalArgumentException("Energy is already full.");
        }

        if (state.lastRestTimestamp > 0 && now - state.lastRestTimestamp < cooldown) {
            long remaining = cooldown - (now - state.lastRestTimestamp);
            long minutesLeft = Math.max(1, (remaining + (1000L * 60) - 1) / (1000L * 60));
            throw new IllegalArgumentException("Rest is on cooldown. Try again in " + minutesLeft + " minute(s).");
        }

        int before = state.energy;
        state.energy = Math.min(100, state.energy + 25);
        state.lastRestTimestamp = now;
        state.activityLog.add(0, "Rested and recovered " + (state.energy - before) + " energy.");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState claimDailyLoginReward() {
        String today = LocalDate.now().toString();

        if (today.equals(state.lastLoginRewardDate)) {
            throw new IllegalArgumentException("Daily reward already claimed today.");
        }

        if (!isPreviousCalendarDay(state.lastLoginRewardDate)) {
            state.loginRewardStreak = 0;
        }

        state.loginRewardStreak = Math.max(0, state.loginRewardStreak) + 1;
        state.lastLoginRewardDate = today;

        int day = ((state.loginRewardStreak - 1) % 7) + 1;
        int goldReward = 20 + day * 8;
        int crystalReward = day >= 3 ? 2 : 1;
        int essenceReward = day >= 5 ? 2 : day >= 2 ? 1 : 0;

        state.gold += goldReward;
        state.crystals += crystalReward;
        state.essence += essenceReward;

        state.lastLootDrops.clear();
        addLootDrop("Daily Streak Day " + day);
        addLootDrop(goldReward + " Gold");
        addLootDrop(crystalReward + " Crystals");
        if (essenceReward > 0) {
            addLootDrop(essenceReward + " Essence");
        }

        state.activityLog.add(0, "Daily login reward claimed: day " + day + " streak.");
        trimLog();
        saveState();
        return state;
    }

    public PlayerState unlockSkill(String skillId) {
        if (skillId == null || skillId.isBlank()) {
            throw new IllegalArgumentException("Choose a skill to unlock.");
        }

        syncCatalog();

        for (PlayerState.Skill skill : state.skills) {
            if (skill.id.equals(skillId)) {
                if (skill.unlocked) {
                    throw new IllegalArgumentException(skill.name + " is already unlocked.");
                }

                int cost = Math.max(1, skill.cost);
                if (state.skillPoints < cost) {
                    throw new IllegalArgumentException("You need " + cost + " skill point(s) to unlock " + skill.name + ".");
                }

                if (!skill.prerequisiteId.isBlank() && !hasSkill(skill.prerequisiteId)) {
                    throw new IllegalArgumentException("Skill locked: unlock its prerequisite first.");
                }

                skill.unlocked = true;
                state.skillPoints -= cost;
                state.activityLog.add(0, "Unlocked skill: " + skill.name);
                trimLog();
                unlockAvailableWorlds();
                saveState();
                return state;
            }
        }

        throw new IllegalArgumentException("Skill not found.");
    }

    public PlayerState claimQuest(String questId) {
        if (questId == null || questId.isBlank()) {
            throw new IllegalArgumentException("Choose a quest reward to claim.");
        }

        syncCatalog();

        for (PlayerState.Quest quest : state.dailyQuests) {
            if (!quest.id.equals(questId)) {
                continue;
            }

            if (!quest.completed) {
                throw new IllegalArgumentException("Quest not complete yet: " + quest.name + ".");
            }

            if (quest.claimed) {
                throw new IllegalArgumentException("Quest already claimed: " + quest.name + ".");
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

        throw new IllegalArgumentException("Quest not found.");
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

        if (state.visitedWorldIds == null) {
            state.visitedWorldIds = new java.util.ArrayList<>();
        }
        if (state.currentWorldId != null && !state.currentWorldId.isBlank() && !state.visitedWorldIds.contains(state.currentWorldId)) {
            state.visitedWorldIds.add(state.currentWorldId);
        }

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

        String questClass = state.primaryClass == null || state.primaryClass.equals("NOVICE")
                ? "CODER"
                : state.primaryClass;

        state.dailyQuests.removeIf(quest ->
                quest.id != null &&
                quest.id.startsWith("class_") &&
                !quest.id.startsWith("class_" + questClass.toLowerCase() + "_"));

        for (PlayerState.Quest classQuest : classChainQuests(questClass)) {
            PlayerState.Quest existing = findQuest(classQuest.id);
            if (existing == null) {
                state.dailyQuests.add(classQuest);
            } else {
                existing.name = classQuest.name;
                existing.description = classQuest.description;
                existing.rewardXp = classQuest.rewardXp;
                existing.rewardGold = classQuest.rewardGold;
                existing.rewardEssence = classQuest.rewardEssence;
                existing.actionType = classQuest.actionType;
                existing.target = classQuest.target;
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

        ensureClassDefaultOutfitOwned();
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

    private PlayerState.Quest[] classChainQuests(String className) {
        switch (className) {
            case "BOOKWORM":
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "Pagefire Initiation", "Read once to light the first memory rune.", "reading", 1, 70, 24, 1),
                        classQuest(className, 2, "Margin Mage", "Complete 2 reading or focus sessions to reinforce your notes.", "focus", 2, 95, 32, 2),
                        classQuest(className, 3, "Wraith Counterspell", "Damage a boss after studying.", "boss_damage", 1, 120, 42, 3)
                };
            case "SPORT_MASTER":
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "Warmup Spark", "Complete one walk or workout.", "movement", 1, 70, 24, 1),
                        classQuest(className, 2, "Arena Pressure", "Complete 2 movement actions today.", "movement", 2, 95, 32, 2),
                        classQuest(className, 3, "Titan Breaker", "Damage a boss after training.", "boss_damage", 1, 120, 42, 3)
                };
            case "GAMER":
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "Combo Start", "Complete one purposeful gaming action.", "gaming", 1, 70, 24, 1),
                        classQuest(className, 2, "Quest Combo", "Claim progress on 2 real actions.", "any", 2, 95, 32, 2),
                        classQuest(className, 3, "Phantom Punish", "Damage a boss with your combo active.", "boss_damage", 1, 120, 42, 3)
                };
            case "EXPLORER":
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "First Bearing", "Travel to any unlocked world.", "travel", 1, 70, 24, 1),
                        classQuest(className, 2, "Route Sketch", "Complete 2 real actions after scouting.", "any", 2, 95, 32, 2),
                        classQuest(className, 3, "Unknown Faced", "Damage a boss in the field.", "boss_damage", 1, 120, 42, 3)
                };
            case "ZEN":
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "Quiet Breath", "Complete one meditation action.", "meditation", 1, 70, 24, 2),
                        classQuest(className, 2, "Still Water", "Complete 2 calm-focus actions.", "focus", 2, 95, 32, 2),
                        classQuest(className, 3, "Serpent Uncoiled", "Damage a boss while steady.", "boss_damage", 1, 120, 42, 3)
                };
            case "MUSICIAN":
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "Find the Beat", "Complete one music practice action.", "music", 1, 70, 24, 1),
                        classQuest(className, 2, "Rhythm Chain", "Complete 2 practice or focus actions.", "focus", 2, 95, 32, 2),
                        classQuest(className, 3, "Silence Splitter", "Damage a boss with rhythm momentum.", "boss_damage", 1, 120, 42, 3)
                };
            case "CHEF":
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "Prep Flame", "Complete one cooking action.", "cooking", 1, 70, 24, 1),
                        classQuest(className, 2, "Kitchen Tempo", "Complete 2 cooking or focus actions.", "focus", 2, 95, 32, 2),
                        classQuest(className, 3, "Chaos Plated", "Damage a boss after prep.", "boss_damage", 1, 120, 42, 3)
                };
            case "CODER":
            default:
                return new PlayerState.Quest[] {
                        classQuest(className, 1, "Boot Sequence", "Complete one coding action.", "coding", 1, 70, 24, 1),
                        classQuest(className, 2, "Debug Loop", "Complete 2 focused build actions.", "focus", 2, 95, 32, 2),
                        classQuest(className, 3, "Bug Lord Trace", "Damage a boss after debugging.", "boss_damage", 1, 120, 42, 3)
                };
        }
    }

    private PlayerState.Quest classQuest(String className, int step, String name, String description, String actionType, int target, int rewardXp, int rewardGold, int rewardEssence) {
        return new PlayerState.Quest(
                "class_" + className.toLowerCase() + "_" + step,
                name,
                description,
                false,
                false,
                rewardXp,
                rewardGold,
                rewardEssence,
                actionType,
                target
        );
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
    }

    private boolean isPreviousCalendarDay(String date) {
        if (date == null || date.isBlank()) {
            return false;
        }

        try {
            return LocalDate.parse(date).equals(LocalDate.now().minusDays(1));
        } catch (DateTimeParseException exception) {
            return false;
        }
    }

    private String requireClassName(String className, boolean allowNovice) {
        String normalized = safe(className).toUpperCase();

        if (!CLASS_NAMES.contains(normalized) || (!allowNovice && normalized.equals("NOVICE"))) {
            throw new IllegalArgumentException("Choose a valid LifeXP class.");
        }

        return normalized;
    }

    private String clip(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private String allowedChoice(String value, Set<String> allowed, String fallback) {
        String normalized = safe(value);
        return allowed.contains(normalized) ? normalized : fallback;
    }

    private boolean validHexColor(String value) {
        return value != null && value.matches("#[0-9a-fA-F]{6}");
    }

    private String fallbackClipped(String value, String fallback, int maxLength) {
        String normalized = clip(safe(value), maxLength);
        return normalized.isBlank() ? fallback : normalized;
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
        String outfit = outfitForClass(className);
        state.avatar.outfit = outfit;
        state.avatar.aura = auraForClass(className);
        equipClassDefaultOutfit(className, outfit);
    }

    private void ensureClassDefaultOutfitOwned() {
        String className = state.primaryClass == null || state.primaryClass.isBlank()
                ? "NOVICE"
                : state.primaryClass;
        ensureInventoryItem(classDefaultOutfitId(className), outfitForClass(className), "outfit", false);
    }

    private void equipClassDefaultOutfit(String className, String outfit) {
        PlayerState.InventoryItem selected = ensureInventoryItem(classDefaultOutfitId(className), outfit, "outfit", false);

        for (PlayerState.InventoryItem item : state.inventory) {
            if (item.type.equals("outfit")) {
                item.equipped = false;
            }
        }

        selected.equipped = true;
    }

    private PlayerState.InventoryItem ensureInventoryItem(String id, String name, String type, boolean equipped) {
        for (PlayerState.InventoryItem item : state.inventory) {
            if (item.name.equals(name) && item.type.equals(type)) {
                return item;
            }
        }

        PlayerState.InventoryItem created = new PlayerState.InventoryItem(id, name, type, equipped);
        state.inventory.add(created);
        return created;
    }

    private String classDefaultOutfitId(String className) {
        String normalizedClass = className == null || className.isBlank()
                ? "novice"
                : className.toLowerCase();
        return "class_" + normalizedClass + "_outfit";
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
            throw new IllegalArgumentException("Choose a shop item to purchase.");
        }

        PlayerState.ShopItem itemToBuy = null;

        for (PlayerState.ShopItem item : state.shopItems) {
            if (item.id.equals(itemId)) {
                itemToBuy = item;
                break;
            }
        }

        if (itemToBuy == null) {
            throw new IllegalArgumentException("Shop item not found.");
        }

        if (alreadyOwns(itemToBuy.name, itemToBuy.type)) {
            throw new IllegalArgumentException("You already own " + itemToBuy.name + ".");
        }

        if (!canAfford(itemToBuy.currency, itemToBuy.cost)) {
            throw new IllegalArgumentException("You need " + itemToBuy.cost + " " + itemToBuy.currency + " to buy " + itemToBuy.name + ".");
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
            throw new IllegalArgumentException("Choose an inventory item to equip.");
        }

        PlayerState.InventoryItem selected = null;

        for (PlayerState.InventoryItem item : state.inventory) {
            if (item.id.equals(itemId)) {
                selected = item;
                break;
            }
        }

        if (selected == null) {
            throw new IllegalArgumentException("Inventory item not found.");
        }

        if (!INVENTORY_TYPES.contains(selected.type)) {
            throw new IllegalArgumentException("This inventory item cannot be equipped.");
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
        state = currentAccount == null ? saveService.loadOrCreateNew() : saveService.loadOrCreateNew(currentAccount);
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
        if (currentAccount == null) {
            saveService.save(state);
        } else {
            saveService.save(currentAccount, state);
        }
    }
}
