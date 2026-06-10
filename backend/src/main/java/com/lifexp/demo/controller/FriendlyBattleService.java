package com.lifexp.demo.controller;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FriendlyBattleService {
    private static final String[] MOVES = {"POWER", "FOCUS", "GUARD", "BURST"};
    private final SaveService saveService;
    private final UserAccountRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final Map<String, FriendlyBattleRoom> rooms = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public FriendlyBattleService(
            SaveService saveService,
            UserAccountRepository userRepository,
            FriendshipRepository friendshipRepository
    ) {
        this.saveService = saveService;
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
    }

    public FriendlyBattleResponse createRoom(UserAccount account) {
        return createRoom(account, "");
    }

    public FriendlyBattleResponse createRoom(UserAccount account, String invitedUsername) {
        String code = createCode();
        PlayerState state = saveService.loadOrCreateNew(account);
        FriendlyBattleRoom room = new FriendlyBattleRoom();
        room.code = code;
        room.host = createPlayer(account, state);
        room.createdAt = Instant.now().toString();
        room.status = "WAITING";
        String normalizedInvite = normalizeOptionalUsername(invitedUsername);
        if (!normalizedInvite.isBlank()) {
            validateInvite(account, normalizedInvite);
            room.invitedUsername = normalizedInvite;
            room.inviteStatus = "INVITED";
            room.log.add(room.host.displayName + " invited @" + normalizedInvite + " to a friendly battle.");
        } else {
            room.log.add(room.host.displayName + " opened a friendly battle room.");
        }
        rooms.put(code, room);
        return toResponse(room, account.username);
    }

    public FriendlyBattleResponse joinRoom(UserAccount account, String roomCode) {
        FriendlyBattleRoom room = requireRoom(roomCode);

        if (room.host.username.equals(account.username)) {
            return toResponse(room, account.username);
        }

        if (!room.invitedUsername.isBlank() && !room.invitedUsername.equals(account.username)) {
            throw new IllegalArgumentException("This battle invite is for another friend.");
        }

        PlayerState state = saveService.loadOrCreateNew(account);
        room.guest = createPlayer(account, state);
        if (room.host.displayName.equals(room.guest.displayName)) {
            room.host.displayName = room.host.username;
            room.guest.displayName = room.guest.username;
        }
        room.status = "READY";
        room.inviteStatus = "ACCEPTED";
        room.hostMove = "";
        room.guestMove = "";
        room.log.add(room.guest.displayName + " joined the room.");
        return toResponse(room, account.username);
    }

    public FriendlyBattleResponse getRoom(UserAccount account, String roomCode) {
        return toResponse(requireRoom(roomCode), account.username);
    }

    public List<FriendlyBattleResponse> getInvites(UserAccount account) {
        List<FriendlyBattleResponse> invites = new ArrayList<>();
        for (FriendlyBattleRoom room : rooms.values()) {
            boolean isPendingInvite = room.guest == null
                    && "WAITING".equals(room.status)
                    && "INVITED".equals(room.inviteStatus)
                    && room.invitedUsername.equals(account.username);
            if (isPendingInvite) {
                invites.add(toResponse(room, account.username));
            }
        }
        return invites;
    }

    public FriendlyBattleResponse chooseMove(UserAccount account, String roomCode, String move) {
        FriendlyBattleRoom room = requireRoom(roomCode);
        String normalizedMove = normalizeMove(move);

        if (room.host.username.equals(account.username)) {
            room.hostMove = normalizedMove;
        } else if (room.guest != null && room.guest.username.equals(account.username)) {
            room.guestMove = normalizedMove;
        } else {
            throw new IllegalArgumentException("You are not in this battle room.");
        }

        room.log.add(playerFor(room, account.username).displayName + " locked in " + moveLabel(normalizedMove) + ".");

        if (room.guest != null && !room.hostMove.isBlank() && !room.guestMove.isBlank()) {
            resolveRound(room);
        }

        return toResponse(room, account.username);
    }

    private void resolveRound(FriendlyBattleRoom room) {
        room.round += 1;

        int hostScore = moveScore(room.host, room.hostMove) + counterBonus(room.hostMove, room.guestMove) + random.nextInt(7);
        int guestScore = moveScore(room.guest, room.guestMove) + counterBonus(room.guestMove, room.hostMove) + random.nextInt(7);

        String result;
        if (hostScore == guestScore) {
            result = "Round " + room.round + " ended in a draw.";
        } else if (hostScore > guestScore) {
            room.hostWins += 1;
            result = "Round " + room.round + ": " + room.host.displayName + " edged out " + room.guest.displayName + ".";
        } else {
            room.guestWins += 1;
            result = "Round " + room.round + ": " + room.guest.displayName + " edged out " + room.host.displayName + ".";
        }

        room.lastResult = result + " " + room.host.displayName + " " + hostScore + " vs " + room.guest.displayName + " " + guestScore + ".";
        room.log.add(0, room.lastResult);
        trimLog(room);
        room.hostMove = "";
        room.guestMove = "";
        room.status = room.hostWins >= 3 || room.guestWins >= 3 ? "COMPLETE" : "READY";
    }

    private int moveScore(FriendlyBattlePlayer player, String move) {
        int base = player.level * 8 + player.classMastery / 8 + player.energy / 5 + player.bossesDefeated * 4;
        switch (move) {
            case "POWER":
                return base + 18 + player.level;
            case "FOCUS":
                return base + 14 + player.skillPoints * 3;
            case "GUARD":
                return base + 12 + player.energy / 4;
            case "BURST":
                return base + 10 + player.bossesDefeated * 5 + random.nextInt(12);
            default:
                return base;
        }
    }

    private int counterBonus(String move, String opponentMove) {
        if (move.equals("FOCUS") && opponentMove.equals("POWER")) return 10;
        if (move.equals("POWER") && opponentMove.equals("GUARD")) return 8;
        if (move.equals("GUARD") && opponentMove.equals("BURST")) return 10;
        if (move.equals("BURST") && opponentMove.equals("FOCUS")) return 8;
        return 0;
    }

    private FriendlyBattlePlayer createPlayer(UserAccount account, PlayerState state) {
        FriendlyBattlePlayer player = new FriendlyBattlePlayer();
        player.username = account.username;
        player.displayName = state.playerName == null || state.playerName.isBlank() ? account.username : state.playerName;
        player.primaryClass = state.primaryClass;
        player.title = state.title;
        player.level = state.level;
        player.energy = state.energy;
        player.skillPoints = state.skillPoints;
        player.classMastery = state.classMastery;
        player.bossesDefeated = state.bossesDefeated;
        return player;
    }

    private FriendlyBattleRoom requireRoom(String roomCode) {
        String code = normalizeCode(roomCode);
        FriendlyBattleRoom room = rooms.get(code);
        if (room == null) {
            throw new IllegalArgumentException("Friendly battle room not found.");
        }
        return room;
    }

    private FriendlyBattlePlayer playerFor(FriendlyBattleRoom room, String username) {
        if (room.host.username.equals(username)) return room.host;
        if (room.guest != null && room.guest.username.equals(username)) return room.guest;
        throw new IllegalArgumentException("You are not in this battle room.");
    }

    private FriendlyBattleResponse toResponse(FriendlyBattleRoom room, String viewerUsername) {
        FriendlyBattleResponse response = new FriendlyBattleResponse();
        response.code = room.code;
        response.host = room.host;
        response.guest = room.guest;
        response.status = room.status;
        response.round = room.round;
        response.hostWins = room.hostWins;
        response.guestWins = room.guestWins;
        response.lastResult = room.lastResult;
        response.invitedUsername = room.invitedUsername;
        response.inviteStatus = room.inviteStatus;
        response.log = new ArrayList<>(room.log);
        response.viewerMoveLocked = room.host.username.equals(viewerUsername)
                ? !room.hostMove.isBlank()
                : room.guest != null && room.guest.username.equals(viewerUsername) && !room.guestMove.isBlank();
        response.opponentMoveLocked = room.host.username.equals(viewerUsername)
                ? room.guest != null && !room.guestMove.isBlank()
                : !room.hostMove.isBlank();
        return response;
    }

    private void validateInvite(UserAccount account, String invitedUsername) {
        if (account.username.equals(invitedUsername)) {
            throw new IllegalArgumentException("You cannot invite yourself.");
        }

        UserAccount invited = userRepository.findByUsername(invitedUsername)
                .orElseThrow(() -> new IllegalArgumentException("No player found with that username."));

        boolean acceptedFriend = false;
        for (Friendship friendship : friendshipRepository.findByRequesterIdOrReceiverId(account.id, account.id)) {
            boolean samePair = (friendship.requesterId.equals(account.id) && friendship.receiverId.equals(invited.id))
                    || (friendship.requesterId.equals(invited.id) && friendship.receiverId.equals(account.id));
            if (samePair && "ACCEPTED".equals(friendship.status)) {
                acceptedFriend = true;
                break;
            }
        }

        if (!acceptedFriend) {
            throw new IllegalArgumentException("Invite an accepted friend.");
        }
    }

    private String createCode() {
        String code;
        do {
            code = String.valueOf(100000 + random.nextInt(900000));
        } while (rooms.containsKey(code));
        return code;
    }

    private String normalizeCode(String roomCode) {
        String code = roomCode == null ? "" : roomCode.trim();
        if (!code.matches("[0-9]{6}")) {
            throw new IllegalArgumentException("Use the 6-digit battle code.");
        }
        return code;
    }

    private String normalizeMove(String move) {
        String value = move == null ? "" : move.trim().toUpperCase(Locale.ROOT);
        for (String allowedMove : MOVES) {
            if (allowedMove.equals(value)) return value;
        }
        throw new IllegalArgumentException("Choose a valid friendly battle move.");
    }

    private String normalizeOptionalUsername(String username) {
        String value = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
        if (value.isBlank()) return "";
        if (!value.matches("[a-z0-9_]{3,32}")) {
            throw new IllegalArgumentException("Use a valid friend username.");
        }
        return value;
    }

    private String moveLabel(String move) {
        switch (move) {
            case "POWER": return "Power Strike";
            case "FOCUS": return "Focus Counter";
            case "GUARD": return "Guard Stance";
            case "BURST": return "Limit Burst";
            default: return move;
        }
    }

    private void trimLog(FriendlyBattleRoom room) {
        while (room.log.size() > 8) {
            room.log.remove(room.log.size() - 1);
        }
    }

    private static class FriendlyBattleRoom {
        String code;
        FriendlyBattlePlayer host;
        FriendlyBattlePlayer guest;
        String status = "WAITING";
        int round = 0;
        int hostWins = 0;
        int guestWins = 0;
        String hostMove = "";
        String guestMove = "";
        String lastResult = "";
        String createdAt = "";
        String invitedUsername = "";
        String inviteStatus = "";
        List<String> log = new ArrayList<>();
    }

    public static class FriendlyBattleResponse {
        public String code;
        public FriendlyBattlePlayer host;
        public FriendlyBattlePlayer guest;
        public String status;
        public int round;
        public int hostWins;
        public int guestWins;
        public String lastResult;
        public String invitedUsername;
        public String inviteStatus;
        public boolean viewerMoveLocked;
        public boolean opponentMoveLocked;
        public List<String> log;
    }

    public static class FriendlyBattlePlayer {
        public String username;
        public String displayName;
        public String primaryClass;
        public String title;
        public int level;
        public int energy;
        public int skillPoints;
        public int classMastery;
        public int bossesDefeated;
    }
}
