package com.lifexp.demo.controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class QuestController {

    private final PlayerController playerController;
    private final List<Map<String, Object>> quests = new ArrayList<>();
    private LocalDate lastResetDate = LocalDate.now();

    public QuestController(PlayerController playerController) {
        this.playerController = playerController;
        resetQuests();
    }

    @GetMapping("/quests")
    public List<Map<String, Object>> getQuests() {
        resetIfNewDay();
        return quests;
    }

    @PostMapping("/quests/{id}/complete")
    public Map<String, Object> completeQuest(
            @PathVariable int id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        resetIfNewDay();

        String currentClass = body != null && body.containsKey("currentClass")
                ? body.get("currentClass")
                : "CODER";

        for (Map<String, Object> quest : quests) {
            int questId = ((Number) quest.get("id")).intValue();

            if (questId == id && !(boolean) quest.get("completed")) {
                quest.put("completed", true);

                int rewardXp = ((Number) quest.get("rewardXp")).intValue();
                Map<String, Object> player = playerController.applyXp(currentClass, rewardXp);

                Map<String, Object> response = new HashMap<>();
                response.put("quests", quests);
                response.put("player", player);
                response.put("rewardXp", rewardXp);
                return response;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("quests", quests);
        response.put("player", playerController.getPlayer());
        response.put("rewardXp", 0);
        return response;
    }

    private void resetIfNewDay() {
        LocalDate today = LocalDate.now();

        if (!today.equals(lastResetDate)) {
            lastResetDate = today;
            resetQuests();
        }
    }

    private void resetQuests() {
        quests.clear();

        quests.add(createQuest(
                1,
                "Daily Focus",
                "Complete one study or reading action.",
                "BOOKWORM",
                25
        ));

        quests.add(createQuest(
                2,
                "Move Your Body",
                "Complete one walking or workout action.",
                "SPORT_MASTER",
                35
        ));

        quests.add(createQuest(
                3,
                "Build Something",
                "Complete one coding action.",
                "CODER",
                30
        ));

        quests.add(createQuest(
                4,
                "Calm Mind",
                "Gain passive XP or do a zen activity.",
                "ZEN",
                20
        ));
    }

    private Map<String, Object> createQuest(
            int id,
            String title,
            String description,
            String type,
            int rewardXp
    ) {
        Map<String, Object> quest = new HashMap<>();
        quest.put("id", id);
        quest.put("title", title);
        quest.put("description", description);
        quest.put("type", type);
        quest.put("rewardXp", rewardXp);
        quest.put("completed", false);
        return quest;
    }
}