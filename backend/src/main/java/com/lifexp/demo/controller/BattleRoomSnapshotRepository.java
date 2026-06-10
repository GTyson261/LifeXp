package com.lifexp.demo.controller;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface BattleRoomSnapshotRepository extends JpaRepository<BattleRoomSnapshot, String> {
    List<BattleRoomSnapshot> findByStatusNot(String status);

    void deleteByStatusAndUpdatedAtBefore(String status, Instant updatedAt);

    void deleteByStatusNotAndUpdatedAtBefore(String status, Instant updatedAt);
}
