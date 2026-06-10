#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://127.0.0.1:8080}"
PLAYER_COUNT="${PLAYER_COUNT:-12}"
PASSWORD="${PASSWORD:-password123}"
RUN_ID="${RUN_ID:-load$(date +%s)}"

if (( PLAYER_COUNT < 2 )); then
  echo "PLAYER_COUNT must be at least 2."
  exit 1
fi

tokens=()
rooms=()

token_from_response() {
  sed -n 's/.*"token":"\([^"]*\)".*/\1/p'
}

json_value() {
  local key="$1"
  sed -n "s/.*\"$key\":\"\\([^\"]*\\)\".*/\\1/p"
}

echo "Creating $PLAYER_COUNT load-test players against $API_URL"
for index in $(seq 1 "$PLAYER_COUNT"); do
  username="load_${RUN_ID}_${index}"
  curl -s -X POST "$API_URL/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$username\",\"password\":\"$PASSWORD\"}" >/dev/null || true
  token="$(curl -s -X POST "$API_URL/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$username\",\"password\":\"$PASSWORD\"}" | token_from_response)"
  if [[ -z "$token" ]]; then
    echo "Could not log in $username"
    exit 1
  fi
  tokens+=("$token")
done

echo "Joining matchmaking queue"
for token in "${tokens[@]}"; do
  response="$(curl -s -X POST "$API_URL/api/friendly-battle/matchmaking/join" \
    -H "Authorization: Bearer $token")"
  code="$(printf '%s' "$response" | json_value code)"
  if [[ -n "$code" ]]; then
    rooms+=("$code")
  fi
done

unique_rooms=($(printf "%s\n" "${rooms[@]}" | sort -u))
echo "Matched rooms: ${#unique_rooms[@]}"

for room in "${unique_rooms[@]}"; do
  for token in "${tokens[@]}"; do
    curl -s -X POST "$API_URL/api/friendly-battle/rooms/$room/move" \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer $token" \
      -d '{"move":"POWER","round":0}' >/dev/null || true
  done
done

echo "Battle stats:"
curl -s "$API_URL/api/friendly-battle/stats"
echo
