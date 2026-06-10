package com.lifexp.demo.controller;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "battle_history")
public class BattleHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String roomCode;
    public String hostUsername;
    public String guestUsername;
    public String winnerUsername;
    public int rounds;
    public int hostWins;
    public int guestWins;

    @Lob
    public String summary;

    public Instant completedAt = Instant.now();
}
