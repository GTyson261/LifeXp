package com.lifexp.demo.controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/player")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class PlayerController {

    private final Map<String, ClassProgress> progress = new HashMap<>();
    private final List<String> activityLog = new ArrayList<>();

    private int streak = 1;
    private LocalDate lastActionDate = null;

    public PlayerController() {
        for (String c : List.of("BOOKWORM", "SPORT_MASTER", "CODER", "GAMER", "EXPLORER", "ZEN")) {
            progress.put(c, new ClassProgress(c, 0, 1, 0));
        }
    }

    @GetMapping
    public PlayerState getPlayer() {
        return new PlayerState(progress, activityLog, streak, getMultiplier());
    }

    @PostMapping("/walking")
    public ActionResponse walking(@RequestBody(required = false) WalkingRequest request) {
        WalkingRequest r = requireRequest(request);
        String c = clean(r.currentClass());

        int base = r.steps() / 100 + r.minutes() * 2;
        int bonus = c.equals("SPORT_MASTER") ? 20 : 0;

        return applyXp(c, base + bonus, bonus,
                "🚶 Walked " + r.steps() + " steps for " + r.minutes() + " minutes");
    }

    @PostMapping("/coding")
    public ActionResponse coding(@RequestBody(required = false) CodingRequest request) {
        CodingRequest r = requireRequest(request);
        String c = clean(r.currentClass());

        int base = r.minutes() * 3;
        int bonus = c.equals("CODER") ? 25 : 0;

        return applyXp(c, base + bonus, bonus,
                "💻 Coded for " + r.minutes() + " minutes");
    }

    @PostMapping("/reading")
    public ActionResponse reading(@RequestBody(required = false) ReadingRequest request) {
        ReadingRequest r = requireRequest(request);
        String c = clean(r.currentClass());

        int base = r.pages() * 2;
        int quality = readingQualityBonus(r.description());
        int classBonus = c.equals("BOOKWORM") ? 25 : 0;

        return applyXp(c, base + quality + classBonus, quality + classBonus,
                "📚 Read " + r.pages() + " pages");
    }

    @PostMapping("/passive")
    public ActionResponse passive(@RequestBody(required = false) PassiveRequest request) {
        PassiveRequest r = requireRequest(request);
        String c = clean(r.currentClass());

        int base = Math.max(1, r.minutes());
        int bonus = c.equals("ZEN") ? 15 : 0;

        return applyXp(c, base + bonus, bonus,
                "✨ Passive AFK gain for " + r.minutes() + " minutes");
    }

    public ActionResponse applyXp(String className, int rawXp, int bonusXp, String actionText) {
        String c = clean(className);

        updateStreak();

        double multiplier = getMultiplier();
        int finalXp = (int) Math.round(rawXp * multiplier);

        ClassProgress cp = progress.get(c);
        cp.addXp(finalXp);

        log(actionText + " | +" + finalXp + " XP to " + c + " | x" + multiplier);

        return build(c, finalXp, bonusXp);
    }

    private <T> T requireRequest(T request) {
        if (request == null) {
            throw new IllegalArgumentException("Activity details are required.");
        }
        return request;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(org.springframework.http.HttpStatus.BAD_REQUEST)
    public Map<String, String> activityError(IllegalArgumentException exception) {
        return Map.of("message", exception.getMessage());
    }

    public Map<String, Object> applyXp(String className, int rawXp) {
        ActionResponse res = applyXp(className, rawXp, 0, "✅ Quest completed");

        Map<String, Object> map = new HashMap<>();
        map.put("className", res.className());
        map.put("xpGained", res.xpGained());
        map.put("bonusXp", res.bonusXp());
        map.put("classXp", res.classXp());
        map.put("classLevel", res.classLevel());
        map.put("classSkillPoints", res.classSkillPoints());
        map.put("activityLog", res.activityLog());
        map.put("streak", streak);
        map.put("multiplier", getMultiplier());

        return map;
    }

    private void updateStreak() {
        LocalDate today = LocalDate.now();

        if (lastActionDate == null) {
            streak = 1;
        } else if (lastActionDate.plusDays(1).equals(today)) {
            streak++;
        } else if (!lastActionDate.equals(today)) {
            streak = 1;
        }

        lastActionDate = today;
    }

    private double getMultiplier() {
        if (streak >= 7) return 2.0;
        if (streak >= 5) return 1.5;
        if (streak >= 3) return 1.25;
        return 1.0;
    }

    private String clean(String c) {
        return progress.containsKey(c) ? c : "CODER";
    }

    private int readingQualityBonus(String d) {
        if (d == null || d.isBlank()) return 0;

        int length = d.trim().length();

        if (length >= 250) return 40;
        if (length >= 150) return 25;
        if (length >= 75) return 15;
        if (length >= 30) return 5;

        return 0;
    }

    private ActionResponse build(String c, int xp, int bonus) {
        ClassProgress cp = progress.get(c);

        return new ActionResponse(
                c,
                xp,
                bonus,
                cp.getXp(),
                cp.getLevel(),
                cp.getSkillPoints(),
                activityLog,
                streak,
                getMultiplier()
        );
    }

    private void log(String msg) {
        activityLog.add(0, LocalDateTime.now() + " — " + msg);

        if (activityLog.size() > 15) {
            activityLog.remove(activityLog.size() - 1);
        }
    }

    public record WalkingRequest(int steps, int minutes, String currentClass) {}
    public record CodingRequest(int minutes, String currentClass) {}
    public record ReadingRequest(int pages, String description, String currentClass) {}
    public record PassiveRequest(int minutes, String currentClass) {}

    public record PlayerState(
            Map<String, ClassProgress> progress,
            List<String> activityLog,
            int streak,
            double multiplier
    ) {}

    public record ActionResponse(
            String className,
            int xpGained,
            int bonusXp,
            int classXp,
            int classLevel,
            int classSkillPoints,
            List<String> activityLog,
            int streak,
            double multiplier
    ) {}

    public static class ClassProgress {
        private String className;
        private int xp;
        private int level;
        private int skillPoints;
        private int nextLevelXp;

        public ClassProgress() {}

        public ClassProgress(String className, int xp, int level, int skillPoints) {
            this.className = className;
            this.xp = xp;
            this.level = level;
            this.skillPoints = skillPoints;
            this.nextLevelXp = level * 100;
        }

        public void addXp(int amount) {
            xp += amount;

            while (xp >= level * 100) {
                xp -= level * 100;
                level++;
                skillPoints++;
            }

            nextLevelXp = level * 100;
        }

        public void spendSkillPoint() {
            if (skillPoints > 0) {
                skillPoints--;
            }
        }

        public String getClassName() {
            return className;
        }

        public int getXp() {
            return xp;
        }

        public int getLevel() {
            return level;
        }

        public int getSkillPoints() {
            return skillPoints;
        }

        public int getNextLevelXp() {
            return nextLevelXp;
        }
    }
}
