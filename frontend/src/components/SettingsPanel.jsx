import { useEffect, useState } from "react";

export default function SettingsPanel({
  username,
  reduceMotion,
  setReduceMotion,
  compactMobile,
  setCompactMobile,
  audioFeedback,
  setAudioFeedback,
  onReset,
  onLogout
}) {
  const [resetArmed, setResetArmed] = useState(false);
  const comfortScore = [reduceMotion, compactMobile, audioFeedback].filter(Boolean).length;
  const clientMode = compactMobile ? "Travel Ready" : "Full HUD";

  useEffect(() => {
    if (!resetArmed) return;
    const timeout = setTimeout(() => setResetArmed(false), 8000);
    return () => clearTimeout(timeout);
  }, [resetArmed]);

  return (
    <div className="panel settings-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Account and Comfort</p>
          <h3>Settings</h3>
          <p>Signed in as {username}</p>
        </div>
      </div>

      <div className="settings-status-strip">
        <span>
          <small>Motion</small>
          <strong>{reduceMotion ? "Reduced" : "Full"}</strong>
        </span>
        <span>
          <small>Mobile UI</small>
          <strong>{compactMobile ? "Compact" : "Expanded"}</strong>
        </span>
        <span>
          <small>Audio</small>
          <strong>{audioFeedback ? "Enabled" : "Muted"}</strong>
        </span>
      </div>

      <div className="settings-client-card" aria-label="Client status">
        <div>
          <small>Client Mode</small>
          <strong>{clientMode}</strong>
        </div>
        <i aria-hidden="true">
          <b style={{ width: `${Math.round((comfortScore / 3) * 100)}%` }} />
        </i>
        <span>{comfortScore}/3 comfort toggles active</span>
      </div>

      <div className="settings-mode-strip">
        <span>{reduceMotion ? "Low motion pipeline" : "Animation pipeline"}</span>
        <span>{compactMobile ? "Compact cards" : "Expanded cards"}</span>
        <span>{audioFeedback ? "Sound hooks armed" : "Silent client"}</span>
      </div>

      <div className="settings-grid">
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => setReduceMotion(event.target.checked)}
          />
          <span>Reduced animation</span>
        </label>

        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={compactMobile}
            onChange={(event) => setCompactMobile(event.target.checked)}
          />
          <span>Compact mobile cards</span>
        </label>

        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={audioFeedback}
            onChange={(event) => setAudioFeedback(event.target.checked)}
          />
          <span>UI sound feedback</span>
        </label>
      </div>

      <div className="settings-action-row">
        {!resetArmed ? (
          <button type="button" onClick={() => setResetArmed(true)}>
            Reset Save
          </button>
        ) : (
          <div className="settings-reset-confirm" role="alert" aria-live="assertive">
            <strong>Erase all hero progress?</strong>
            <button type="button" className="danger-button" onClick={onReset}>Yes, Reset Everything</button>
            <button type="button" onClick={() => setResetArmed(false)}>Cancel</button>
          </div>
        )}
        <button type="button" onClick={onLogout}>
          Log Out
        </button>
      </div>

      <small>Password changes can be added as a backend account endpoint next.</small>
    </div>
  );
}
