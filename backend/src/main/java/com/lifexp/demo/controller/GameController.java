package com.lifexp.demo.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/state")
    public PlayerState getState() {
        return gameService.getState();
    }

    @PostMapping("/activity")
    public PlayerState completeActivity(@RequestBody ActivityRequest request) {
        return gameService.completeActivity(request);
    }

    @PostMapping("/sanctuary/change-primary-class")
    public PlayerState changePrimaryClassAtSanctuary(@RequestBody ClassRequest request) {
        return gameService.changePrimaryClassAtSanctuary(request.className);
    }

    @PostMapping("/avatar")
    public PlayerState updateAvatar(@RequestBody PlayerState.Avatar avatar) {
        return gameService.updateAvatar(avatar);
    }

    @PostMapping("/skill")
    public PlayerState unlockSkill(@RequestBody SkillRequest request) {
        return gameService.unlockSkill(request.skillId);
    }

    @PostMapping("/shop/buy")
    public PlayerState buyShopItem(@RequestBody PurchaseRequest request) {
        return gameService.buyShopItem(request.itemId);
    }

    @PostMapping("/inventory/equip")
    public PlayerState equipInventoryItem(@RequestBody EquipRequest request) {
        return gameService.equipInventoryItem(request.itemId);
    }

    @PostMapping("/reset")
    public PlayerState reset() {
        return gameService.reset();
    }

    @PostMapping("/save")
    public PlayerState save() {
        return gameService.forceSave();
    }

    @PostMapping("/rest")
    public PlayerState rest() {
        return gameService.rest();
    }

    @PostMapping("/load")
    public PlayerState load() {
        return gameService.reloadSave();
    }

    @GetMapping("/save-location")
    public String saveLocation() {
        return gameService.getSaveLocation();
    }

    @PostMapping("/world/travel")
    public PlayerState travelToWorld(@RequestBody WorldTravelRequest request) {
        return gameService.travelToWorld(request.worldId);
    }
}