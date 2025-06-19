// src/components/CompareCard.jsx
import React from 'react';
import OdometerLiveCounter from './OdometerLiveCounter';

export default function CompareCard({ left, right, onRemove, showDot = true }) {
  if (!left || !right) return null;

  const difference = left.count - right.count;
  const isLeftLeading = difference > 0;
  const isRightLeading = difference < 0;

  return (
    <div className="relative p-1 mb-1.5 ml-1 w-auto h-[90px] border bg-white dark:bg-gray-800 shadow-md">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-transparent hover:text-transparent text-xs"
        title="Remove Comparison"
        aria-label="Remove Comparison"
      >
        ✕
      </button>

      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row items-center w-[500px]">
          {/* Left */}
          <div className="flex items-center gap-2 w-[40%] ml-2">
            <img src={left.thumbnail} className="w-14 h-14 rounded-full border border-gray-300" alt="Left channel" />
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold mt-1 truncate text-gray-900 dark:text-white" title={left.title}>
                {left.title.length > 15 ? left.title.slice(0, 10) + '...' : left.title}
              </h3>
              <OdometerLiveCounter
                value={left.count}
                source="compare"
                speed={20}
                fontSize={18}
                showDot={false}
              />
            </div>
          </div>

          {/* Difference */}
          <div className="text-center px-2 flex flex-col items-center w-[25%]">
            <div className={`text-lg font-bold ${isLeftLeading ? 'text-green-500' : isRightLeading ? 'text-red-500' : 'text-gray-500'}`}>
              {difference > 0 ? '▲' : difference < 0 ? '▼' : '—'}
            </div>
            <div className="mt-[-2px] text-xs">
              <OdometerLiveCounter
                value={Math.abs(difference)}
                source="compare"
                speed={20}
                fontSize={14}
                showDot={false}
              />
            </div>
            <div className="text-xs text-gray-400 mt-[-4px]">subs diff</div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 w-[40%] mr-2">
            <img src={right.thumbnail} className="w-14 h-14 rounded-full border border-gray-300" alt="Right channel" />
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold mt-1 truncate text-gray-900 dark:text-white" title={right.title}>
                {right.title.length > 15 ? right.title.slice(0, 10) + '...' : right.title}
              </h3>
              <OdometerLiveCounter
                value={right.count}
                source="compare"
                speed={20}
                fontSize={18}
                showDot={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
