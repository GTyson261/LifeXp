package com.lifexp.demo.controller;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ActionRequest {
    @NotBlank
    private String type;
    @Min(1)
    private int xp;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }
}
