// src/components/Sidebar.jsx
import React from "react";
import { motion } from "framer-motion";
import { SearchBar } from "./SearchBar";
import { ToggleTheme } from "./ToggleTheme";
import { CacheToggle } from "./CacheToggle";
import ConfigPanel from "./ConfigPanel";
import DebugPanel from "./DebugPanel";
import BackgroundPanel from "./BackgroundPanel";
import ComparePanel from "./ComparePanel";
import EmbedConfigPanel from "./EmbedConfigPanel";

export default function Sidebar({
  setShowSidebar,
  config,
  setConfig,
  viewMode,
  setViewMode,
  adjustments,
  setAdjustments,
  showDebugPanel,
  setShowDebugPanel,
  showBackgroundPanel,
  setShowBackgroundPanel,
  showEmbedConfigPanel,
  setShowEmbedConfigPanel,
  setEmbedStyles,
  addChannel,
  customBackgrounds,
  setCustomBackgrounds,
  channels,
  addComparePair,
  userId,
  theme,
  lastFetch,
  fetchStats,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-end"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setShowSidebar(false);
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.8,
        }}
        className="bg-white dark:bg-zinc-900 w-[320px] max-w-full h-full p-4 overflow-y-auto scrollbar-hide shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">SYoutube Stats Das</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-red-500 text-xl"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <SearchBar onAddChannel={addChannel} />

        <label className="mt-2">Mode:</label>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="shadow rounded px-2 py-1 w-full bg-white dark:bg-zinc-700"
        >
          <option value="iframe">Live Iframe</option>
          <option value="api">API Count</option>
        </select>

        <div className="my-2">
          <CacheToggle
            enabled={!config.bypassCache}
            onToggle={() =>
              setConfig({ ...config, bypassCache: !config.bypassCache })
            }
          />
        </div>

        <ToggleTheme />

        <ConfigPanel
          {...config}
          onChange={(key, value) =>
            setConfig((prev) => ({ ...prev, [key]: value }))
          }
          showBackgroundPanel={showBackgroundPanel}
          onToggleBackgroundPanel={() => setShowBackgroundPanel((v) => !v)}
        />

        <button
          onClick={() => setShowEmbedConfigPanel(prev => !prev)} // ✅ Toggle instead of just `true`
          className="text-sm px-3 py-1 bg-pink-600 text-white rounded shadow w-full my-1"
        >
          🎯 Customize Embed Styles
        </button>
        
        {showEmbedConfigPanel && (
          <EmbedConfigPanel
            userId={userId}
            setGlobalEmbedStyles={setEmbedStyles}
          />
        )}

        <button
          onClick={() => setShowDebugPanel((v) => !v)}
          className="text-sm px-3 py-1 bg-yellow-600 text-white rounded shadow w-full my-1"
        >
          🐞 Toggle Debug Panel
        </button>

        <button
          onClick={() => setShowBackgroundPanel(prev => !prev)} // ✅ Toggle instead of just `true`
          className="text-sm px-3 py-1 bg-indigo-600 text-white rounded shadow w-full my-1"
        >
          🎨 Customize Backgrounds
        </button>

        <BackgroundPanel
          visible={showBackgroundPanel}
          toggleVisibility={() => setShowBackgroundPanel(false)}
          customBackgrounds={customBackgrounds}
          setCustomBackgrounds={setCustomBackgrounds}
          channels={channels}
          userId={userId}
        />

        <ComparePanel channels={channels} onAddPair={addComparePair} />

        {Object.keys(adjustments).length > 0 && (
          <button
            onClick={() => setAdjustments({})}
            className="text-sm px-3 py-1 bg-red-600 text-white rounded shadow w-full mt-2"
          >
            Reset Adjustments
          </button>
        )}

        {showDebugPanel && (
          <DebugPanel
            pollInterval={config.pollInterval}
            cacheTTL={config.cacheTTL}
            bypassCache={config.bypassCache}
            tickerSpeed={config.tickerSpeed}
            cacheEnabled={!config.bypassCache}
            theme={theme}
            lastFetch={lastFetch}
            fetchStats={fetchStats}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
