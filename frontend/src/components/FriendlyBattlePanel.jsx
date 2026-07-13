const BATTLE_MOVES = [
  {
    key: "POWER",
    label: "Power Strike",
    hint: "Beats Guard. Slight raw edge."
  },
  {
    key: "FOCUS",
    label: "Focus Counter",
    hint: "Beats Power. Stable counter."
  },
  {
    key: "GUARD",
    label: "Guard Stance",
    hint: "Beats Burst. Defensive read."
  },
  {
    key: "BURST",
    label: "Limit Burst",
    hint: "Beats Focus. Risky pressure."
  }
];

export default function FriendlyBattlePanel({
  battleRoom,
  battleCode,
  setBattleCode,
  battleError,
  onCreateRoom,
  onJoinRoom,
  onRefreshRoom,
  onLeaveRoom,
  onChooseMove,
  localJoinUrl,
  friends,
  friendUsername,
  setFriendUsername,
  friendError,
  onSendFriendRequest,
  onAcceptFriend,
  onDeclineFriend,
  onRefreshFriends,
  battleInvites = [],
  onRefreshBattleInvites,
  onInviteFriend,
  onAcceptBattleInvite,
  matchmakingStatus,
  onJoinMatchmaking,
  onLeaveMatchmaking,
  onReconnectBattle,
  battleHistory = [],
  onRefreshBattleHistory,
  battleStats,
  selectedFriendUsername,
  selectedFriend,
  onSelectFriend,
  friendLeaderboard = [],
  socialToast,
  socialActionBusy = false,
  classMeta = {}
}) {
  const host = battleRoom?.host;
  const guest = battleRoom?.guest;
  const status = battleRoom?.status || "IDLE";
  const invitedUsername = battleRoom?.inviteStatus === "INVITED" ? battleRoom.invitedUsername : "";
  const roundsPlayed = battleRoom ? (battleRoom.hostWins || 0) + (battleRoom.guestWins || 0) : 0;
  const queueActive = matchmakingStatus === "QUEUED";
  const activeRooms = battleStats?.activeRooms || 0;
  const queuedPlayers = battleStats?.queuedPlayers || 0;
  const savedBattles = battleStats?.persistedBattleHistory || 0;
  const lobbyHeat = Math.min(100, activeRooms * 18 + queuedPlayers * 14 + (battleInvites.length || 0) * 12);
  const firstTo = battleRoom?.firstTo || 3;
  const hostWins = battleRoom?.hostWins || 0;
  const guestWins = battleRoom?.guestWins || 0;
  const friendCount = friends?.friends?.length || 0;
  const pendingRequests = (friends?.incomingRequests?.length || 0) + (friends?.outgoingRequests?.length || 0);
  const partyReadiness = Math.min(100, 24 + friendCount * 12 + (selectedFriend ? 22 : 0) + queuedPlayers * 8 + activeRooms * 6);
  const scoutTarget = selectedFriend || guest || host;
  const scoutPower = scoutTarget ? playerPowerScore(scoutTarget, scoutTarget === host ? hostWins : guestWins) : 0;
  const roomState = battleRoom
    ? `${host ? "Host locked" : "Host open"} / ${guest ? "Guest locked" : "Guest open"}`
    : "No room active";

  return (
    <div className="panel friendly-battle-panel" aria-busy={socialActionBusy}>
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Friends</p>
          <h3>Friendly Battle</h3>
          <p>Local room battles for two logged-in players. No save penalties, just rounds.</p>
        </div>

        {battleRoom?.code && (
          <div className="battle-code-chip">
            <span>Code</span>
            <strong>{battleRoom.code}</strong>
          </div>
        )}
      </div>

      <div className="battle-command-strip">
        <span>
          <small>Status</small>
          <strong>{formatStatus(status)}</strong>
        </span>
        <span>
          <small>Rounds</small>
          <strong>{roundsPlayed}</strong>
        </span>
        <span>
          <small>Queue</small>
          <strong>{matchmakingStatus === "QUEUED" ? "Searching" : "Ready"}</strong>
        </span>
      </div>

      <div className="battle-lobby-status">
        <div>
          <small>Arena Heat</small>
          <strong>{lobbyHeat}%</strong>
          <i aria-label={`Arena heat ${lobbyHeat}%`}>
            <b style={{ width: `${lobbyHeat}%` }} />
          </i>
        </div>
        <div>
          <small>Active Rooms</small>
          <strong>{activeRooms}</strong>
        </div>
        <div>
          <small>Queued</small>
          <strong>{queuedPlayers}</strong>
        </div>
        <div>
          <small>Saved</small>
          <strong>{savedBattles}</strong>
        </div>
      </div>

      <div className="battle-prep-grid" aria-label="Battle preparation summary">
        <div className="battle-prep-card primary">
          <div>
            <small>Party Readiness</small>
            <strong>{partyReadiness}%</strong>
          </div>
          <i aria-hidden="true">
            <b style={{ width: `${partyReadiness}%` }} />
          </i>
          <span>{friendCount} friend{friendCount === 1 ? "" : "s"} available · {pendingRequests} pending</span>
        </div>
        <div className="battle-prep-card">
          <small>Scout Intel</small>
          <strong>{scoutTarget?.displayName || scoutTarget?.username || "No target"}</strong>
          <span>{scoutPower ? `${scoutPower}% threat profile` : "Select a friend to preview"}</span>
        </div>
        <div className="battle-prep-card">
          <small>Room State</small>
          <strong>{roomState}</strong>
          <span>{battleRoom?.code ? `Code ${battleRoom.code}` : "Create or join to start"}</span>
        </div>
      </div>

      {socialToast && (
        <div className="social-toast-card" role="status" aria-live="polite">
          <strong>{socialToast.title}</strong>
          <span>{socialToast.message}</span>
        </div>
      )}

      {battleInvites.length > 0 && (
        <div className="battle-invite-strip">
          <div>
            <strong>Battle Invites</strong>
            <span>{battleInvites.length} waiting</span>
          </div>
          <div className="battle-invite-list">
            {battleInvites.map((invite) => (
              <button key={invite.code} type="button" disabled={socialActionBusy} onClick={() => onAcceptBattleInvite(invite)}>
                Join {invite.host?.displayName || invite.host?.username || "Friend"} · {invite.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="matchmaking-card">
        <div>
          <strong>Matchmaking</strong>
          <span>{matchmakingStatus === "QUEUED" ? "Searching for a friendly opponent." : "Queue for a fast local match or reconnect to an active room."}</span>
          <div className="matchmaking-search-meter" aria-label={queueActive ? "Matchmaking search active" : "Matchmaking ready"}>
            <i className={queueActive ? "searching" : ""} />
          </div>
        </div>
        <div className="matchmaking-actions">
          <button type="button" disabled={socialActionBusy || queueActive} onClick={onJoinMatchmaking}>
            Find Match
          </button>
          <button type="button" disabled={socialActionBusy || matchmakingStatus !== "QUEUED"} onClick={onLeaveMatchmaking}>
            Leave Queue
          </button>
          <button type="button" onClick={onReconnectBattle}>
            Reconnect
          </button>
          <button type="button" onClick={() => onRefreshRoom()}>
            Refresh
          </button>
        </div>
        {battleStats && (
          <div className="battle-stats-strip">
            <span>{battleStats.activeRooms || 0} active</span>
            <span>{battleStats.queuedPlayers || 0} queued</span>
            <span>{battleStats.persistedBattleHistory || 0} saved</span>
          </div>
        )}
      </div>

      <div className="friends-grid">
        <form className="friend-request-card" onSubmit={onSendFriendRequest}>
          <strong>Add Friend</strong>
          <p>{friends?.friends?.length ? "Send a request by username. Once accepted, they appear in your friends list." : "Start by adding one username. Their profile and battle invite button will appear here after they accept."}</p>
          <label>
            <span>Username</span>
            <input
              type="text"
              value={friendUsername}
              placeholder="friend_username"
              maxLength="32"
              onChange={(event) => setFriendUsername(event.target.value.toLowerCase())}
            />
          </label>
          <button type="submit" disabled={socialActionBusy || friendUsername.trim().length < 3}>
            {socialActionBusy ? "Working..." : "Send Friend Request"}
          </button>
          {friendError && <small className="friend-error" role="alert">{friendError}</small>}
        </form>

        <div className="friend-list-card">
          <div className="friend-list-header">
            <strong>Friends</strong>
            <div>
              <button type="button" onClick={onRefreshBattleInvites}>Invites</button>
              <button type="button" onClick={onRefreshFriends}>Refresh</button>
            </div>
          </div>

          {friends?.friends?.length ? (
            <div className="friend-card-list">
              {friends.friends.map((friend) => (
                <FriendCard
                  key={friend.friendshipId}
                  friend={friend}
                  classMeta={classMeta}
                  selected={selectedFriendUsername === friend.username}
                  onSelectFriend={onSelectFriend}
                  actions={
                    <button
                      type="button"
                      disabled={socialActionBusy || invitedUsername === friend.username}
                      onClick={() => onInviteFriend(friend)}
                    >
                      {invitedUsername === friend.username ? "Invited" : "Invite"}
                    </button>
                  }
                />
              ))}
            </div>
          ) : (
            <p>No friends yet. Send a request to start building your party.</p>
          )}
        </div>
      </div>

      {(friends?.incomingRequests?.length > 0 || friends?.outgoingRequests?.length > 0) && (
        <div className="friend-request-grid">
          {friends.incomingRequests?.length > 0 && (
            <div className="friend-list-card">
              <strong>Incoming Requests</strong>
              <div className="friend-card-list">
                {friends.incomingRequests.map((friend) => (
                  <FriendCard
                    key={friend.friendshipId}
                    friend={friend}
                    classMeta={classMeta}
                    actions={
                      <>
                        <button type="button" disabled={socialActionBusy} onClick={() => onAcceptFriend(friend.friendshipId)}>Accept</button>
                        <button type="button" disabled={socialActionBusy} onClick={() => onDeclineFriend(friend.friendshipId)}>Decline</button>
                      </>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {friends.outgoingRequests?.length > 0 && (
            <div className="friend-list-card">
              <strong>Sent Requests</strong>
              <div className="friend-card-list">
                {friends.outgoingRequests.map((friend) => (
                  <FriendCard
                    key={friend.friendshipId}
                    friend={friend}
                    classMeta={classMeta}
                    actions={<button type="button" disabled={socialActionBusy} onClick={() => onDeclineFriend(friend.friendshipId)}>Cancel</button>}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(selectedFriend || friendLeaderboard.length > 0) && (
        <div className="friend-social-grid">
          {selectedFriend && (
            <FriendProfileCard
              friend={selectedFriend}
              classMeta={classMeta}
              invitePending={invitedUsername === selectedFriend.username}
              socialActionBusy={socialActionBusy}
              onInviteFriend={onInviteFriend}
            />
          )}

          {friendLeaderboard.length > 0 && (
            <div className="friend-leaderboard-card">
              <strong>Friend Leaderboard</strong>
              <div className="friend-leaderboard-list">
                {friendLeaderboard.slice(0, 5).map((friend, index) => (
                  <div key={friend.friendshipId} className="friend-leaderboard-row">
                    <span>{index + 1}</span>
                    <strong>{friend.displayName}</strong>
                    <small>Lvl {friend.level} · {friend.bossesDefeated || 0} bosses</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {battleHistory.length > 0 && (
        <div className="battle-history-card">
          <div className="friend-list-header">
            <strong>Battle History</strong>
            <button type="button" onClick={onRefreshBattleHistory}>Refresh</button>
          </div>
          <div className="battle-history-list">
            {battleHistory.slice(0, 4).map((battle) => (
              <div key={battle.id} className="battle-history-row">
                <strong>{battle.hostUsername} vs {battle.guestUsername}</strong>
                <small>Winner: {battle.winnerUsername} · {battle.hostWins}-{battle.guestWins} · {battle.rounds} rounds</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="battle-connect-grid">
        <div className="battle-connect-card">
          <strong>Create a Room</strong>
          <p>Start a local friendly match and share the 6-digit code.</p>
          <button type="button" disabled={socialActionBusy} onClick={() => onCreateRoom()}>
            {socialActionBusy ? "Working..." : "Create Battle Code"}
          </button>
        </div>

        <form className="battle-connect-card" onSubmit={onJoinRoom}>
          <strong>Join Friend</strong>
          <p>Enter the code from your friend’s screen.</p>
          <label>
            <span>Battle Code</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={battleCode}
              placeholder="123456"
              onChange={(event) => setBattleCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>
          <button type="submit" disabled={socialActionBusy || battleCode.length !== 6}>
            Join Battle
          </button>
        </form>
      </div>

      {battleError && <strong className="friendly-battle-error" role="alert">{battleError}</strong>}

      {!battleRoom && (
        <div className="battle-empty-card">
          <div className="battle-empty-arena">
            <span>Host</span>
            <strong>VS</strong>
            <span>Guest</span>
          </div>
          <div>
            <strong>Ready when your party is</strong>
            <p>Create a room for a quick code match, or invite a friend from the list above for a cleaner head-to-head start.</p>
          </div>
        </div>
      )}

      {battleRoom && (
        <>
          <div className={`friendly-battle-arena battle-status-${status.toLowerCase()}`}>
            <BattlePlayerCard player={host} side="Host" classMeta={classMeta} wins={battleRoom.hostWins || 0} />
            <div className="battle-versus-core">
              <span>VS</span>
              <strong>Round {Math.max(1, (battleRoom.round || 0) + 1)}</strong>
              <small>{formatStatus(status)}</small>
            </div>
            <BattlePlayerCard player={guest} side="Guest" classMeta={classMeta} wins={battleRoom.guestWins || 0} />
          </div>

          <div className="battle-round-track" aria-label={`Host ${hostWins}, guest ${guestWins}, first to ${firstTo}`}>
            <span>
              <small>Host</small>
              <strong>{hostWins}</strong>
            </span>
            <div>
              {Array.from({ length: firstTo }, (_, index) => (
                <i key={`host-${index}`} className={index < hostWins ? "host-win" : ""} />
              ))}
            </div>
            <strong>First to {firstTo}</strong>
            <div>
              {Array.from({ length: firstTo }, (_, index) => (
                <i key={`guest-${index}`} className={index < guestWins ? "guest-win" : ""} />
              ))}
            </div>
            <span>
              <small>Guest</small>
              <strong>{guestWins}</strong>
            </span>
          </div>

          <div className="battle-room-tools">
            <button type="button" onClick={() => onRefreshRoom()}>
              Refresh Battle
            </button>
            <button type="button" className="battle-leave-button" disabled={socialActionBusy} onClick={onLeaveRoom}>
              Leave Room
            </button>
            <span>{battleRoom.viewerMoveLocked ? "Your move is locked." : "Choose your move."}</span>
            {battleRoom.opponentMoveLocked && <span>Friend is ready.</span>}
          </div>

          {status !== "WAITING" && status !== "COMPLETE" && (
            <div className="battle-move-grid">
              {BATTLE_MOVES.map((move) => (
                <button
                  key={move.key}
                  type="button"
                  className={`battle-move-${move.key.toLowerCase()}`}
                  disabled={socialActionBusy || battleRoom.viewerMoveLocked}
                  onClick={() => onChooseMove(move.key)}
                >
                  <small>{moveRole(move.key)}</small>
                  <strong>{move.label}</strong>
                  <span>{move.hint}</span>
                </button>
              ))}
            </div>
          )}

          {status === "WAITING" && (
            <div className="battle-wait-card">
              <strong>Waiting for a friend</strong>
              <p>Share code <b>{battleRoom.code}</b>. Same Wi-Fi players can open your app using your computer’s local IP.</p>
              <small>{localJoinUrl}</small>
            </div>
          )}

          {battleRoom.lastResult && (
            <div className="battle-result-card">
              <strong>{battleRoom.lastResult}</strong>
            </div>
          )}

          <div className="battle-log-list">
            {(battleRoom.log || []).map((line, index) => (
              <span key={`${line}-${index}`}>{line}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FriendCard({ friend, classMeta, selected = false, onSelectFriend, actions = null }) {
  const meta = classMeta[friend.primaryClass] || classMeta.NOVICE || { icon: "◇", label: friend.primaryClass };

  return (
    <div className={`friend-card ${selected ? "selected" : ""}`}>
      <span>{meta.icon}</span>
      <button type="button" className="friend-card-main" onClick={() => onSelectFriend?.(friend.username)}>
        <strong>{friend.displayName}</strong>
        <small>@{friend.username} · {meta.label} · Level {friend.level}</small>
        <em>{friend.onlineStatus || "Available"} · {friend.lastSeenLabel || "Local profile"}</em>
      </button>
      {actions && <div className="friend-card-actions">{actions}</div>}
    </div>
  );
}

function FriendProfileCard({ friend, classMeta, invitePending = false, socialActionBusy = false, onInviteFriend }) {
  const meta = classMeta[friend.primaryClass] || classMeta.NOVICE || { icon: "◇", label: friend.primaryClass };

  return (
    <div className="friend-profile-card">
      <div className="friend-profile-header">
        <span>{meta.icon}</span>
        <div>
          <strong>{friend.displayName}</strong>
          <small>@{friend.username} · {friend.title || meta.label}</small>
        </div>
      </div>
      <div className="friend-profile-stats">
        <div>
          <span>Level</span>
          <strong>{friend.level}</strong>
        </div>
        <div>
          <span>XP</span>
          <strong>{friend.xp || 0}</strong>
        </div>
        <div>
          <span>Bosses</span>
          <strong>{friend.bossesDefeated || 0}</strong>
        </div>
        <div>
          <span>Mastery</span>
          <strong>{friend.classMastery || 0}</strong>
        </div>
      </div>
      <div className="friend-profile-readiness">
        <div>
          <small>Threat Profile</small>
          <strong>{playerPowerScore(friend)}%</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${playerPowerScore(friend)}%` }} />
        </i>
      </div>
      <button type="button" disabled={socialActionBusy || invitePending} onClick={() => onInviteFriend(friend)}>
        {invitePending ? "Invite Pending" : "Invite to Battle"}
      </button>
    </div>
  );
}

function BattlePlayerCard({ player, side, classMeta, wins }) {
  if (!player) {
    return (
      <div className="battle-player-card empty">
        <span>{side}</span>
        <strong>Open Slot</strong>
        <small>Waiting...</small>
      </div>
    );
  }

  const meta = classMeta[player.primaryClass] || classMeta.NOVICE || { icon: "◇", label: player.primaryClass };
  const powerScore = playerPowerScore(player, wins);
  const rank = powerScore >= 85 ? "S" : powerScore >= 70 ? "A" : powerScore >= 50 ? "B" : "C";

  return (
    <div className="battle-player-card">
      <span>{side}</span>
      <b className="battle-player-rank">{rank}</b>
      <div className="battle-player-sigil">{meta.icon}</div>
      <strong>{player.displayName}</strong>
      <small>{meta.label} · Level {player.level}</small>
      <div className="battle-power-meter" aria-label={`${player.displayName} power ${powerScore}`}>
        <i style={{ width: `${powerScore}%` }} />
      </div>
      <em>{wins} round win{wins === 1 ? "" : "s"}</em>
    </div>
  );
}

function playerPowerScore(player = {}, wins = 0) {
  return Math.max(1, Math.min(100, (player.level || 1) * 8 + (player.bossesDefeated || 0) * 3 + wins * 12));
}

function moveRole(key = "") {
  if (key === "POWER") return "Pressure";
  if (key === "FOCUS") return "Counter";
  if (key === "GUARD") return "Defense";
  if (key === "BURST") return "Finisher";

  return "Move";
}

function formatStatus(status) {
  switch (status) {
    case "WAITING": return "Waiting";
    case "READY": return "Ready";
    case "COMPLETE": return "Match Complete";
    default: return status;
  }
}
