package com.lifexp.demo.controller;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FriendlyBattleService {
    private static final String[] MOVES = {"POWER", "FOCUS", "GUARD", "BURST"};
    private static final Duration WAITING_ROOM_TTL = Duration.ofMinutes(20);
    private static final Duration ACTIVE_ROOM_TTL = Duration.ofMinutes(45);
    private static final Duration COMPLETED_ROOM_TTL = Duration.ofMinutes(30);
    private static final Duration MATCHMAKING_TTL = Duration.ofMinutes(5);
    private final SaveService saveService;
    private final UserAccountRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final BattleHistoryRepository battleHistoryRepository;
    private final BattleRoomSnapshotRepository battleRoomSnapshotRepository;
    private final ObjectMapper objectMapper;
    private final Map<String, FriendlyBattleRoom> rooms = new ConcurrentHashMap<>();
    private final Map<String, MatchmakingEntry> matchmakingQueue = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public FriendlyBattleService(
            SaveService saveService,
            UserAccountRepository userRepository,
            FriendshipRepository friendshipRepository,
            BattleHistoryRepository battleHistoryRepository,
            BattleRoomSnapshotRepository battleRoomSnapshotRepository
    ) {
        this.saveService = saveService;
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
        this.battleHistoryRepository = battleHistoryRepository;
        this.battleRoomSnapshotRepository = battleRoomSnapshotRepository;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
    }

    @PostConstruct
    public void loadActiveRooms() {
        for (BattleRoomSnapshot snapshot : battleRoomSnapshotRepository.findByStatusNot("COMPLETE")) {
            try {
                FriendlyBattleRoom room = objectMapper.readValue(snapshot.payload, FriendlyBattleRoom.class);
                if (room.code != null && !room.code.isBlank()) {
                    rooms.put(room.code, room);
                }
            } catch (Exception exception) {
                battleRoomSnapshotRepository.delete(snapshot);
            }
        }
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public synchronized void cleanupStaleBattleState() {
        Instant now = Instant.now();
        matchmakingQueue.entrySet().removeIf(entry -> isOlderThan(entry.getValue().joinedAt, now, MATCHMAKING_TTL));
        rooms.entrySet().removeIf(entry -> shouldExpireRoom(entry.getValue(), now));
        battleRoomSnapshotRepository.deleteByStatusAndUpdatedAtBefore("COMPLETE", now.minus(COMPLETED_ROOM_TTL));
        battleRoomSnapshotRepository.deleteByStatusNotAndUpdatedAtBefore("COMPLETE", now.minus(ACTIVE_ROOM_TTL));
    }

    public synchronized FriendlyBattleResponse createRoom(UserAccount account) {
        return createRoom(account, "");
    }

    public synchronized FriendlyBattleResponse createRoom(UserAccount account, String invitedUsername) {
        FriendlyBattleRoom activeRoom = findActiveRoomFor(account.username);
        if (activeRoom != null) {
            return toResponse(activeRoom, account.username);
        }

        String code = createCode();
        PlayerState state = saveService.loadOrCreateNew(account);
        FriendlyBattleRoom room = new FriendlyBattleRoom();
        room.code = code;
        room.host = createPlayer(account, state);
        room.createdAt = Instant.now().toString();
        room.lastActivityAt = room.createdAt;
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
        persistRoom(room);
        return toResponse(room, account.username);
    }

    public synchronized FriendlyBattleResponse joinRoom(UserAccount account, String roomCode) {
        FriendlyBattleRoom room = requireRoom(roomCode);

        if (room.host.username.equals(account.username)) {
            return toResponse(room, account.username);
        }

        if (room.guest != null && room.guest.username.equals(account.username)) {
            return toResponse(room, account.username);
        }

        if (room.guest != null) {
            throw new IllegalArgumentException("This battle room is already full.");
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
        touchRoom(room);
        room.log.add(room.guest.displayName + " joined the room.");
        persistRoom(room);
        return toResponse(room, account.username);
    }

    public FriendlyBattleResponse getRoom(UserAccount account, String roomCode) {
        FriendlyBattleRoom room = requireRoom(roomCode);
        playerFor(room, account.username);
        return toResponse(room, account.username);
    }

    public FriendlyBattleResponse getActiveRoom(UserAccount account) {
        FriendlyBattleRoom room = findActiveRoomFor(account.username);
        return room == null ? null : toResponse(room, account.username);
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

    public synchronized MatchmakingResponse joinMatchmaking(UserAccount account) {
        FriendlyBattleRoom activeRoom = findActiveRoomFor(account.username);
        if (activeRoom != null) {
            MatchmakingResponse response = new MatchmakingResponse();
            response.status = "MATCHED";
            response.room = toResponse(activeRoom, account.username);
            return response;
        }

        for (MatchmakingEntry entry : matchmakingQueue.values()) {
            if (entry.username.equals(account.username)) continue;
            matchmakingQueue.remove(entry.username);
            matchmakingQueue.remove(account.username);

            FriendlyBattleRoom room = createMatchedRoom(entry.account, account);
            MatchmakingResponse response = new MatchmakingResponse();
            response.status = "MATCHED";
            response.room = toResponse(room, account.username);
            return response;
        }

        MatchmakingEntry entry = new MatchmakingEntry();
        entry.username = account.username;
        entry.account = account;
        entry.joinedAt = Instant.now().toString();
        matchmakingQueue.put(account.username, entry);

        MatchmakingResponse response = new MatchmakingResponse();
        response.status = "QUEUED";
        response.queueSize = matchmakingQueue.size();
        return response;
    }

    public synchronized MatchmakingResponse leaveMatchmaking(UserAccount account) {
        matchmakingQueue.remove(account.username);
        MatchmakingResponse response = new MatchmakingResponse();
        response.status = "LEFT_QUEUE";
        response.queueSize = matchmakingQueue.size();
        return response;
    }

    public List<BattleHistoryResponse> getHistory(UserAccount account) {
        return battleHistoryRepository
                .findTop20ByHostUsernameOrGuestUsernameOrderByCompletedAtDesc(account.username, account.username)
                .stream()
                .map(BattleHistoryResponse::from)
                .toList();
    }

    public BattleStatsResponse getStats() {
        BattleStatsResponse response = new BattleStatsResponse();
        response.activeRooms = (int) rooms.values().stream().filter(room -> !"COMPLETE".equals(room.status)).count();
        response.queuedPlayers = matchmakingQueue.size();
        response.completedRoomsInMemory = (int) rooms.values().stream().filter(room -> "COMPLETE".equals(room.status)).count();
        response.persistedBattleHistory = battleHistoryRepository.count();
        return response;
    }

    public synchronized FriendlyBattleResponse chooseMove(UserAccount account, String roomCode, String move, Integer expectedRound) {
        FriendlyBattleRoom room = requireRoom(roomCode);
        String normalizedMove = normalizeMove(move);

        if (room.host.username.equals(account.username)) {
            validateMoveLock(room, room.hostMove, expectedRound);
            room.hostMove = normalizedMove;
        } else if (room.guest != null && room.guest.username.equals(account.username)) {
            validateMoveLock(room, room.guestMove, expectedRound);
            room.guestMove = normalizedMove;
        } else {
            throw new IllegalArgumentException("You are not in this battle room.");
        }

        touchRoom(room);
        room.log.add(playerFor(room, account.username).displayName + " locked in a move.");

        if (room.guest != null && !room.hostMove.isBlank() && !room.guestMove.isBlank()) {
            resolveRound(room);
        }

        persistRoom(room);
        return toResponse(room, account.username);
    }

    public synchronized FriendlyBattleResponse leaveRoom(UserAccount account, String roomCode) {
        FriendlyBattleRoom room = requireRoom(roomCode);
        FriendlyBattlePlayer leavingPlayer = playerFor(room, account.username);

        if ("WAITING".equals(room.status) || room.guest == null) {
            rooms.remove(room.code);
            battleRoomSnapshotRepository.deleteById(room.code);
            return null;
        }

        if ("COMPLETE".equals(room.status)) {
            return null;
        }

        boolean hostLeft = room.host.username.equals(account.username);
        if (hostLeft) {
            room.guestWins = 3;
        } else {
            room.hostWins = 3;
        }

        room.hostMove = "";
        room.guestMove = "";
        room.status = "COMPLETE";
        room.lastResult = leavingPlayer.displayName + " left the battle. The match ended by forfeit.";
        room.log.add(0, room.lastResult);
        trimLog(room);
        touchRoom(room);
        saveBattleHistory(room);
        persistRoom(room);
        return null;
    }

    private void resolveRound(FriendlyBattleRoom room) {
        room.round += 1;

        int hostScore = moveScore(room.host, room.hostMove, room.hostPreviousMove)
                + counterBonus(room.hostMove, room.guestMove)
                + random.nextInt(4);
        int guestScore = moveScore(room.guest, room.guestMove, room.guestPreviousMove)
                + counterBonus(room.guestMove, room.hostMove)
                + random.nextInt(4);

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

        room.lastResult = result
                + " " + moveLabel(room.hostMove) + " " + hostScore
                + " vs " + moveLabel(room.guestMove) + " " + guestScore + ".";
        room.log.add(0, room.lastResult);
        trimLog(room);
        room.hostPreviousMove = room.hostMove;
        room.guestPreviousMove = room.guestMove;
        room.hostMove = "";
        room.guestMove = "";
        room.status = room.hostWins >= 3 || room.guestWins >= 3 ? "COMPLETE" : "READY";
        touchRoom(room);
        if ("COMPLETE".equals(room.status)) {
            saveBattleHistory(room);
        }
    }

    private FriendlyBattleRoom createMatchedRoom(UserAccount queuedAccount, UserAccount challengerAccount) {
        String code = createCode();
        FriendlyBattleRoom room = new FriendlyBattleRoom();
        room.code = code;
        room.host = createPlayer(queuedAccount, saveService.loadOrCreateNew(queuedAccount));
        room.guest = createPlayer(challengerAccount, saveService.loadOrCreateNew(challengerAccount));
        if (room.host.displayName.equals(room.guest.displayName)) {
            room.host.displayName = room.host.username;
            room.guest.displayName = room.guest.username;
        }
        room.status = "READY";
        room.inviteStatus = "MATCHED";
        room.createdAt = Instant.now().toString();
        room.lastActivityAt = room.createdAt;
        room.log.add(room.host.displayName + " and " + room.guest.displayName + " matched through queue.");
        rooms.put(code, room);
        persistRoom(room);
        return room;
    }

    private FriendlyBattleRoom findActiveRoomFor(String username) {
        return rooms.values().stream()
                .filter(room -> !"COMPLETE".equals(room.status))
                .filter(room -> room.host.username.equals(username)
                        || (room.guest != null && room.guest.username.equals(username)))
                .findFirst()
                .orElse(null);
    }

    private void validateMoveLock(FriendlyBattleRoom room, String existingMove, Integer expectedRound) {
        if ("WAITING".equals(room.status)) {
            throw new IllegalArgumentException("Wait for an opponent before choosing a move.");
        }
        if ("COMPLETE".equals(room.status)) {
            throw new IllegalArgumentException("This battle is already complete.");
        }
        if (expectedRound != null && expectedRound != room.round) {
            throw new IllegalArgumentException("Battle round changed. Refresh before choosing a move.");
        }
        if (!existingMove.isBlank()) {
            throw new IllegalArgumentException("Move already locked for this round.");
        }
    }

    private void touchRoom(FriendlyBattleRoom room) {
        room.lastActivityAt = Instant.now().toString();
    }

    private boolean shouldExpireRoom(FriendlyBattleRoom room, Instant now) {
        if ("COMPLETE".equals(room.status)) {
            return isOlderThan(room.lastActivityAt, now, COMPLETED_ROOM_TTL);
        }

        Duration ttl = "WAITING".equals(room.status) ? WAITING_ROOM_TTL : ACTIVE_ROOM_TTL;
        boolean expired = isOlderThan(room.lastActivityAt, now, ttl);
        if (expired) {
            battleRoomSnapshotRepository.deleteById(room.code);
        }
        return expired;
    }

    private boolean isOlderThan(String instantText, Instant now, Duration duration) {
        try {
            return Instant.parse(instantText).isBefore(now.minus(duration));
        } catch (Exception exception) {
            return true;
        }
    }

    private void persistRoom(FriendlyBattleRoom room) {
        try {
            BattleRoomSnapshot snapshot = battleRoomSnapshotRepository.findById(room.code).orElseGet(BattleRoomSnapshot::new);
            snapshot.roomCode = room.code;
            snapshot.hostUsername = room.host.username;
            snapshot.guestUsername = room.guest == null ? "" : room.guest.username;
            snapshot.status = room.status;
            snapshot.payload = objectMapper.writeValueAsString(room);
            snapshot.createdAt = snapshot.createdAt == null ? Instant.now() : snapshot.createdAt;
            snapshot.updatedAt = Instant.now();
            battleRoomSnapshotRepository.save(snapshot);
        } catch (Exception exception) {
            // In-memory battle play should continue even if snapshot persistence fails.
        }
    }

    private void saveBattleHistory(FriendlyBattleRoom room) {
        if (room.historySaved) return;

        BattleHistory history = new BattleHistory();
        history.roomCode = room.code;
        history.hostUsername = room.host.username;
        history.guestUsername = room.guest == null ? "" : room.guest.username;
        history.winnerUsername = room.hostWins > room.guestWins ? room.host.username : room.guest.username;
        history.rounds = room.round;
        history.hostWins = room.hostWins;
        history.guestWins = room.guestWins;
        history.summary = String.join("\n", room.log);
        battleHistoryRepository.save(history);
        room.historySaved = true;
    }

    private int moveScore(FriendlyBattlePlayer player, String move, String previousMove) {
        int base = 50 + playerBattleModifier(player);
        switch (move) {
            case "POWER":
                return base + 4 + repeatMovePenalty(move, previousMove);
            case "FOCUS":
                return base + repeatMovePenalty(move, previousMove);
            case "GUARD":
                return base + 1 + repeatMovePenalty(move, previousMove);
            case "BURST":
                return base + 3 + repeatMovePenalty(move, previousMove);
            default:
                return base;
        }
    }

    private int playerBattleModifier(FriendlyBattlePlayer player) {
        int levelBonus = Math.min(5, Math.max(0, player.level - 1) / 2);
        int masteryBonus = Math.min(4, player.classMastery / 25);
        int skillBonus = Math.min(3, player.skillPoints);
        int bossBonus = Math.min(3, player.bossesDefeated);
        int energyBonus = player.energy >= 75 ? 2 : player.energy >= 40 ? 1 : 0;
        return levelBonus + masteryBonus + skillBonus + bossBonus + energyBonus;
    }

    private int repeatMovePenalty(String move, String previousMove) {
        return move.equals(previousMove) ? -5 : 0;
    }

    private int counterBonus(String move, String opponentMove) {
        if (move.equals("FOCUS") && opponentMove.equals("POWER")) return 12;
        if (move.equals("POWER") && opponentMove.equals("GUARD")) return 12;
        if (move.equals("GUARD") && opponentMove.equals("BURST")) return 12;
        if (move.equals("BURST") && opponentMove.equals("FOCUS")) return 12;
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
        String hostPreviousMove = "";
        String guestPreviousMove = "";
        String lastResult = "";
        String createdAt = "";
        String lastActivityAt = "";
        String invitedUsername = "";
        String inviteStatus = "";
        boolean historySaved = false;
        List<String> log = new ArrayList<>();
    }

    private static class MatchmakingEntry {
        String username;
        UserAccount account;
        String joinedAt;
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

    public static class MatchmakingResponse {
        public String status;
        public int queueSize;
        public FriendlyBattleResponse room;
    }

    public static class BattleHistoryResponse {
        public Long id;
        public String roomCode;
        public String hostUsername;
        public String guestUsername;
        public String winnerUsername;
        public int rounds;
        public int hostWins;
        public int guestWins;
        public String summary;
        public String completedAt;

        static BattleHistoryResponse from(BattleHistory history) {
            BattleHistoryResponse response = new BattleHistoryResponse();
            response.id = history.id;
            response.roomCode = history.roomCode;
            response.hostUsername = history.hostUsername;
            response.guestUsername = history.guestUsername;
            response.winnerUsername = history.winnerUsername;
            response.rounds = history.rounds;
            response.hostWins = history.hostWins;
            response.guestWins = history.guestWins;
            response.summary = history.summary;
            response.completedAt = history.completedAt == null ? "" : history.completedAt.toString();
            return response;
        }
    }

    public static class BattleStatsResponse {
        public int activeRooms;
        public int queuedPlayers;
        public int completedRoomsInMemory;
        public long persistedBattleHistory;
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
