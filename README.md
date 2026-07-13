🎮 LifeXP — Real-Life RPG Productivity Tracker

---

🚀 Elevator Pitch

LifeXP is a full-stack web and mobile application that turns real-life productivity into a role-playing game. It helps users track focus sessions like coding and reading, earn experience points (XP), and progress in personalized classes such as Bookworm or Coder. The app is designed for students and early-career developers who want a more engaging way to stay consistent with their goals.

---

❗ Problem Statement

Many people struggle to stay consistent with productive habits like studying, reading, or coding because traditional productivity tools feel repetitive and uninspiring. Existing apps track tasks, but they don’t motivate users to return daily or feel rewarded for their effort.

LifeXP solves this by transforming real-world actions into game-like progression, giving users immediate feedback, rewards, and a sense of growth tied to their actual habits.

---

🎯 Target User

A college student or junior developer who is trying to build consistent habits (like studying, coding, or reading) but struggles with motivation and accountability.

Example:

«A computer science student who wants to code every day but often loses focus or skips sessions due to lack of structure and engagement.»

---

❤️ Why This Project

I chose to build LifeXP because I personally understand how difficult it is to stay consistent with productive habits like coding and learning new technologies. Traditional productivity apps never kept me engaged long-term.

By combining gaming elements with real-life progress, I want to create something that not only tracks habits but makes users actually want to improve every day.

---

🛠️ Current Features

- Manual and verified-timer tracking across nine activity types
- XP, leveling, class mastery, skill trees, streaks, and energy management
- Eight playable classes with perks, evolutions, and themed worlds
- Daily and class-story quests, achievements, bosses, and loot
- Avatar customization, unlockable cosmetics, inventory, and shop systems
- Friends, invites, matchmaking, friendly battles, history, and reconnect support
- MySQL-backed accounts and per-player saves
- Responsive desktop/mobile UI and installable PWA support

---

⚙️ Tech Stack

Frontend: React + Vite responsive PWA
Backend: Spring Boot (Java)
Database: MySQL
API: RESTful endpoints for sessions, users, and progress tracking

---

✅ Project Scope Notes

The core loop remains focused: real-world actions become game progression. The current demo expands that loop with persistent accounts, character customization, world bosses, quests, rewards, and opt-in social battles while keeping progression tied to logged activity.

---

## Local Demo Setup

LifeXP now runs as a local full-stack demo with a React frontend, Spring Boot backend, and MySQL persistence.

### Requirements

- Java 17+
- Node.js 20+
- MySQL running locally
- MySQL database/user reachable by the backend

### Start MySQL

Use MySQL Workbench or your local MySQL service. The backend defaults to:

- Host: `localhost`
- Port: `3306`
- Database: `lifexp`
- User: `root`
- Password: set with `MYSQL_PASSWORD`

### Start Backend

```bash
cd backend
MYSQL_PASSWORD='your_mysql_password' mvn spring-boot:run
```

The backend runs at:

```text
http://127.0.0.1:8080
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend usually runs at:

```text
http://127.0.0.1:5174
```

If Vite chooses another port, use the URL shown in the terminal.

### Mobile LAN Demo

To test on a phone on the same Wi-Fi:

1. Keep backend and frontend running on your computer.
2. Find your computer's local IP address.
3. Open the Vite URL on your phone using that IP, for example:

```text
http://192.168.1.20:5174
```

The frontend will call the backend on the same host at port `8080`.

### Production API Origin

Production builds default to same-origin `/api` requests, which works cleanly behind a reverse proxy. If the frontend and backend are deployed on different origins, provide the backend origin when building:

```bash
VITE_API_ORIGIN='https://api.example.com' npm run build
```

The value may include a trailing slash; LifeXP normalizes it automatically.

### Demo Flow

1. Register or log in.
2. Pick a class and customize the avatar.
3. Complete quests and fight bosses.
4. Add another account as a friend.
5. Accept the friend request from the second account.
6. Invite that friend to a friendly battle or use matchmaking.
7. Complete a battle and view battle history.

### Verification Commands

```bash
cd backend
mvn test
```

```bash
cd frontend
npm run build
```

### Local Battle Load Test

With the backend running:

```bash
PLAYER_COUNT=12 scripts/friendly-battle-load-test.sh
```

This creates temporary users, joins matchmaking, creates matched rooms, submits sample moves, and prints battle stats.

### Stability Notes

- Friendships and battle history persist in MySQL.
- Active friendly battle rooms are snapshotted to MySQL and restored on backend startup.
- Matchmaking queue is intentionally short-lived and expires stale entries.
- Waiting rooms, stale rooms, and old completed room snapshots are cleaned on a timer.
- Friendly battle moves are server-validated for duplicate moves, stale rounds, full rooms, and completed rooms.
- Game actions are server-validated for known activity types, balanced amounts, valid classes, and owned post-onboarding cosmetics.
- Login sessions expire after 30 days and are invalidated server-side on logout.
- Daily quest progress and missed-day streaks reset correctly.
- Explorer discovery rewards are granted once per world to prevent travel farming.
- The PWA caches versioned frontend assets after a successful load for a reliable offline shell.
