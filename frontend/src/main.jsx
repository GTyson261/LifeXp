import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NetworkStatus />
    <App />
  </React.StrictMode>
);

function NetworkStatus() {
  const [online, setOnline] = React.useState(() => navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="network-status-banner" role="status" aria-live="polite">
      <span aria-hidden="true">○</span>
      <strong>Offline mode</strong>
      <small>The app shell is available, but new progress cannot sync until your connection returns.</small>
    </div>
  );
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
