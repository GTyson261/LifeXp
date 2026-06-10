package com.lifexp.demo.controller;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Column;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(
        name = "battle_history",
        indexes = {
                @Index(name = "idx_battle_history_host", columnList = "host_username"),
                @Index(name = "idx_battle_history_guest", columnList = "guest_username"),
                @Index(name = "idx_battle_history_completed", columnList = "completed_at")
        }
)
public class BattleHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "room_code", length = 6)
    public String roomCode;

    @Column(name = "host_username", length = 32)
    public String hostUsername;

    @Column(name = "guest_username", length = 32)
    public String guestUsername;

    @Column(name = "winner_username", length = 32)
    public String winnerUsername;
    public int rounds;
    public int hostWins;
    public int guestWins;

    @Lob
    public String summary;

    @Column(name = "completed_at", nullable = false)
    public Instant completedAt = Instant.now();
}
