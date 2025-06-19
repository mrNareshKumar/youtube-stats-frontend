// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "odometer/themes/odometer-theme-default.css";
import { CardGrid } from "./components/CardGrid";
import CompareCard from "./components/CompareCard";
import Sidebar from "./components/Sidebar";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  doc
} from "firebase/firestore";
import { fetchChannelInfo } from "./utils/youtube";

export default function App() {
  const userId = "default-user";
  const [channels, setChannels] = useState([]);
  const [adjustments, setAdjustments] = useState({});
  const [comparePairs, setComparePairs] = useState([]);
  const [customBackgrounds, setCustomBackgrounds] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState("iframe");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const [showEmbedConfigPanel, setShowEmbedConfigPanel] = useState(false);
  const [liveCounts, setLiveCounts] = useState({});
  const [freshSources, setFreshSources] = useState({});
  const [lastFetch, setLastFetch] = useState(Date.now());
  const [fetchStats, setFetchStats] = useState({ live: 0, cached: 0 });
  const [embedStyles, setEmbedStyles] = useState({});

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

  useEffect(() => {
    document.body.style.overflow = showSidebar ? 'hidden' : 'auto';
  }, [showSidebar]);

  const addChannel = async (channelData) => {
    if (channels.some((c) => c.channelId === channelData.channelId)) {
      alert("Channel already added!");
      return;
    }
    try {
      await addDoc(collection(db, "cards"), channelData);
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

  const adjustedSort = useMemo(() => {
    return [...channels].sort((a, b) => {
      const offsetA = adjustments[a.channelId] || 0;
      const offsetB = adjustments[b.channelId] || 0;
      return (b.subscriberCount || 0) + offsetB - ((a.subscriberCount || 0) + offsetA);
    });
  }, [channels, adjustments]);

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

  useEffect(() => {
    const loadEmbedStyles = async () => {
      try {
        const ref = doc(db, "users", userId, "embedConfigs", "default");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setEmbedStyles(snap.data());
        } else {
          console.log("No embed config found");
        }
      } catch (err) {
        console.error("Failed to load embed styles:", err);
      }
    };

    loadEmbedStyles();
  }, []);

  return (
    <div className="h-screen grid grid-cols-5 gap-0 p-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white theme-neon overflow-hidden">
      <div className="col-span-5 lg:col-span-5 overflow-y-auto pr-2">
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
          embedStyles={embedStyles}
        />
      </div>

      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="bg-zinc-800 text-white rounded px-3 py-2 shadow hover:bg-zinc-700"
          aria-label="Open sidebar"
        >
          ☰
        </button>
      </div>

      <AnimatePresence>
      {showSidebar && (
        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          config={config}
          setConfig={setConfig}
          viewMode={viewMode}
          setViewMode={setViewMode}
          adjustments={adjustments}
          setAdjustments={setAdjustments}
          showDebugPanel={showDebugPanel}
          setShowDebugPanel={setShowDebugPanel}
          showBackgroundPanel={showBackgroundPanel}
          setShowBackgroundPanel={setShowBackgroundPanel}
          showEmbedConfigPanel={showEmbedConfigPanel}
          setEmbedStyles={setEmbedStyles}
          setShowEmbedConfigPanel={setShowEmbedConfigPanel}
          addChannel={addChannel}
          customBackgrounds={customBackgrounds}
          setCustomBackgrounds={setCustomBackgrounds}
          channels={channels}
          addComparePair={addComparePair}
          userId={userId}
          theme={theme}
          lastFetch={lastFetch}
          fetchStats={fetchStats}
        />
      )}
    </AnimatePresence>

    </div>
  );
}
