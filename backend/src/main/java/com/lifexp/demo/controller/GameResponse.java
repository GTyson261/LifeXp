package com.lifexp.demo.controller;

import java.util.List;

public class GameResponse {
    private PlayerState player;
    private List<Quest> quests;
    private List<Skill> skills;
    private boolean leveledUp;
    private String message;

    public GameResponse(PlayerState player, List<Quest> quests, List<Skill> skills, boolean leveledUp, String message) {
        this.player = player;
        this.quests = quests;
        this.skills = skills;
        this.leveledUp = leveledUp;
        this.message = message;
    }

    public PlayerState getPlayer() { return player; }
    public List<Quest> getQuests() { return quests; }
    public List<Skill> getSkills() { return skills; }
    public boolean isLeveledUp() { return leveledUp; }
    public String getMessage() { return message; }
}
