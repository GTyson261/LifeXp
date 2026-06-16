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

import static org.assertj.core.api.Assertions.assertThat;
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
        String token = register("explorer_" + suffix);

        JsonNode explorer = postJson("/api/game/intro/class", token, "{\"className\":\"EXPLORER\"}");
        assertThat(explorer.path("primaryClass").asText()).isEqualTo("EXPLORER");
        assertThat(explorer.path("activeClass").asText()).isEqualTo("EXPLORER");

        JsonNode updated = postJson(
                "/api/game/activity",
                token,
                "{\"type\":\"coding\",\"amount\":10,\"summary\":\"Logged a quick build action\",\"verified\":true}"
        );

        assertThat(updated.path("primaryClass").asText()).isEqualTo("EXPLORER");
        assertThat(updated.path("activeClass").asText()).isEqualTo("EXPLORER");
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
