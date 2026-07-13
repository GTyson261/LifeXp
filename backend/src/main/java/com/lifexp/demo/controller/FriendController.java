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

import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(originPatterns = "*")
public class FriendController {
    private final FriendService friendService;
    private final AuthService authService;

    public FriendController(FriendService friendService, AuthService authService) {
        this.friendService = friendService;
        this.authService = authService;
    }

    @GetMapping
    public FriendService.FriendsResponse getFriends(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return friendService.getFriends(requireAuthenticatedAccount(authorization));
    }

    @PostMapping("/request")
    public FriendService.FriendsResponse sendRequest(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) FriendRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException("Friend username is required.");
        }
        return friendService.sendRequest(requireAuthenticatedAccount(authorization), request.username);
    }

    @PostMapping("/{friendshipId}/accept")
    public FriendService.FriendsResponse acceptRequest(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long friendshipId
    ) {
        return friendService.acceptRequest(requireAuthenticatedAccount(authorization), friendshipId);
    }

    @PostMapping("/{friendshipId}/decline")
    public FriendService.FriendsResponse declineRequest(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long friendshipId
    ) {
        return friendService.declineRequest(requireAuthenticatedAccount(authorization), friendshipId);
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
    public Map<String, String> friendError(IllegalArgumentException exception) {
        return Map.of("message", exception.getMessage());
    }

    public static class FriendRequest {
        public String username;
    }
}
