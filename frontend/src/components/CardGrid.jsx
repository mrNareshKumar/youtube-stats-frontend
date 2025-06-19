// youtube-stats/frontend/src/components/CardGrid.jsx
import React, { useEffect, useMemo } from "react";
import OdometerLiveCounter from "./OdometerLiveCounter";
import { motion } from "framer-motion";

const defaultGradients = [
  "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
  "linear-gradient(135deg, #d4fc79, #96e6a1)",
  "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
  "linear-gradient(135deg, #ffecd2, #fcb69f)",
  "linear-gradient(135deg, #f6d365, #fda085)",
  "linear-gradient(135deg, #c2e9fb, #a1c4fd)",
  "linear-gradient(135deg, #fccb90, #d57eeb)",
  "linear-gradient(135deg, #fdfbfb, #ebedee)",
  "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #30cfd0, #330867)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #89f7fe, #66a6ff)",
  "linear-gradient(135deg, #ff9a8b, #ff6a88)",
  "linear-gradient(135deg, #7f7fd5, #86a8e7)",
  "linear-gradient(135deg, #ff6e7f, #bfe9ff)",
  "linear-gradient(135deg, #fddb92, #d1fdff)",
  "linear-gradient(135deg, #9795f0, #fbc8d4)",
  "linear-gradient(135deg, #c471f5, #fa71cd)",
  "linear-gradient(135deg, #48c6ef, #6f86d6)",
  "linear-gradient(135deg, #feada6, #f5efef)",
  "linear-gradient(135deg, #ffdde1, #ee9ca7)",
  "linear-gradient(135deg, #bdc3c7, #2c3e50)",
  "linear-gradient(135deg, #d9a7c7, #fffcdc)",
  "linear-gradient(135deg, #1fa2ff, #12d8fa)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
];

