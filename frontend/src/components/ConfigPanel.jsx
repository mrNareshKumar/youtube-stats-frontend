import React from 'react';

export default function ConfigPanel({
  pollInterval,
  cacheTTL,
  bypassCache,
  tickerSpeed,
  showAdjustControls,
  showBackgroundPanel, // ⬅️ new prop
  onChange,
  onToggleBackgroundPanel // ⬅️ new prop
}) {
  const handleClear = () => {
    localStorage.removeItem('yt-config');
    window.location.reload();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded shadow p-4 space-y-4 text-sm w-full max-w-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex justify-between items-center">
          <label className="font-medium">Poll Interval:</label>
          <select
            value={pollInterval}
            onChange={(e) => onChange('pollInterval', Number(e.target.value))}
            className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700"
          >
            <option value={3000}>3s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={20000}>20s</option>
            <option value={30000}>30s</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <label className="font-medium">Cache TTL:</label>
          <select
            value={cacheTTL}
            onChange={(e) => onChange('cacheTTL', Number(e.target.value))}
            className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700"
          >
            <option value={0}>Disabled</option>
            <option value={3000}>3s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={20000}>20s</option>
            <option value={30000}>30s</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <label className="font-medium flex items-center gap-2">
            <input
              type="checkbox"
              checked={bypassCache}
              onChange={(e) => onChange('bypassCache', e.target.checked)}
              className="scale-125"
            />
            Bypass Cache:
          </label>
        </div>

        <div className="flex justify-between items-center">
          <label className="font-medium">Ticker Speed:</label>
          <select
            value={tickerSpeed}
            onChange={(e) => onChange('tickerSpeed', Number(e.target.value))}
            className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-700"
          >
            <option value={15}>Fast</option>
            <option value={30}>Normal</option>
            <option value={60}>Slow</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <label htmlFor="adjustToggle" className="text-zinc-800 dark:text-white font-medium">
          Show Adjust Controls
        </label>
        <input
          type="checkbox"
          id="adjustToggle"
          checked={showAdjustControls}
          onChange={(e) => onChange('showAdjustControls', e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-600"
        />
      </div>

      {/* 🔘 Toggle Background Panel */}
      <div className="flex justify-between items-center">
        <label className="font-medium text-zinc-800 dark:text-white">Background Panel</label>
        <button
          onClick={onToggleBackgroundPanel}
          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {showBackgroundPanel ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* 🔄 Clear settings button */}
      <div className="text-right pt-2">
        <button
          onClick={handleClear}
          className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded"
        >
          🔄 Clear Settings
        </button>
      </div>
    </div>
  );
}
