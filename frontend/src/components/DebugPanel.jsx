// src/components/DebugPanel.jsx
import React from 'react';

export default function DebugPanel({
  pollInterval,
  cacheTTL,
  bypassCache,
  tickerSpeed,
  cacheEnabled,
  theme,
  lastFetch,
  fetchStats = { live: 0, cached: 0 },
}) {
  return (
    <div className="fixed bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs p-3 rounded shadow-lg z-50 space-y-1 font-mono">
      <div>🧪 <strong>Debug Info</strong></div>
      <div>🔁 Poll Interval: {pollInterval}ms</div>
      <div>♻️ Cache TTL: {cacheTTL}ms</div>
      <div>🚫 Bypass Cache: {bypassCache ? '✅' : '❌'}</div>
      <div>🧠 Cache Enabled: {cacheEnabled ? '✅' : '❌'}</div>
      <div>⏱ Ticker Speed: {tickerSpeed}</div>
      <div>🎨 Theme: {theme}</div>
      <div>🟢 Live Fetches: {fetchStats.live.toLocaleString()}</div>
      <div>🟡 Cached Fetches: {fetchStats.cached.toLocaleString()}</div>
      <div>
        🕒 Last Fetch:{' '}
        {lastFetch
          ? `${new Date(lastFetch).toLocaleTimeString()} (${Math.floor((Date.now() - lastFetch) / 1000)}s ago)`
          : 'N/A'}
      </div>
    </div>
  );
}

