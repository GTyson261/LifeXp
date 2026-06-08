package com.lifexp.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping("/")
    public String home() {
        return "LifeXP backend is running. Open the app at http://localhost:5173 or check the API at /api/game/state.";
    }
}