function Card({
  channel,
  onRemove,
  index,
  onAdjust,
  adjustments,
  viewMode,
  liveCount,
  freshness,
  showAdjustControls,
  customBackgrounds,
  embedStyles,
}) {
  const hasAdjustment = (adjustments?.[channel.channelId] || 0) !== 0;
  const bgConfig = customBackgrounds?.[channel.channelId]; // ✅ Use stable key

  const bgStyle = (() => {
    if (bgConfig?.type === "color") return { backgroundColor: bgConfig.value };
    if (bgConfig?.type === "image")
      return {
        backgroundImage: `url(${bgConfig.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    if (bgConfig?.type === "gradient")
      return { backgroundImage: bgConfig.value };
    return { background: defaultGradients[index % defaultGradients.length] };
  })();

  const animationClass = (() => {
    if (bgConfig?.type !== "gradient" || !bgConfig.animate) return "";
    switch (bgConfig.direction) {
      case "vertical":
        return "animate-gradient-y";
      case "diagonal":
        return "animate-gradient-xy";
      case "wave":
        return "animate-gradient-wave"; // new
      case "horizontal":
      default:
        return "animate-gradient-x";
    }
  })();

  const iframeParams = new URLSearchParams({
    fontSize: embedStyles?.fontSize || "24px",
    fontColor: (embedStyles?.fontColor || "#ffffff").replace("#", ""),
    bgColor: (embedStyles?.bgColor || "#000000").replace("#", ""),
    odoSpeed: embedStyles?.odoSpeed || 2000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center gap-1 w-full sm:w-[373px] h-[91px] border bg-white mr-1"
      style={{ backgroundColor: hasAdjustment ? "#1c2d40" : "#15202b" }}
    >
      <div
        className={`flex flex-col items-center justify-center w-12 h-full text-white text-sm font-bold rounded-sm z-10 ${animationClass}`}
        style={{
          ...bgStyle,
          animationDuration: `${bgConfig?.speed || 8}s`,
        }}
      >
        {String(index + 1).padStart(2, "0")}
        {channel.countryCode && (
          <img
            src={`https://flagcdn.com/w40/${channel.countryCode.toLowerCase()}.png`}
            alt={`${channel.countryCode.toUpperCase()} flag`}
            className="w-10 h-6 mt-5 rounded-sm cursor-pointer"
          />
        )}
        {/* Optional Video Background Rendering */}
        {bgConfig?.type === "video" && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover rounded-sm z-[-1] opacity-50"
            src={bgConfig.value}
          />
        )}
      </div>

      <motion.img
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        src={channel.thumbnail}
        alt={`${channel.title} thumbnail`}
        className="w-13 h-16 border border-white shadow-sm p-0 m-0 cursor-pointer"
      />

      <div className="flex flex-col justify-center w-auto relative">
        <div className="flex flex-row p-0 m-0 mb-1 justify-between items-start">
          <h2
            className={`text-md font-medium leading-snug mt-2 truncate max-w-[160px] ${
              hasAdjustment ? "text-yellow-300" : "text-white"
            }`}
            title={channel.title}
          >
            {channel.title}
          </h2>
        </div>

        <div className="w-[198px] h-[55px] overflow-hidden -mt-1">
          {viewMode === "iframe" ? (
            <iframe
              title={`Live subscriber count for ${channel.title}`}
              className="relative top-[-45px] left-[-98px] bottom-[-50px]"
              height="85px"
              width="800px"
              frameBorder="0"
              allowFullScreen
              src={`https://socialcounts.org/youtube-live-subscriber-count/${encodeURIComponent(
                channel.channelId
              )}/embed?${iframeParams.toString()}`}
            />
          ) : (
            <div
              className="p-3 rounded-lg shadow-md"
              style={{
                backgroundColor: embedStyles?.bgColor || "#39ff14",
                color: embedStyles?.fontColor || "",
                fontSize: embedStyles?.fontSize || "",
              }}
            >
              <OdometerLiveCounter
                fontSize={parseInt(embedStyles?.fontSize || 24)}
                value={liveCount ?? 0}
                source={freshness ?? "cached"}
                speed={embedStyles?.odoSpeed || 700}
                color={embedStyles?.fontColor}
              />
            </div>
          )}
        </div>

        {onAdjust && showAdjustControls && (
          <div className="flex gap-1 mt-0">
            <button
              onClick={() => onAdjust(channel.channelId, "up")}
              className="text-xs text-white bg-green-600 px-1 rounded"
            >
              ↑
            </button>
            <button
              onClick={() => onAdjust(channel.channelId, "down")}
              className="text-xs text-white bg-green-600 px-1 rounded"
            >
              ↓
            </button>
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0 m-1 mt-0">
        <button
          onClick={() => onRemove(channel.id)}
          className="text-transparent hover:transparent text-xs"
          title="Remove Channel"
          aria-label="Remove Channel"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function CardGrid({
  channels,
  onRemove,
  onAdjust,
  adjustments,
  viewMode,
  pollInterval = 5000,
  cacheTTL = 5000,
  bypassCache,
  showAdjustControls,
  customBackgrounds = {},
  liveCounts,
  setLiveCounts,
  freshSources,
  setFreshSources,
  embedStyles,
}) {
  useEffect(() => {
    let isCancelled = false;
    let intervalId;

    async function fetchCounts() {
      const counts = {};
      const freshness = {};
      const maxConcurrent = 2;
      const queue = [...channels];

      const workers = Array.from({ length: maxConcurrent }).map(async () => {
        while (queue.length > 0 && !isCancelled) {
          const channel = queue.shift();
          try {
            const BASE = import.meta.env.VITE_API_BASE;
            const res = await fetch(
              `${BASE}/api/subs/${channel.channelId}?bypassCache=${bypassCache}&cacheTTL=${cacheTTL}`
            );
            // const res = await fetch(`/api/subs/${channel.channelId}?bypassCache=${bypassCache}&cacheTTL=${cacheTTL}`);
            const data = await res.json();

            // ✅ NEW: Read the response header
            const fromCache = res.headers.get("x-from-cache") === "true";

            counts[channel.channelId] = data.subscriberCount;
            freshness[channel.channelId] = fromCache ? "cached" : "live";
            localStorage.setItem(
              `channel_${channel.channelId}`,
              JSON.stringify({
                subscriberCount: data.subscriberCount,
                timestamp: Date.now(),
              })
            );
          } catch (err) {
            console.error(
              `❌ Failed to fetch for ${channel.channelId}`,
              err.message
            );
            // Optional: Add an error state indicator here.
          }
          await new Promise((res) => setTimeout(res, 100));
        }
      });

      await Promise.all(workers);
      if (!isCancelled) {
        setLiveCounts(counts);
        setFreshSources(freshness);
      }
    }

    fetchCounts();
    intervalId = setInterval(fetchCounts, pollInterval);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [
    channels,
    pollInterval,
    bypassCache,
    cacheTTL,
    setLiveCounts,
    setFreshSources,
  ]);

  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => {
      const subA =
        (liveCounts[a.channelId] ?? 0) + (adjustments[a.channelId] ?? 0);
      const subB =
        (liveCounts[b.channelId] ?? 0) + (adjustments[b.channelId] ?? 0);
      return subB - subA;
    });
  }, [channels, liveCounts, adjustments]);

  const chunked = chunkArray(sortedChannels, 10);

  return (
    <div className="flex flex-row gap-0 w-full items-start px-0.5">
      {chunked.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-1">
          {column.map((channel, index) => {
            const globalIndex = colIndex * 10 + index;
            return (
              <Card
                key={channel.channelId}
                channel={channel}
                index={globalIndex}
                onRemove={onRemove}
                onAdjust={onAdjust}
                adjustments={adjustments}
                liveCount={liveCounts[channel.channelId] ?? 0}
                freshness={freshSources[channel.channelId] ?? "cached"}
                viewMode={viewMode}
                showAdjustControls={showAdjustControls}
                customBackgrounds={customBackgrounds}
                embedStyles={embedStyles}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
