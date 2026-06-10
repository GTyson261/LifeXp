package com.lifexp.demo.controller;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByRequesterIdOrReceiverId(Long requesterId, Long receiverId);
}
