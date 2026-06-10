const BATTLE_MOVES = [
  {
    key: "POWER",
    label: "Power Strike",
    hint: "Strong into guard."
  },
  {
    key: "FOCUS",
    label: "Focus Counter",
    hint: "Counters power."
  },
  {
    key: "GUARD",
    label: "Guard Stance",
    hint: "Stops burst."
  },
  {
    key: "BURST",
    label: "Limit Burst",
    hint: "Breaks focus."
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
  selectedFriendUsername,
  selectedFriend,
  onSelectFriend,
  friendLeaderboard = [],
  socialToast,
  classMeta = {}
}) {
  const host = battleRoom?.host;
  const guest = battleRoom?.guest;
  const status = battleRoom?.status || "IDLE";
  const invitedUsername = battleRoom?.inviteStatus === "INVITED" ? battleRoom.invitedUsername : "";

  return (
    <div className="panel friendly-battle-panel">
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

      {socialToast && (
        <div className="social-toast-card">
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
              <button key={invite.code} type="button" onClick={() => onAcceptBattleInvite(invite)}>
                Join {invite.host?.displayName || invite.host?.username || "Friend"} · {invite.code}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <button type="submit" disabled={friendUsername.trim().length < 3}>
            Send Friend Request
          </button>
          {friendError && <small className="friend-error">{friendError}</small>}
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
                      disabled={invitedUsername === friend.username}
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
                        <button type="button" onClick={() => onAcceptFriend(friend.friendshipId)}>Accept</button>
                        <button type="button" onClick={() => onDeclineFriend(friend.friendshipId)}>Decline</button>
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
                    actions={<button type="button" onClick={() => onDeclineFriend(friend.friendshipId)}>Cancel</button>}
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

      <div className="battle-connect-grid">
        <div className="battle-connect-card">
          <strong>Create a Room</strong>
          <p>Start a local friendly match and share the 6-digit code.</p>
          <button type="button" onClick={onCreateRoom}>
            Create Battle Code
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
          <button type="submit" disabled={battleCode.length !== 6}>
            Join Battle
          </button>
        </form>
      </div>

      {battleError && <strong className="friendly-battle-error">{battleError}</strong>}

      {!battleRoom && (
        <div className="battle-empty-card">
          <strong>Ready when your party is</strong>
          <p>Create a room for a quick code match, or invite a friend from the list above for a cleaner head-to-head start.</p>
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

          <div className="battle-room-tools">
            <button type="button" onClick={onRefreshRoom}>
              Refresh Battle
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
                  disabled={battleRoom.viewerMoveLocked}
                  onClick={() => onChooseMove(move.key)}
                >
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

function FriendProfileCard({ friend, classMeta, invitePending = false, onInviteFriend }) {
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
      <button type="button" disabled={invitePending} onClick={() => onInviteFriend(friend)}>
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

  return (
    <div className="battle-player-card">
      <span>{side}</span>
      <div className="battle-player-sigil">{meta.icon}</div>
      <strong>{player.displayName}</strong>
      <small>{meta.label} · Level {player.level}</small>
      <em>{wins} round win{wins === 1 ? "" : "s"}</em>
    </div>
  );
}

function formatStatus(status) {
  switch (status) {
    case "WAITING": return "Waiting";
    case "READY": return "Ready";
    case "COMPLETE": return "Match Complete";
    default: return status;
  }
}
