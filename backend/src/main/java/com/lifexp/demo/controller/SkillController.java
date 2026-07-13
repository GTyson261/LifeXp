package com.lifexp.demo.controller;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class SkillController {

    private final PlayerController playerController;

    private final Map<String, List<Map<String, Object>>> skillTrees = new HashMap<>();
    private final Map<String, Set<String>> unlockedSkills = new HashMap<>();

    public SkillController(PlayerController playerController) {
        this.playerController = playerController;
        setupSkills();
    }

    @GetMapping
    public Map<String, Object> getSkills() {
        Map<String, Object> response = new HashMap<>();
        response.put("skillTrees", skillTrees);
        response.put("unlockedSkills", unlockedSkills);
        return response;
    }

    @PostMapping("/unlock")
    public Map<String, Object> unlockSkill(@RequestBody(required = false) UnlockRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Skill selection is required.");
        }
        String className = request.currentClass();
        String skillId = request.skillId();

        PlayerController.PlayerState state = playerController.getPlayer();
        PlayerController.ClassProgress progress = state.progress().get(className);

        Map<String, Object> response = new HashMap<>();

        if (progress == null) {
            response.put("success", false);
            response.put("message", "Invalid class.");
            return response;
        }

        if (progress.getSkillPoints() <= 0) {
            response.put("success", false);
            response.put("message", "Not enough skill points.");
            return response;
        }

        unlockedSkills.putIfAbsent(className, new HashSet<>());

        if (unlockedSkills.get(className).contains(skillId)) {
            response.put("success", false);
            response.put("message", "Skill already unlocked.");
            return response;
        }

        progress.spendSkillPoint();
        unlockedSkills.get(className).add(skillId);

        response.put("success", true);
        response.put("message", "Skill unlocked!");
        response.put("skillTrees", skillTrees);
        response.put("unlockedSkills", unlockedSkills);
        response.put("player", playerController.getPlayer());

        return response;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(org.springframework.http.HttpStatus.BAD_REQUEST)
    public Map<String, String> skillError(IllegalArgumentException exception) {
        return Map.of("message", exception.getMessage());
    }

    private void setupSkills() {
        addTree("BOOKWORM", List.of(
                skill("book_1", "Page Grinder", "Reading XP feels more powerful."),
                skill("book_2", "Deep Focus", "Better descriptions become stronger."),
                skill("book_3", "Scholar Mode", "Become an elite learner.")
        ));

        addTree("SPORT_MASTER", List.of(
                skill("sport_1", "Step Streak", "Walking actions feel boosted."),
                skill("sport_2", "Endurance", "Longer walks feel stronger."),
                skill("sport_3", "Athlete Mode", "Master real-life movement.")
        ));

        addTree("CODER", List.of(
                skill("coder_1", "Bug Slayer", "Coding XP feels stronger."),
                skill("coder_2", "Flow State", "Long sessions feel boosted."),
                skill("coder_3", "Builder Mode", "Become a project machine.")
        ));

        addTree("GAMER", List.of(
                skill("gamer_1", "Combo Mind", "Stack actions like combos."),
                skill("gamer_2", "Quest Hunter", "Daily quests feel better."),
                skill("gamer_3", "Final Boss", "Peak RPG energy.")
        ));

        addTree("EXPLORER", List.of(
                skill("explorer_1", "Pathfinder", "Exploration actions feel stronger."),
                skill("explorer_2", "Map Reader", "Discover more from real life."),
                skill("explorer_3", "Worldwalker", "Adventure master.")
        ));

        addTree("ZEN", List.of(
                skill("zen_1", "Calm Breath", "Passive XP feels better."),
                skill("zen_2", "Still Mind", "Streaks feel stronger."),
                skill("zen_3", "Monk Mode", "Peace becomes power.")
        ));
    }

    private void addTree(String className, List<Map<String, Object>> skills) {
        skillTrees.put(className, skills);
        unlockedSkills.put(className, new HashSet<>());
    }

    private Map<String, Object> skill(String id, String name, String description) {
        Map<String, Object> skill = new HashMap<>();
        skill.put("id", id);
        skill.put("name", name);
        skill.put("description", description);
        return skill;
    }

    public record UnlockRequest(String currentClass, String skillId) {}
}
