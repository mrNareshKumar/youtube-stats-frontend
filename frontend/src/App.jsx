// src/App.jsx
import React, { useState, useEffect } from "react";
import "odometer/themes/odometer-theme-default.css";
import { CardGrid } from "./components/CardGrid";
import { SearchBar } from "./components/SearchBar";
import { ToggleTheme } from "./components/ToggleTheme";
import { CacheToggle } from "./components/CacheToggle";
import ConfigPanel from "./components/ConfigPanel";
import DebugPanel from "./components/DebugPanel";
import BackgroundPanel from "./components/BackgroundPanel";
import ComparePanel from "./components/ComparePanel";
import CompareCard from "./components/CompareCard";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
  onSnapshot,
  getDocs
} from "firebase/firestore";
import { fetchChannelInfo } from "./utils/youtube";

export default function App() {
  const userId = "default-user";
  const [channels, setChannels] = useState([]);
  const [adjustments, setAdjustments] = useState({});
  const [comparePairs, setComparePairs] = useState([]);
  const [customBackgrounds, setCustomBackgrounds] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showSidebar, setShowSidebar] = useState(
    () => JSON.parse(localStorage.getItem("showSidebar") || "true")
  );

  const [viewMode, setViewMode] = useState("iframe");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);

  const [liveCounts, setLiveCounts] = useState({});
  const [freshSources, setFreshSources] = useState({});
  const [lastFetch, setLastFetch] = useState(Date.now());
  const [fetchStats, setFetchStats] = useState({ live: 0, cached: 0 });

  const defaultConfig = {
    pollInterval: 5000,
    cacheTTL: 5000,
    bypassCache: false,
    showAdjustControls: true,
    tickerSpeed: 30,
  };

  const [config, setConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("yt-config")) || defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  // Load channels and comparePairs from Firestore
  useEffect(() => {
    const unsubscribeCards = onSnapshot(collection(db, "cards"), (snapshot) => {
      setChannels(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    const unsubscribeCompare = onSnapshot(
      collection(db, "users", userId, "comparePairs"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComparePairs(data);
        localStorage.setItem("comparePairs", JSON.stringify(data));
      }
    );

    return () => {
      unsubscribeCards();
      unsubscribeCompare();
    };
  }, []);

  // Load adjustments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("channelAdjustments");
    if (saved) {
      try {
        setAdjustments(JSON.parse(saved));
      } catch {
        console.warn("Invalid channelAdjustments");
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("yt-config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("channelAdjustments", JSON.stringify(adjustments));
  }, [adjustments]);

  useEffect(() => {
    localStorage.setItem("comparePairs", JSON.stringify(comparePairs));
  }, [comparePairs]);

  const addChannel = async (channelData) => {
    if (channels.some((c) => c.channelId === channelData.channelId)) {
      alert("Channel already added!");
      return;
    }
    try {
      await addDoc(collection(db, "cards"), channelData);
      // ❌ REMOVE this manual setChannels to avoid duplicates:
      // setChannels((prev) => [...prev, { ...channelData, id: docRef.id }]);
    } catch (err) {
      console.error("Error adding channel:", err);
    }
  };

  const removeChannel = async (id) => {
    try {
      await deleteDoc(doc(db, "cards", id));
      setChannels((prev) => prev.filter((c) => c.id !== id));
      const removed = channels.find((c) => c.id === id);
      if (removed) {
        setAdjustments((prev) => {
          const copy = { ...prev };
          delete copy[removed.channelId];
          return copy;
        });
      }
    } catch (err) {
      console.error("Error removing channel:", err);
    }
  };

  const refreshChannel = async (id, channelId) => {
    const updated = await fetchChannelInfo(channelId);
    if (!updated) return;
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleAdjust = (id, direction) => {
    setAdjustments((prev) => ({
      ...prev,
      [id]: direction === "up" ? (prev[id] || 0) + 1 : (prev[id] || 0) - 1,
    }));
  };

  const getAdjustedSort = (channels, adjustments) => {
    return [...channels].sort((a, b) => {
      const offsetA = adjustments[a.channelId] || 0;
      const offsetB = adjustments[b.channelId] || 0;
      return (b.subscriberCount || 0) + offsetB - ((a.subscriberCount || 0) + offsetA);
    });
  };

  const adjustedSort = getAdjustedSort(channels, adjustments);

  const addComparePair = async (pair) => {
    const exists = comparePairs.some(
      (p) =>
        (p.leftId === pair.leftId && p.rightId === pair.rightId) ||
        (p.leftId === pair.rightId && p.rightId === pair.leftId)
    );
    if (exists) return;

    try {
      await addDoc(collection(db, "users", userId, "comparePairs"), pair);
    } catch (err) {
      console.error("Error adding compare pair:", err);
    }
  };

  const removeComparePair = async (id) => {
    try {
      await deleteDoc(doc(db, "users", userId, "comparePairs", id));
    } catch (err) {
      console.error("Error removing compare pair:", err);
    }
  };

  const getChannel = (id) => {
    const ch = channels.find((c) => c.channelId === id);
    const count = (liveCounts[id] ?? ch?.subscriberCount ?? 0) + (adjustments[id] || 0);
    return ch ? { ...ch, count } : null;
  };

  return (
    <div className="h-screen grid grid-cols-6 gap-0 p-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white overflow-hidden">
      <div className="col-span-6 lg:col-span-5 overflow-y-auto pr-2">
        <div className="flex flex-wrap gap-0.5">
          {comparePairs.map((pair, idx) => {
            const left = getChannel(pair.leftId);
            const right = getChannel(pair.rightId);
            if (!left || !right) return null;
            return (
              <CompareCard
                key={pair.id || idx}
                left={left}
                right={right}
                onRemove={() => removeComparePair(pair.id)}
              />
            );
          })}
          <div className="relative p-2 mb-1.5 ml-0.5 w-[298px] shadow-md">
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 drop-shadow-sm">
              Top 50
            </h1>
            <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 drop-shadow-sm">
              LIVE SUBSCRIBER COUNT
            </h2>
          </div>
        </div>

        <CardGrid
          channels={adjustedSort}
          onAdjust={handleAdjust}
          adjustments={adjustments}
          onRemove={removeChannel}
          onRefresh={refreshChannel}
          cacheEnabled={!config.bypassCache}
          viewMode={viewMode}
          {...config}
          setLastFetch={setLastFetch}
          setFetchStats={setFetchStats}
          showAdjustControls={config.showAdjustControls}
          customBackgrounds={customBackgrounds}
          liveCounts={liveCounts}
          setLiveCounts={setLiveCounts}
          freshSources={freshSources}
          setFreshSources={setFreshSources}
        />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col col-span-1 gap-2 overflow-y-auto pl-2 h-auto">
        <div className="flex flex-col gap-2 mb-3">
          <button
            onClick={() => setShowSidebar((v) => !v)}
            className={`w-12 h-6 ml-5 flex items-center rounded-full p-1 transition duration-300 ${
              showSidebar ? "bg-green-500" : "bg-white-400"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                showSidebar ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          {showSidebar && (
            <div className="flex flex-col gap-2 bg-white dark:bg-zinc-800 px-2 py-2 rounded-xl shadow w-fit">
              <SearchBar onAddChannel={addChannel} />
              <label>Mode:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="shadow rounded px-2 py-1 bg-white dark:bg-zinc-700"
              >
                <option value="iframe">Live Iframe</option>
                <option value="api">API Count</option>
              </select>
              <CacheToggle
                enabled={!config.bypassCache}
                onToggle={() => setConfig({ ...config, bypassCache: !config.bypassCache })}
              />
              <ToggleTheme />
              <ConfigPanel
                {...config}
                onChange={(key, value) => setConfig((prev) => ({ ...prev, [key]: value }))}
                showBackgroundPanel={showBackgroundPanel}
                onToggleBackgroundPanel={() => setShowBackgroundPanel((v) => !v)}
              />
              <button
                onClick={() => setShowDebugPanel((v) => !v)}
                className="text-sm px-3 py-1 bg-yellow-600 text-white rounded shadow"
              >
                🐞 Toggle Debug Panel
              </button>
              <button
                onClick={() => setShowBackgroundPanel(true)}
                className="text-sm px-3 py-1 bg-indigo-600 text-white rounded shadow"
              >
                🎨 Customize Backgrounds
              </button>
              <BackgroundPanel
                visible={showBackgroundPanel}
                toggleVisibility={() => setShowBackgroundPanel(false)}
                customBackgrounds={customBackgrounds}
                setCustomBackgrounds={setCustomBackgrounds}
                cardCount={channels.length}
                userId={userId}
              />
              <ComparePanel channels={channels} onAddPair={addComparePair} />
              {Object.keys(adjustments).length > 0 && (
                <button
                  onClick={() => setAdjustments({})}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded shadow"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
