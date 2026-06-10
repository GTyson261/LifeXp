package com.lifexp.demo.controller;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(
        name = "battle_room_snapshots",
        indexes = {
                @Index(name = "idx_battle_room_host", columnList = "host_username"),
                @Index(name = "idx_battle_room_guest", columnList = "guest_username"),
                @Index(name = "idx_battle_room_status", columnList = "status"),
                @Index(name = "idx_battle_room_updated", columnList = "updated_at")
        }
)
public class BattleRoomSnapshot {
    @Id
    @Column(name = "room_code", nullable = false, length = 6)
    public String roomCode;

    @Column(name = "host_username", nullable = false, length = 32)
    public String hostUsername;

    @Column(name = "guest_username", length = 32)
    public String guestUsername = "";

    @Column(nullable = false, length = 16)
    public String status;

    @Lob
    @Column(nullable = false)
    public String payload;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt = Instant.now();
}
