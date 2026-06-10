package com.lifexp.demo.controller;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class FriendService {
    private final FriendshipRepository friendshipRepository;
    private final UserAccountRepository userRepository;
    private final SaveService saveService;

    public FriendService(FriendshipRepository friendshipRepository, UserAccountRepository userRepository, SaveService saveService) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.saveService = saveService;
    }

    public FriendsResponse getFriends(UserAccount account) {
        FriendsResponse response = new FriendsResponse();

        for (Friendship friendship : friendshipRepository.findByRequesterIdOrReceiverId(account.id, account.id)) {
            UserAccount other = otherUser(account, friendship);
            if (other == null) continue;

            FriendSummary summary = createSummary(other, friendship);
            if ("ACCEPTED".equals(friendship.status)) {
                response.friends.add(summary);
            } else if ("PENDING".equals(friendship.status) && friendship.receiverId.equals(account.id)) {
                response.incomingRequests.add(summary);
            } else if ("PENDING".equals(friendship.status) && friendship.requesterId.equals(account.id)) {
                response.outgoingRequests.add(summary);
            }
        }

        return response;
    }

    public FriendsResponse sendRequest(UserAccount account, String username) {
        String targetUsername = normalizeUsername(username);

        if (account.username.equals(targetUsername)) {
            throw new IllegalArgumentException("You cannot add yourself as a friend.");
        }

        UserAccount target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("No player found with that username."));

        Friendship existing = findBetween(account.id, target.id);
        if (existing != null) {
            if ("ACCEPTED".equals(existing.status)) {
                throw new IllegalArgumentException("You are already friends.");
            }
            if ("PENDING".equals(existing.status) && existing.requesterId.equals(account.id)) {
                throw new IllegalArgumentException("Friend request already sent.");
            }
            if ("PENDING".equals(existing.status) && existing.receiverId.equals(account.id)) {
                existing.status = "ACCEPTED";
                existing.updatedAt = Instant.now();
                friendshipRepository.save(existing);
                return getFriends(account);
            }
        }

        Friendship friendship = new Friendship();
        friendship.requesterId = account.id;
        friendship.receiverId = target.id;
        friendship.status = "PENDING";
        friendship.createdAt = Instant.now();
        friendship.updatedAt = Instant.now();
        friendshipRepository.save(friendship);
        return getFriends(account);
    }

    public FriendsResponse acceptRequest(UserAccount account, Long friendshipId) {
        Friendship friendship = requireFriendship(friendshipId);
        if (!friendship.receiverId.equals(account.id)) {
            throw new IllegalArgumentException("Only the receiver can accept this request.");
        }

        friendship.status = "ACCEPTED";
        friendship.updatedAt = Instant.now();
        friendshipRepository.save(friendship);
        return getFriends(account);
    }

    public FriendsResponse declineRequest(UserAccount account, Long friendshipId) {
        Friendship friendship = requireFriendship(friendshipId);
        if (!friendship.receiverId.equals(account.id) && !friendship.requesterId.equals(account.id)) {
            throw new IllegalArgumentException("You cannot update this request.");
        }

        friendshipRepository.delete(friendship);
        return getFriends(account);
    }

    private Friendship findBetween(Long userA, Long userB) {
        for (Friendship friendship : friendshipRepository.findByRequesterIdOrReceiverId(userA, userA)) {
            boolean samePair = (friendship.requesterId.equals(userA) && friendship.receiverId.equals(userB))
                    || (friendship.requesterId.equals(userB) && friendship.receiverId.equals(userA));
            if (samePair) return friendship;
        }
        return null;
    }

    private Friendship requireFriendship(Long friendshipId) {
        return friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found."));
    }

    private UserAccount otherUser(UserAccount account, Friendship friendship) {
        Long otherId = friendship.requesterId.equals(account.id) ? friendship.receiverId : friendship.requesterId;
        return userRepository.findById(otherId).orElse(null);
    }

    private FriendSummary createSummary(UserAccount other, Friendship friendship) {
        PlayerState state = saveService.loadOrCreateNew(other);
        FriendSummary summary = new FriendSummary();
        summary.friendshipId = friendship.id;
        summary.username = other.username;
        summary.displayName = state.playerName == null || state.playerName.isBlank() ? other.username : state.playerName;
        summary.primaryClass = state.primaryClass;
        summary.title = state.title;
        summary.level = state.level;
        summary.xp = state.xp;
        summary.bossesDefeated = state.bossesDefeated;
        summary.classMastery = state.classMastery;
        summary.energy = state.energy;
        summary.onlineStatus = "Available";
        summary.lastSeenLabel = "Local profile";
        summary.status = friendship.status;
        return summary;
    }

    private String normalizeUsername(String username) {
        String value = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
        if (!value.matches("[a-z0-9_]{3,32}")) {
            throw new IllegalArgumentException("Use a valid username.");
        }
        return value;
    }

    public static class FriendsResponse {
        public List<FriendSummary> friends = new ArrayList<>();
        public List<FriendSummary> incomingRequests = new ArrayList<>();
        public List<FriendSummary> outgoingRequests = new ArrayList<>();
    }

    public static class FriendSummary {
        public Long friendshipId;
        public String username;
        public String displayName;
        public String primaryClass;
        public String title;
        public int level;
        public int xp;
        public int bossesDefeated;
        public int classMastery;
        public int energy;
        public String onlineStatus;
        public String lastSeenLabel;
        public String status;
    }
}
