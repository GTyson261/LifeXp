package com.lifexp.demo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FriendlyBattleIntegrationTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    BattleRoomSnapshotRepository snapshotRepository;

    @Autowired
    UserAccountRepository userRepository;

    @Autowired
    FriendlyBattleService friendlyBattleService;

    @Test
    void friendsMatchmakingReconnectAntiCheatAndHistoryWork() throws Exception {
        String suffix = Long.toString(System.nanoTime(), 36);
        String host = "host_" + suffix;
        String guest = "guest_" + suffix;
        String hostToken = register(host);
        String guestToken = register(guest);

        JsonNode friends = postJson("/api/friends/request", hostToken, "{\"username\":\"" + guest + "\"}");
        Long friendshipId = friends.path("outgoingRequests").get(0).path("friendshipId").asLong();
        JsonNode accepted = postJson("/api/friends/" + friendshipId + "/accept", guestToken, "{}");
        assertThat(accepted.path("friends").size()).isEqualTo(1);

        JsonNode queued = postJson("/api/friendly-battle/matchmaking/join", hostToken, "{}");
        assertThat(queued.path("status").asText()).isEqualTo("QUEUED");

        JsonNode matched = postJson("/api/friendly-battle/matchmaking/join", guestToken, "{}");
        assertThat(matched.path("status").asText()).isEqualTo("MATCHED");
        String code = matched.path("room").path("code").asText();

        JsonNode active = getJson("/api/friendly-battle/active", hostToken);
        assertThat(active.path("code").asText()).isEqualTo(code);
        assertThat(snapshotRepository.findById(code)).isPresent();

        JsonNode lockedMoveRoom = postJson("/api/friendly-battle/rooms/" + code + "/move", hostToken, "{\"move\":\"POWER\",\"round\":0}");
        assertThat(lockedMoveRoom.path("log").toString()).contains("locked in a move");
        assertThat(lockedMoveRoom.path("log").toString()).doesNotContain("Power Strike");
        postJsonExpectingBadRequest("/api/friendly-battle/rooms/" + code + "/move", hostToken, "{\"move\":\"GUARD\",\"round\":0}", "Move already locked");
        JsonNode roundOne = postJson("/api/friendly-battle/rooms/" + code + "/move", guestToken, "{\"move\":\"FOCUS\",\"round\":0}");
        postJsonExpectingBadRequest("/api/friendly-battle/rooms/" + code + "/move", hostToken, "{\"move\":\"BURST\",\"round\":0}", "Battle round changed");

        JsonNode room = roundOne;
        for (int attempt = 0; attempt < 8 && !"COMPLETE".equals(room.path("status").asText()); attempt++) {
            int round = room.path("round").asInt();
            postJson("/api/friendly-battle/rooms/" + code + "/move", hostToken, "{\"move\":\"POWER\",\"round\":" + round + "}");
            room = postJson("/api/friendly-battle/rooms/" + code + "/move", guestToken, "{\"move\":\"GUARD\",\"round\":" + round + "}");
        }

        assertThat(room.path("status").asText()).isEqualTo("COMPLETE");
        JsonNode history = getJson("/api/friendly-battle/history", hostToken);
        assertThat(history.size()).isGreaterThanOrEqualTo(1);
        assertThat(history.get(0).path("roomCode").asText()).isEqualTo(code);
    }

    @Test
    void playerCanLeaveActiveRoomAndOpponentSeesForfeit() throws Exception {
        String suffix = Long.toString(System.nanoTime(), 36);
        String host = "leave_host_" + suffix;
        String guest = "leave_guest_" + suffix;
        String hostToken = register(host);
        String guestToken = register(guest);

        JsonNode created = postJson("/api/friendly-battle/rooms", hostToken, "{}");
        String code = created.path("code").asText();
        String outsiderToken = register("leave_outsider_" + suffix);
        String outsiderResponse = mockMvc.perform(get("/api/friendly-battle/rooms/" + code)
                        .header("Authorization", "Bearer " + outsiderToken))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(outsiderResponse).contains("not in this battle room");

        JsonNode joined = postJson("/api/friendly-battle/rooms/join", guestToken, "{\"code\":\"" + code + "\"}");

        assertThat(joined.path("status").asText()).isEqualTo("READY");

        postOk("/api/friendly-battle/rooms/" + code + "/leave", guestToken, "{}");
        JsonNode roomAfterLeave = getJson("/api/friendly-battle/rooms/" + code, hostToken);

        assertThat(roomAfterLeave.path("status").asText()).isEqualTo("COMPLETE");
        assertThat(roomAfterLeave.path("lastResult").asText()).contains("left the battle");
        assertThat(roomAfterLeave.path("hostWins").asInt()).isEqualTo(3);
    }

    @Test
    void loggingActionDoesNotOverrideChosenClassTheme() throws Exception {
        String suffix = Long.toString(System.nanoTime(), 36);
        String username = "explorer_" + suffix;
        String token = register(username);

        JsonNode explorer = postJson("/api/game/intro/class", token, "{\"className\":\"EXPLORER\"}");
        assertThat(explorer.path("primaryClass").asText()).isEqualTo("EXPLORER");
        assertThat(explorer.path("activeClass").asText()).isEqualTo("EXPLORER");
        assertThat(explorer.path("dailyQuests").toString()).contains("class_explorer_1");
        assertThat(explorer.path("dailyQuests").toString()).doesNotContain("class_coder_1");

        JsonNode updated = postJson(
                "/api/game/activity",
                token,
                "{\"type\":\"coding\",\"amount\":10,\"summary\":\"Logged a quick build action\",\"verified\":true}"
        );

        assertThat(updated.path("primaryClass").asText()).isEqualTo("EXPLORER");
        assertThat(updated.path("activeClass").asText()).isEqualTo("EXPLORER");

        UserAccount account = userRepository.findByUsername(username).orElseThrow();
        PlayerState savedState = objectMapper.readValue(account.gameState, PlayerState.class);
        savedState.gold = 24;
        account.gameState = objectMapper.writeValueAsString(savedState);
        userRepository.save(account);

        postJsonExpectingBadRequest(
                "/api/game/sanctuary/change-primary-class",
                token,
                "{\"className\":\"CODER\"}",
                "need 25 Gold"
        );
    }

    @Test
    void activityValidationAndBossDamageQuestProgressAreEnforcedServerSide() throws Exception {
        String suffix = Long.toString(System.nanoTime(), 36);
        String token = register("integrity_" + suffix);

        postJsonExpectingBadRequest(
                "/api/game/activity",
                token,
                "{\"type\":\"coding\",\"amount\":0,\"summary\":\"no work\",\"verified\":true}",
                "between 1 and 60"
        );
        postJsonExpectingBadRequest(
                "/api/game/activity",
                token,
                "{\"type\":\"free_xp\",\"amount\":60,\"summary\":\"invalid\",\"verified\":true}",
                "valid LifeXP activity"
        );
        postJsonExpectingBadRequest(
                "/api/game/intro/class",
                token,
                "{\"className\":\"CHEATER\"}",
                "valid LifeXP class"
        );

        postJson("/api/game/intro/class", token, "{\"className\":\"CODER\"}");
        JsonNode updated = postJson(
                "/api/game/activity",
                token,
                "{\"type\":\"coding\",\"amount\":1,\"summary\":\"real work\",\"verified\":false}"
        );

        JsonNode bossQuest = null;
        for (JsonNode quest : updated.path("dailyQuests")) {
            if ("class_coder_3".equals(quest.path("id").asText())) {
                bossQuest = quest;
                break;
            }
        }
        assertThat(bossQuest).isNotNull();
        assertThat(bossQuest.path("completed").asBoolean()).isTrue();
        assertThat(bossQuest.path("progress").asInt()).isEqualTo(1);

        mockMvc.perform(get("/api/game/save-location"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void dailyQuestProgressAndMissedLoginStreakResetCorrectly() throws Exception {
        PlayerState resetState = new PlayerState();
        PlayerState.Quest quest = resetState.dailyQuests.get(0);
        quest.progress = quest.target;
        quest.completed = true;
        quest.claimed = true;
        resetState.lastDailyReset = 0;

        new DailyResetService().applyDailyResetIfNeeded(resetState);

        assertThat(quest.progress).isZero();
        assertThat(quest.completed).isFalse();
        assertThat(quest.claimed).isFalse();
        assertThat(resetState.loginStreak).isEqualTo(1);

        String suffix = Long.toString(System.nanoTime(), 36);
        String username = "streak_" + suffix;
        String token = register(username);
        UserAccount account = userRepository.findByUsername(username).orElseThrow();
        PlayerState savedState = objectMapper.readValue(account.gameState, PlayerState.class);
        savedState.loginRewardStreak = 6;
        savedState.lastLoginRewardDate = LocalDate.now().minusDays(3).toString();
        account.gameState = objectMapper.writeValueAsString(savedState);
        userRepository.save(account);

        JsonNode claimed = postJson("/api/game/daily-login/claim", token, "{}");
        assertThat(claimed.path("loginRewardStreak").asInt()).isEqualTo(1);
    }

    @Test
    void logoutInvalidatesTheServerSession() throws Exception {
        String token = register("logout_" + Long.toString(System.nanoTime(), 36));

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/game/state")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/friends")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/friendly-battle/active")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void failedGameMutationsReturnActionableClientErrors() throws Exception {
        String token = register("mutation_errors_" + Long.toString(System.nanoTime(), 36));

        postJsonExpectingBadRequest("/api/game/rest", token, "{}", "already full");
        postJsonExpectingBadRequest("/api/game/world/travel", token, "{\"worldId\":\"missing\"}", "World not found");
        postJsonExpectingBadRequest("/api/game/skill", token, "{\"skillId\":\"missing\"}", "Skill not found");
        postJsonExpectingBadRequest("/api/game/quest/claim", token, "{\"questId\":\"missing\"}", "Quest not found");
        postJsonExpectingBadRequest("/api/game/shop/buy", token, "{\"itemId\":\"missing\"}", "Shop item not found");
        postJsonExpectingBadRequest("/api/game/inventory/equip", token, "{\"itemId\":\"missing\"}", "Inventory item not found");
    }

    @Test
    void nullJsonBodiesReturnActionableClientErrors() throws Exception {
        String token = register("null_body_" + Long.toString(System.nanoTime(), 36));

        postJsonExpectingBadRequest("/api/game/sanctuary/change-primary-class", token, "null", "Class selection is required");
        postJsonExpectingBadRequest("/api/game/intro/class", token, "null", "Class selection is required");
        postJsonExpectingBadRequest("/api/game/skill", token, "null", "Skill selection is required");
        postJsonExpectingBadRequest("/api/game/quest/claim", token, "null", "Quest selection is required");
        postJsonExpectingBadRequest("/api/game/shop/buy", token, "null", "Shop item selection is required");
        postJsonExpectingBadRequest("/api/game/inventory/equip", token, "null", "Inventory item selection is required");
        postJsonExpectingBadRequest("/api/game/world/travel", token, "null", "World selection is required");
        postJsonExpectingBadRequest("/api/game/activity", token, "null", "Activity details are required");
        postJsonExpectingBadRequest("/api/game/avatar", token, "null", "Avatar details are required");
        postJsonExpectingBadRequest("/api/friends/request", token, "null", "Friend username is required");
        postJsonExpectingBadRequest("/api/friendly-battle/rooms/join", token, "null", "Battle room code is required");
        postJsonExpectingBadRequest("/api/friendly-battle/rooms/123456/move", token, "null", "Battle move is required");
        postJsonExpectingBadRequest("/api/player/coding", null, "null", "Activity details are required");
        postJsonExpectingBadRequest("/api/skills/unlock", null, "null", "Skill selection is required");
        postJsonExpectingBadRequest("/api/auth/register", null, "null", "Username and password are required");
        postJsonExpectingBadRequest("/api/auth/login", null, "null", "Username and password are required");
    }

    @Test
    void duplicateRegistrationReturnsAStableClientError() throws Exception {
        String username = "duplicate_" + Long.toString(System.nanoTime(), 36);
        register(username);

        postJsonExpectingBadRequest(
                "/api/auth/register",
                null,
                "{\"username\":\"" + username + "\",\"password\":\"password123\"}",
                "already taken"
        );
    }

    @Test
    void scheduledBattleCleanupRunsInsideATransaction() {
        assertThatCode(() -> friendlyBattleService.cleanupStaleBattleState())
                .doesNotThrowAnyException();
    }

    @Test
    void explorerDiscoveryRewardsAreGrantedOnlyOncePerWorld() throws Exception {
        String token = register("world_" + Long.toString(System.nanoTime(), 36));
        postJson("/api/game/intro/class", token, "{\"className\":\"EXPLORER\"}");

        JsonNode firstVisit = postJson("/api/game/world/travel", token, "{\"worldId\":\"world_cyber\"}");
        int rewardedXp = firstVisit.path("xp").asInt();
        int rewardedGold = firstVisit.path("gold").asInt();

        postJson("/api/game/world/travel", token, "{\"worldId\":\"world_gate\"}");
        JsonNode revisit = postJson("/api/game/world/travel", token, "{\"worldId\":\"world_cyber\"}");

        assertThat(revisit.path("xp").asInt()).isEqualTo(rewardedXp);
        assertThat(revisit.path("gold").asInt()).isEqualTo(rewardedGold);
        assertThat(revisit.path("visitedWorldIds").size()).isEqualTo(2);
    }

    @Test
    void avatarAndPasswordInputsAreBoundedAndLockedCosmeticsStayLocked() throws Exception {
        String token = register("avatar_" + Long.toString(System.nanoTime(), 36));
        postJson("/api/game/intro/class", token, "{\"className\":\"CODER\"}");
        postJson(
                "/api/game/activity",
                token,
                "{\"type\":\"intro\",\"amount\":0,\"summary\":\"opened gate\",\"verified\":true}"
        );

        JsonNode updated = postJson(
                "/api/game/avatar",
                token,
                "{\"displayName\":\"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\",\"pronouns\":\"they/them\",\"gender\":\"Robot\",\"bodyType\":\"Huge\",\"skinTone\":\"red\",\"hairStyle\":\"Laser\",\"hairColor\":\"blue\",\"outfit\":\"Cheater Outfit\",\"aura\":\"Cheater Aura\"}"
        );

        assertThat(updated.path("playerName").asText()).hasSize(32);
        assertThat(updated.path("avatar").path("gender").asText()).isEqualTo("Custom");
        assertThat(updated.path("avatar").path("bodyType").asText()).isEqualTo("Average");
        assertThat(updated.path("avatar").path("outfit").asText()).isEqualTo("Neon Tech Jacket");
        assertThat(updated.path("avatar").path("aura").asText()).isEqualTo("Blue Terminal Aura");

        String oversizedPassword = "a".repeat(73);
        postJsonExpectingBadRequest(
                "/api/auth/register",
                null,
                "{\"username\":\"long_password_user\",\"password\":\"" + oversizedPassword + "\"}",
                "72 bytes or fewer"
        );
    }

    private String register(String username) throws Exception {
        String body = "{\"username\":\"" + username + "\",\"password\":\"password123\"}";
        JsonNode response = postJson("/api/auth/register", null, body);
        return response.path("token").asText();
    }

    private JsonNode postJson(String path, String token, String body) throws Exception {
        String response = mockMvc.perform(post(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", token == null ? "" : "Bearer " + token)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response);
    }

    private void postOk(String path, String token, String body) throws Exception {
        mockMvc.perform(post(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", token == null ? "" : "Bearer " + token)
                        .content(body))
                .andExpect(status().isOk());
    }

    private void postJsonExpectingBadRequest(String path, String token, String body, String messagePart) throws Exception {
        String response = mockMvc.perform(post(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(response).contains(messagePart);
    }

    private JsonNode getJson(String path, String token) throws Exception {
        String response = mockMvc.perform(get(path)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response);
    }
}
