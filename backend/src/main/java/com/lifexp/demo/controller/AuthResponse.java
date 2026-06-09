package com.lifexp.demo.controller;

public class AuthResponse {
    public String token;
    public String username;
    public PlayerState player;

    public AuthResponse(String token, String username, PlayerState player) {
        this.token = token;
        this.username = username;
        this.player = player;
    }
}
