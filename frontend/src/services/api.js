const apiOrigin =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:8080`;
const API_BASE = `${apiOrigin}/api/game`;
const AUTH_BASE = `${apiOrigin}/api/auth`;
const TOKEN_KEY = "lifexp_auth_token";
const USER_KEY = "lifexp_auth_user";

export function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const username = localStorage.getItem(USER_KEY);
  return token && username ? { token, username } : null;
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function storeSession(session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, session.username);
  return session;
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredSession();
      throw new Error("Please log in to view your LifeXP data.");
    }

    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

async function authRequest(path, payload) {
  let response;

  try {
    response = await fetch(`${AUTH_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error("Backend is unreachable. Start Spring Boot and make sure MySQL is running.");
  }

  if (!response.ok) {
    let message = `Auth error: ${response.status}`;

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep the status-based message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return storeSession(await response.json());
}

export function registerUser(payload) {
  return authRequest("/register", payload);
}

export function loginUser(payload) {
  return authRequest("/login", payload);
}

export function getGameState() {
  return request("/state");
}

export function completeActivity(payload) {
  return request("/activity", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function changePrimaryClassAtSanctuary(className) {
  return request("/sanctuary/change-primary-class", {
    method: "POST",
    body: JSON.stringify({ className })
  });
}

export function chooseIntroClass(className) {
  return request("/intro/class", {
    method: "POST",
    body: JSON.stringify({ className })
  });
}

export function updateAvatar(avatar) {
  return request("/avatar", {
    method: "POST",
    body: JSON.stringify(avatar)
  });
}

export function unlockSkill(skillId) {
  return request("/skill", {
    method: "POST",
    body: JSON.stringify({ skillId })
  });
}

export function claimQuest(questId) {
  return request("/quest/claim", {
    method: "POST",
    body: JSON.stringify({ questId })
  });
}

export function buyShopItem(itemId) {
  return request("/shop/buy", {
    method: "POST",
    body: JSON.stringify({ itemId })
  });
}

export function equipInventoryItem(itemId) {
  return request("/inventory/equip", {
    method: "POST",
    body: JSON.stringify({ itemId })
  });
}

export function resetGame() {
  return request("/reset", {
    method: "POST"
  });
}
export function travelToWorld(worldId) {
  return request("/world/travel", {
    method: "POST",
    body: JSON.stringify({ worldId })
  });
}

export function restEnergy() {
  return request("/rest", {
    method: "POST"
  });
}

export function claimDailyLoginReward() {
  return request("/daily-login/claim", {
    method: "POST"
  });
}
