# 🎮 LifeXP — Production Demo Pack

LifeXP is a runnable full-stack demo for **Gaming In Real Life**: a real-life RPG system with XP, classes, quests, skill trees, mastery, and polished UI.

## Project Structure

```text
lifexp-production-pack/
  backend/   Spring Boot API
  frontend/  React + Vite UI
```

## Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Demo Features

- XP and leveling
- Class switching
- Daily quests
- Quest claiming
- Skill tree unlocking
- Skill point rewards
- Class identity styling
- Animated level-up modal
- Gradient game-style UI

## API Endpoints

```http
GET  /api/game
POST /api/actions
POST /api/quests/{id}/claim
POST /api/skills/{code}/unlock
POST /api/class
```

## Demo Flow

1. Start backend.
2. Start frontend.
3. Click real-life actions to gain XP.
4. Complete quests.
5. Claim quest rewards.
6. Level up.
7. Unlock skills.
8. Change classes and see the identity system update.

> Life is a video game. LifeXP lets you finally play it.
