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
import org.springframework.web.server.ResponseStatusException;

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
        return battleService.createRoom(requireAuthenticatedAccount(authorization), invitedUsername);
    }

    @GetMapping("/invites")
    public List<FriendlyBattleService.FriendlyBattleResponse> getInvites(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.getInvites(requireAuthenticatedAccount(authorization));
    }

    @GetMapping("/active")
    public FriendlyBattleService.FriendlyBattleResponse getActiveRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.getActiveRoom(requireAuthenticatedAccount(authorization));
    }

    @PostMapping("/matchmaking/join")
    public FriendlyBattleService.MatchmakingResponse joinMatchmaking(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.joinMatchmaking(requireAuthenticatedAccount(authorization));
    }

    @PostMapping("/matchmaking/leave")
    public FriendlyBattleService.MatchmakingResponse leaveMatchmaking(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.leaveMatchmaking(requireAuthenticatedAccount(authorization));
    }

    @GetMapping("/history")
    public List<FriendlyBattleService.BattleHistoryResponse> getHistory(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return battleService.getHistory(requireAuthenticatedAccount(authorization));
    }

    @GetMapping("/stats")
    public FriendlyBattleService.BattleStatsResponse getStats() {
        return battleService.getStats();
    }

    @PostMapping("/rooms/join")
    public FriendlyBattleService.FriendlyBattleResponse joinRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) BattleRoomRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException("Battle room code is required.");
        }
        return battleService.joinRoom(requireAuthenticatedAccount(authorization), request.code);
    }

    @GetMapping("/rooms/{code}")
    public FriendlyBattleService.FriendlyBattleResponse getRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String code
    ) {
        return battleService.getRoom(requireAuthenticatedAccount(authorization), code);
    }

    @PostMapping("/rooms/{code}/move")
    public FriendlyBattleService.FriendlyBattleResponse chooseMove(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String code,
            @RequestBody(required = false) BattleMoveRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException("Battle move is required.");
        }
        return battleService.chooseMove(requireAuthenticatedAccount(authorization), code, request.move, request.round);
    }

    @PostMapping("/rooms/{code}/leave")
    public FriendlyBattleService.FriendlyBattleResponse leaveRoom(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String code
    ) {
        return battleService.leaveRoom(requireAuthenticatedAccount(authorization), code);
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
