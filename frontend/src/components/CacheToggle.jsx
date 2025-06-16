// components/CacheToggle.jsx
import React from 'react';
import { Switch } from '@headlessui/react';

export function CacheToggle({ enabled, onToggle }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-2 rounded-xl shadow w-fit">
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Cache</span>
      <Switch
        checked={enabled}
        onChange={onToggle}
        className={`${
          enabled ? 'bg-green-600' : 'bg-gray-400'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      {/* <span className={`text-xs ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span> */}
    </div>
  );
}
