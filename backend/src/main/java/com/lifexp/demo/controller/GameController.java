package com.lifexp.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

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
    public PlayerState completeActivity(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) ActivityRequest request) {
        return runAsUser(authorization, () -> gameService.completeActivity(request));
    }

    @PostMapping("/sanctuary/change-primary-class")
    public PlayerState changePrimaryClassAtSanctuary(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) ClassRequest request) {
        ClassRequest body = requireRequest(request, "Class selection is required.");
        return runAsUser(authorization, () -> gameService.changePrimaryClassAtSanctuary(body.className));
    }

    @PostMapping("/intro/class")
    public PlayerState chooseIntroClass(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) ClassRequest request) {
        ClassRequest body = requireRequest(request, "Class selection is required.");
        return runAsUser(authorization, () -> gameService.chooseIntroClass(body.className));
    }

    @PostMapping("/avatar")
    public PlayerState updateAvatar(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) PlayerState.Avatar avatar) {
        return runAsUser(authorization, () -> gameService.updateAvatar(avatar));
    }

    @PostMapping("/skill")
    public PlayerState unlockSkill(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) SkillRequest request) {
        SkillRequest body = requireRequest(request, "Skill selection is required.");
        return runAsUser(authorization, () -> gameService.unlockSkill(body.skillId));
    }

    @PostMapping("/quest/claim")
    public PlayerState claimQuest(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) QuestClaimRequest request) {
        QuestClaimRequest body = requireRequest(request, "Quest selection is required.");
        return runAsUser(authorization, () -> gameService.claimQuest(body.questId));
    }

    @PostMapping("/shop/buy")
    public PlayerState buyShopItem(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) PurchaseRequest request) {
        PurchaseRequest body = requireRequest(request, "Shop item selection is required.");
        return runAsUser(authorization, () -> gameService.buyShopItem(body.itemId));
    }

    @PostMapping("/inventory/equip")
    public PlayerState equipInventoryItem(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) EquipRequest request) {
        EquipRequest body = requireRequest(request, "Inventory item selection is required.");
        return runAsUser(authorization, () -> gameService.equipInventoryItem(body.itemId));
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
    public String saveLocation(@RequestHeader(value = "Authorization", required = false) String authorization) {
        requireAuthenticatedAccount(authorization);
        return gameService.getSaveLocation();
    }

    @PostMapping("/world/travel")
    public PlayerState travelToWorld(@RequestHeader(value = "Authorization", required = false) String authorization, @RequestBody(required = false) WorldTravelRequest request) {
        WorldTravelRequest body = requireRequest(request, "World selection is required.");
        return runAsUser(authorization, () -> gameService.travelToWorld(body.worldId));
    }

    private <T> T requireRequest(T request, String message) {
        if (request == null) {
            throw new IllegalArgumentException(message);
        }
        return request;
    }

    private PlayerState runAsUser(String authorization, java.util.function.Supplier<PlayerState> action) {
        return gameService.withAccount(requireAuthenticatedAccount(authorization), action);
    }

    private UserAccount requireAuthenticatedAccount(String authorization) {
        try {
            return authService.requireAccount(authorization);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, exception.getMessage());
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> gameActionError(IllegalArgumentException exception) {
        return Map.of("message", exception.getMessage());
    }
}
