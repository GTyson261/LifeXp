const configuredApiOrigin = String(import.meta.env.VITE_API_ORIGIN || "")
  .trim()
  .replace(/\/+$/, "");
const apiOrigin = configuredApiOrigin || (import.meta.env.DEV
  ? `${window.location.protocol}//${window.location.hostname}:8080`
  : window.location.origin);
const API_BASE = `${apiOrigin}/api/game`;
const AUTH_BASE = `${apiOrigin}/api/auth`;
const BATTLE_BASE = `${apiOrigin}/api/friendly-battle`;
const FRIENDS_BASE = `${apiOrigin}/api/friends`;
const REQUEST_TIMEOUT_MS = 15000;
const TOKEN_KEY = "lifexp_auth_token";
const USER_KEY = "lifexp_auth_user";
const memoryStorage = new Map();

function storageGet(key) {
  try {
    return localStorage.getItem(key) ?? memoryStorage.get(key) ?? null;
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

function storageSet(key, value) {
  memoryStorage.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // The in-memory fallback keeps this tab usable when persistent storage is blocked.
  }
}

function storageRemove(key) {
  memoryStorage.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    // The persistent store is unavailable, but the in-memory session is cleared.
  }
}

export function getStoredSession() {
  const token = storageGet(TOKEN_KEY);
  const username = storageGet(USER_KEY);
  return token && username ? { token, username } : null;
}

export function clearStoredSession() {
  storageRemove(TOKEN_KEY);
  storageRemove(USER_KEY);
}

function expireStoredSession() {
  clearStoredSession();
  window.dispatchEvent(new Event("lifexp:session-expired"));
}

function storeSession(session) {
  storageSet(TOKEN_KEY, session.token);
  storageSet(USER_KEY, session.username);
  return session;
}

async function parseJsonOrNull(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function getErrorMessage(response, fallback) {
  const data = await parseJsonOrNull(response);
  return data?.message || data?.error || fallback;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function connectionError(error) {
  return new Error(
    error?.name === "AbortError"
      ? "LifeXP took too long to respond. Check your connection and try again."
      : import.meta.env.DEV
        ? "Backend is unreachable. Start Spring Boot and make sure MySQL is running."
        : "LifeXP services are temporarily unreachable. Check your connection and try again."
  );
}

async function requestNow(path, options = {}) {
  const token = storageGet(TOKEN_KEY);
  let response;

  try {
    response = await fetchWithTimeout(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw connectionError(error);
  }

  if (!response.ok) {
    if (response.status === 401) {
      expireStoredSession();
      throw new Error("Please log in to view your LifeXP data.");
    }

    throw new Error(await getErrorMessage(response, `LifeXP could not complete that action (${response.status}).`));
  }

  return parseJsonOrNull(response);
}

let gameRequestQueue = Promise.resolve();

function request(path, options = {}) {
  const queuedRequest = gameRequestQueue.then(
    () => requestNow(path, options),
    () => requestNow(path, options)
  );

  gameRequestQueue = queuedRequest.catch(() => undefined);
  return queuedRequest;
}

async function battleRequestNow(path, options = {}) {
  const token = storageGet(TOKEN_KEY);
  let response;

  try {
    response = await fetchWithTimeout(`${BATTLE_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw connectionError(error);
  }

  if (!response.ok) {
    if (response.status === 401) {
      expireStoredSession();
      throw new Error("Please log in to view your LifeXP data.");
    }

    throw new Error(await getErrorMessage(response, `Battle action failed (${response.status}).`));
  }

  return parseJsonOrNull(response);
}

let battleRequestQueue = Promise.resolve();

function battleRequest(path, options = {}) {
  const queuedRequest = battleRequestQueue.then(
    () => battleRequestNow(path, options),
    () => battleRequestNow(path, options)
  );

  battleRequestQueue = queuedRequest.catch(() => undefined);
  return queuedRequest;
}

async function friendsRequestNow(path = "", options = {}) {
  const token = storageGet(TOKEN_KEY);
  let response;

  try {
    response = await fetchWithTimeout(`${FRIENDS_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw connectionError(error);
  }

  if (!response.ok) {
    if (response.status === 401) {
      expireStoredSession();
      throw new Error("Please log in to view your LifeXP friends.");
    }

    throw new Error(await getErrorMessage(response, `Friends action failed (${response.status}).`));
  }

  return parseJsonOrNull(response);
}

let friendsRequestQueue = Promise.resolve();

function friendsRequest(path = "", options = {}) {
  const queuedRequest = friendsRequestQueue.then(
    () => friendsRequestNow(path, options),
    () => friendsRequestNow(path, options)
  );

  friendsRequestQueue = queuedRequest.catch(() => undefined);
  return queuedRequest;
}

async function authRequest(path, payload) {
  let response;

  try {
    response = await fetchWithTimeout(`${AUTH_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw connectionError(error);
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, `Account request failed (${response.status}).`));
  }

  return storeSession(await response.json());
}

export function registerUser(payload) {
  return authRequest("/register", payload);
}

export function loginUser(payload) {
  return authRequest("/login", payload);
}

export async function logoutUser() {
  const token = storageGet(TOKEN_KEY);

  try {
    if (token) {
      await fetchWithTimeout(`${AUTH_BASE}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch {
    // Local logout must still succeed when the backend is unavailable.
  } finally {
    clearStoredSession();
  }
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

export function createFriendlyBattleRoom(invitedUsername = "") {
  return battleRequest("/rooms", {
    method: "POST",
    body: JSON.stringify({ invitedUsername })
  });
}

export function joinFriendlyBattleRoom(code) {
  return battleRequest("/rooms/join", {
    method: "POST",
    body: JSON.stringify({ code })
  });
}

export function getFriendlyBattleRoom(code) {
  return battleRequest(`/rooms/${code}`);
}

export function chooseFriendlyBattleMove(code, move, round = 0) {
  return battleRequest(`/rooms/${code}/move`, {
    method: "POST",
    body: JSON.stringify({ move, round })
  });
}

export function leaveFriendlyBattleRoom(code) {
  return battleRequest(`/rooms/${code}/leave`, {
    method: "POST"
  });
}

export function getFriendlyBattleInvites() {
  return battleRequest("/invites");
}

export function getActiveFriendlyBattleRoom() {
  return battleRequest("/active");
}

export function joinFriendlyBattleMatchmaking() {
  return battleRequest("/matchmaking/join", {
    method: "POST"
  });
}

export function leaveFriendlyBattleMatchmaking() {
  return battleRequest("/matchmaking/leave", {
    method: "POST"
  });
}

export function getFriendlyBattleHistory() {
  return battleRequest("/history");
}

export function getFriendlyBattleStats() {
  return battleRequest("/stats");
}

export function getFriends() {
  return friendsRequest();
}

export function sendFriendRequest(username) {
  return friendsRequest("/request", {
    method: "POST",
    body: JSON.stringify({ username })
  });
}

export function acceptFriendRequest(friendshipId) {
  return friendsRequest(`/${friendshipId}/accept`, {
    method: "POST"
  });
}

export function declineFriendRequest(friendshipId) {
  return friendsRequest(`/${friendshipId}/decline`, {
    method: "POST"
  });
}
