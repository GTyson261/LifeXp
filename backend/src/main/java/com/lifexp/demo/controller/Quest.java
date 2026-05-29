package com.lifexp.demo.controller;

public class Quest {
    private int id;
    private String title;
    private String description;
    private String type;
    private int progress;
    private int target;
    private int rewardXp;
    private boolean completed;
    private boolean claimed;

    public Quest(int id, String title, String description, String type, int target, int rewardXp) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.target = target;
        this.rewardXp = rewardXp;
    }

    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getType() { return type; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    public int getTarget() { return target; }
    public int getRewardXp() { return rewardXp; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public boolean isClaimed() { return claimed; }
    public void setClaimed(boolean claimed) { this.claimed = claimed; }
}
