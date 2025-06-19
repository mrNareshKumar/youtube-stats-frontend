import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function IframeConfigPanel({ userId, setIframeStyles }) {
  const [styles, setStyles] = useState({
    counter: 0,
    odoSpeed: 700,
    fontSize: 25,
    fontColor: "#ffffff",
    bgColor: "#000000",
    titleSize: 25,
    titleColor: "#ffffff",
    odoUpColor: "#49e53b",
    odoDownColor: "#ff000d",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "users", userId, "embedConfigs", "iframe");
        const snap = await getDoc(ref);
        if (snap.exists()) setStyles(snap.data());
      } catch (err) {
        console.error("Failed to load iframe config", err);
      }
    };
    load();
  }, [userId]);

  const apply = async () => {
    try {
      const ref = doc(db, "users", userId, "embedConfigs", "iframe");
      await setDoc(ref, styles);
      setIframeStyles(styles);
    } catch (err) {
      console.error("Failed to save iframe config", err);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-inner text-sm mt-4">
      <h3 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">
        🧩 Iframe Style Config
      </h3>

      <label className="block">Counter Type</label>
      <select
        value={styles.counter}
        onChange={(e) => setStyles({ ...styles, counter: parseInt(e.target.value) })}
        className="w-full mb-2 p-1 rounded"
      >
        <option value={0}>Subscribers</option>
        <option value={1}>Channel Views</option>
        <option value={2}>Videos</option>
      </select>

      <label className="block">Odometer Speed (ms)</label>
      <input
        type="number"
        value={styles.odoSpeed}
        onChange={(e) => setStyles({ ...styles, odoSpeed: parseInt(e.target.value) })}
        className="w-full mb-2 px-2 py-1 border rounded"
      />

      <label className="block">Font Size</label>
      <input
        type="number"
        value={styles.fontSize}
        onChange={(e) => setStyles({ ...styles, fontSize: parseInt(e.target.value) })}
        className="w-full mb-2 px-2 py-1 border rounded"
      />

      <label className="block">Font Color</label>
      <input
        type="color"
        value={styles.fontColor}
        onChange={(e) => setStyles({ ...styles, fontColor: e.target.value })}
        className="w-full mb-2"
      />

      <label className="block">Background Color</label>
      <input
        type="color"
        value={styles.bgColor}
        onChange={(e) => setStyles({ ...styles, bgColor: e.target.value })}
        className="w-full mb-2"
      />

      <label className="block">Title Size</label>
      <input
        type="number"
        value={styles.titleSize}
        onChange={(e) => setStyles({ ...styles, titleSize: parseInt(e.target.value) })}
        className="w-full mb-2 px-2 py-1 border rounded"
      />

      <label className="block">Title Color</label>
      <input
        type="color"
        value={styles.titleColor}
        onChange={(e) => setStyles({ ...styles, titleColor: e.target.value })}
        className="w-full mb-2"
      />

      <label className="block">OdoUp Color</label>
      <input
        type="color"
        value={styles.odoUpColor}
        onChange={(e) => setStyles({ ...styles, odoUpColor: e.target.value })}
        className="w-full mb-2"
      />

      <label className="block">OdoDown Color</label>
      <input
        type="color"
        value={styles.odoDownColor}
        onChange={(e) => setStyles({ ...styles, odoDownColor: e.target.value })}
        className="w-full mb-2"
      />

      <button
        onClick={apply}
        className="bg-blue-600 text-white px-3 py-1 rounded w-full mt-2"
      >
        ✅ Apply
      </button>
    </div>
  );
}
