// CustomEmbedPanel.jsx
import React, { useState } from "react";

const presetThemes = {
  dark: {
    fontSize: 25,
    fontColor: "rgba(152,159,175,1)",
    bgColor: "rgba(0,0,0,1)",
    odoSpeed: 700,
  },
  neon: {
    fontSize: 28,
    fontColor: "rgba(0,255,180,1)",
    bgColor: "rgba(10,10,10,1)",
    odoSpeed: 400,
  },
  minimal: {
    fontSize: 20,
    fontColor: "rgba(100,100,100,1)",
    bgColor: "rgba(255,255,255,1)",
    odoSpeed: 1000,
  },
};

export default function CustomEmbedPanel({ channelId }) {
  const [style, setStyle] = useState(presetThemes.dark);

  const styleParams = encodeURIComponent(
    `.odoParrent{font-size:${style.fontSize}px;color:${style.fontColor}}body{background-color:${style.bgColor}!important}.title{font-size:${style.fontSize}px;color:${style.fontColor}}`
  );

  const embedURL = `https://socialcounts.org/youtube-live-subscriber-count/${channelId}/embed?counter=0&odospeed=${style.odoSpeed}&style=${styleParams}`;

  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-2">🎯 Custom Embed Preview</h3>

      <iframe
        title="Live Subscriber Count"
        className="w-full rounded border"
        height="100"
        src={embedURL}
        frameBorder="0"
        allowFullScreen
      ></iframe>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <label>
          Font Size:
          <input
            type="number"
            value={style.fontSize}
            onChange={(e) => setStyle({ ...style, fontSize: parseInt(e.target.value) })}
            className="w-full rounded p-1 mt-1"
          />
        </label>

        <label>
          Font Color (RGBA):
          <input
            type="text"
            value={style.fontColor}
            onChange={(e) => setStyle({ ...style, fontColor: e.target.value })}
            className="w-full rounded p-1 mt-1"
          />
        </label>

        <label>
          Background Color:
          <input
            type="text"
            value={style.bgColor}
            onChange={(e) => setStyle({ ...style, bgColor: e.target.value })}
            className="w-full rounded p-1 mt-1"
          />
        </label>

        <label>
          Odometer Speed:
          <input
            type="number"
            value={style.odoSpeed}
            onChange={(e) => setStyle({ ...style, odoSpeed: parseInt(e.target.value) })}
            className="w-full rounded p-1 mt-1"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(embedURL)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          📋 Copy Embed URL
        </button>

        <select
          onChange={(e) => setStyle(presetThemes[e.target.value])}
          className="px-2 py-1 rounded"
        >
          <option value="dark">Dark</option>
          <option value="neon">Neon</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
    </div>
  );
}
