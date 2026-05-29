const API_BASE = "http://localhost:8080/api/game";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
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