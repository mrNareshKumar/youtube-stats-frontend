// src/components/ComparePanel.jsx
import React, { useState } from 'react';

export default function ComparePanel({ channels, onAddPair }) {
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');

  const handleAdd = () => {
    if (!leftId || !rightId || leftId === rightId) {
      alert('Select two different channels.');
      return;
    }
    onAddPair({ leftId, rightId });
    setLeftId('');
    setRightId('');
  };

  return (
    <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow w-full">
      <h3 className="font-bold mb-2 text-sm">Compare Panel</h3>
      <div className="flex flex-col gap-2">
        <select
          value={leftId}
          onChange={(e) => setLeftId(e.target.value)}
          className="px-2 py-1 rounded text-sm border"
        >
          <option value="">Select Left</option>
          {channels.map((c) => (
            <option key={c.channelId} value={c.channelId}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={rightId}
          onChange={(e) => setRightId(e.target.value)}
          className="px-2 py-1 rounded text-sm border"
        >
          <option value="">Select Right</option>
          {channels.map((c) => (
            <option key={c.channelId} value={c.channelId}>
              {c.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white text-xs px-2 py-1 rounded"
        >
          ➕ Add Compare Pair
        </button>
      </div>
    </div>
  );
}
