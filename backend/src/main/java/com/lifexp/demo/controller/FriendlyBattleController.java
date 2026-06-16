package com.lifexp.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friendly-battle")
@CrossOrigin(originPatterns = "*")
public class FriendlyBattleController {
    private final FriendlyBattleService battleService;
    private final AuthService authService;

    public FriendlyBattleController(FriendlyBattleService battleService, AuthService authService) {
        this.battleService = battleService;
        this.authService = authService;
    }

    @PostMapping("/rooms")
    public FriendlyBattleService.FriendlyBattleResponse createRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) BattleInviteRequest request
    ) {
        String invitedUsername = request == null ? "" : request.invitedUsername;
        return battleService.createRoom(authService.requireAccount(authorization), invitedUsername);
    }

    @GetMapping("/invites")
    public List<FriendlyBattleService.FriendlyBattleResponse> getInvites(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.getInvites(authService.requireAccount(authorization));
    }

    @GetMapping("/active")
    public FriendlyBattleService.FriendlyBattleResponse getActiveRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.getActiveRoom(authService.requireAccount(authorization));
    }

    @PostMapping("/matchmaking/join")
    public FriendlyBattleService.MatchmakingResponse joinMatchmaking(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.joinMatchmaking(authService.requireAccount(authorization));
    }

    @PostMapping("/matchmaking/leave")
    public FriendlyBattleService.MatchmakingResponse leaveMatchmaking(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.leaveMatchmaking(authService.requireAccount(authorization));
    }

    @GetMapping("/history")
    public List<FriendlyBattleService.BattleHistoryResponse> getHistory(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.getHistory(authService.requireAccount(authorization));
    }

    @GetMapping("/stats")
    public FriendlyBattleService.BattleStatsResponse getStats() {
        return battleService.getStats();
    }

    @PostMapping("/rooms/join")
    public FriendlyBattleService.FriendlyBattleResponse joinRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody BattleRoomRequest request
    ) {
        return battleService.joinRoom(authService.requireAccount(authorization), request.code);
    }

    @GetMapping("/rooms/{code}")
    public FriendlyBattleService.FriendlyBattleResponse getRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String code
    ) {
        return battleService.getRoom(authService.requireAccount(authorization), code);
    }

    @PostMapping("/rooms/{code}/move")
    public FriendlyBattleService.FriendlyBattleResponse chooseMove(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String code,
            @RequestBody BattleMoveRequest request
    ) {
        return battleService.chooseMove(authService.requireAccount(authorization), code, request.move, request.round);
    }

    @PostMapping("/rooms/{code}/leave")
    public FriendlyBattleService.FriendlyBattleResponse leaveRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String code
    ) {
        return battleService.leaveRoom(authService.requireAccount(authorization), code);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> battleError(IllegalArgumentException exception) {
        return Map.of("message", exception.getMessage());
    }

    public static class BattleRoomRequest {
        public String code;
    }

    public static class BattleInviteRequest {
        public String invitedUsername;
    }

    public static class BattleMoveRequest {
        public String move;
        public Integer round;
    }
}
