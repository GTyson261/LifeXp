package com.lifexp.demo.controller;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BattleHistoryRepository extends JpaRepository<BattleHistory, Long> {
    List<BattleHistory> findTop20ByHostUsernameOrGuestUsernameOrderByCompletedAtDesc(String hostUsername, String guestUsername);
}
