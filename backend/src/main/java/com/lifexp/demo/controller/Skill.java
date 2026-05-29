package com.lifexp.demo.controller;

public class Skill {
    private String code;
    private String name;
    private String description;
    private String branch;
    private int cost;
    private boolean unlocked;
    private boolean eligible;

    public Skill(String code, String name, String description, String branch, int cost) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.branch = branch;
        this.cost = cost;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getBranch() { return branch; }
    public int getCost() { return cost; }
    public boolean isUnlocked() { return unlocked; }
    public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }
    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }
}
