package com.lifexp.demo.controller;

import org.springframework.stereotype.Service;

@Service
public class DailyResetService {

    private static final long RESET_INTERVAL = 1000L * 60 * 60 * 24;

    public void applyDailyResetIfNeeded(PlayerState state) {
        if (state == null) {
            return;
        }

        long now = System.currentTimeMillis();

        if ((now - state.lastDailyReset) < RESET_INTERVAL) {
            return;
        }

        state.lastDailyReset = now;
        state.energy = 100;
        state.loginStreak += 1;

        for (PlayerState.Quest quest : state.dailyQuests) {
            quest.completed = false;
            quest.claimed = false;
        }

        state.activityLog.add(0, "Daily reset complete. Energy restored and quests refreshed.");

        while (state.activityLog.size() > 12) {
            state.activityLog.remove(state.activityLog.size() - 1);
        }
    }

    public int sanitizeActivityAmount(int amount) {
        if (amount < 0) {
            return 0;
        }

        return Math.min(amount, 60);
    }

    public boolean isSuspiciousGain(int xpGain) {
        return xpGain > 2500;
    }
}
