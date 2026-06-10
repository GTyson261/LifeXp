package com.lifexp.demo.controller;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "friendships",
        uniqueConstraints = @UniqueConstraint(name = "uk_friendship_pair", columnNames = {"requester_id", "receiver_id"}),
        indexes = {
                @Index(name = "idx_friendship_requester", columnList = "requester_id"),
                @Index(name = "idx_friendship_receiver", columnList = "receiver_id"),
                @Index(name = "idx_friendship_status", columnList = "status")
        }
)
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "requester_id", nullable = false)
    public Long requesterId;

    @Column(name = "receiver_id", nullable = false)
    public Long receiverId;

    @Column(nullable = false, length = 16)
    public String status = "PENDING";

    @Column(name = "created_at", nullable = false)
    public Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt = Instant.now();
}
