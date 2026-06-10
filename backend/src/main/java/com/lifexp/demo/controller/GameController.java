package com.lifexp.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(originPatterns = "*")
public class GameController {
    private final GameService gameService;
    private final AuthService authService;

    public GameController(GameService gameService, AuthService authService) {
        this.gameService = gameService;
        this.authService = authService;
    }

    @GetMapping("/state")
    public PlayerState getState(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return runAsUser(authorization, () -> gameService.getState());
    }

    @PostMapping("/activity")
    public PlayerState completeActivity(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody ActivityRequest request) {
        return runAsUser(authorization, () -> gameService.completeActivity(request));
    }

    @PostMapping("/sanctuary/change-primary-class")
    public PlayerState changePrimaryClassAtSanctuary(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody ClassRequest request) {
        return runAsUser(authorization, () -> gameService.changePrimaryClassAtSanctuary(request.className));
    }

    @PostMapping("/intro/class")
    public PlayerState chooseIntroClass(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody ClassRequest request) {
        return runAsUser(authorization, () -> gameService.chooseIntroClass(request.className));
    }

    @PostMapping("/avatar")
    public PlayerState updateAvatar(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody PlayerState.Avatar avatar) {
        return runAsUser(authorization, () -> gameService.updateAvatar(avatar));
    }

    @PostMapping("/skill")
    public PlayerState unlockSkill(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody SkillRequest request) {
        return runAsUser(authorization, () -> gameService.unlockSkill(request.skillId));
    }

    @PostMapping("/quest/claim")
    public PlayerState claimQuest(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody QuestClaimRequest request) {
        return runAsUser(authorization, () -> gameService.claimQuest(request.questId));
    }

    @PostMapping("/shop/buy")
    public PlayerState buyShopItem(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody PurchaseRequest request) {
        return runAsUser(authorization, () -> gameService.buyShopItem(request.itemId));
    }

    @PostMapping("/inventory/equip")
    public PlayerState equipInventoryItem(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody EquipRequest request) {
        return runAsUser(authorization, () -> gameService.equipInventoryItem(request.itemId));
    }

    @PostMapping("/reset")
    public PlayerState reset(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return runAsUser(authorization, () -> gameService.reset());
    }

    @PostMapping("/save")
    public PlayerState save(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return runAsUser(authorization, () -> gameService.forceSave());
    }

    @PostMapping("/rest")
    public PlayerState rest(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return runAsUser(authorization, () -> gameService.rest());
    }

    @PostMapping("/daily-login/claim")
    public PlayerState claimDailyLoginReward(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return runAsUser(authorization, () -> gameService.claimDailyLoginReward());
    }

    @PostMapping("/load")
    public PlayerState load(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return runAsUser(authorization, () -> gameService.reloadSave());
    }

    @GetMapping("/save-location")
    public String saveLocation() {
        return gameService.getSaveLocation();
    }

    @PostMapping("/world/travel")
    public PlayerState travelToWorld(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody WorldTravelRequest request) {
        return runAsUser(authorization, () -> gameService.travelToWorld(request.worldId));
    }

    private PlayerState runAsUser(String authorization, java.util.function.Supplier<PlayerState> action) {
        try {
            return gameService.withAccount(authService.requireAccount(authorization), action);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, exception.getMessage());
        }
    }
}
