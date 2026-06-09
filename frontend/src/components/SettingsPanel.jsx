export default function SettingsPanel({
  username,
  reduceMotion,
  setReduceMotion,
  compactMobile,
  setCompactMobile,
  onReset,
  onLogout
}) {
  return (
    <div className="panel settings-panel">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Account and Comfort</p>
          <h3>Settings</h3>
          <p>Signed in as {username}</p>
        </div>
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
      </div>

      <div className="settings-action-row">
        <button type="button" onClick={onReset}>
          Reset Save
        </button>
        <button type="button" onClick={onLogout}>
          Log Out
        </button>
      </div>

      <small>Password changes can be added as a backend account endpoint next.</small>
    </div>
  );
}
