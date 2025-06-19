import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EmbedConfigPanel({ userId, setGlobalEmbedStyles }) {
  const [embedStyles, setEmbedStyles] = useState({
    fontSize: "24px",
    fontColor: "#ffffff",
    bgColor: "#000000",
    odoSpeed: 2000,
  });

  useEffect(() => {
    if (!userId) return;

    const loadConfig = async () => {
      try {
        const ref = doc(db, "users", userId, "embedConfigs", "default");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setEmbedStyles(snap.data());
        }
      } catch (err) {
        console.error("Error loading embed config:", err);
      }
    };

    loadConfig();
  }, [userId]);

  const saveStyles = async () => {
    if (!userId) return;
    try {
      const ref = doc(db, "users", userId, "embedConfigs", "default");
      await setDoc(ref, embedStyles);
      if (setGlobalEmbedStyles) {
        setGlobalEmbedStyles(embedStyles);
      }
    } catch (err) {
      console.error("Error saving embed config:", err);
    }
  };

  const resetToDefault = async () => {
    const defaultStyles = {
      fontSize: "24px",
      fontColor: "#ffffff",
      bgColor: "#000000",
      odoSpeed: 2000,
    };
    try {
      const ref = doc(db, "users", userId, "embedConfigs", "default");
      await setDoc(ref, defaultStyles);
      setEmbedStyles(defaultStyles);
      if (setGlobalEmbedStyles) {
        setGlobalEmbedStyles(defaultStyles);
      }
    } catch (err) {
      console.error("Error resetting config:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-inner text-sm mt-4">
      <h3 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">🎨 Embed Style</h3>

      <label className="block">Font Size</label>
      <input
        type="text"
        value={embedStyles.fontSize}
        onChange={(e) =>
          setEmbedStyles({ ...embedStyles, fontSize: e.target.value })
        }
        className="w-full mb-2 px-2 py-1 border rounded"
      />

      <label className="block">Font Color</label>
      <input
        type="color"
        value={embedStyles.fontColor}
        onChange={(e) =>
          setEmbedStyles({ ...embedStyles, fontColor: e.target.value })
        }
        className="w-full mb-2"
      />

      <label className="block">Background Color</label>
      <input
        type="color"
        value={embedStyles.bgColor}
        onChange={(e) =>
          setEmbedStyles({ ...embedStyles, bgColor: e.target.value })
        }
        className="w-full mb-2"
      />

      <label className="block">Odometer Speed (ms)</label>
      <input
        type="number"
        value={embedStyles.odoSpeed}
        onChange={(e) =>
          setEmbedStyles({
            ...embedStyles,
            odoSpeed: parseInt(e.target.value) || 0,
          })
        }
        className="w-full mb-2 px-2 py-1 border rounded"
      />

      <div className="flex flex-col gap-2 mt-3">
        <button
          onClick={saveStyles}
          className="bg-blue-600 text-white px-3 py-1 rounded w-full"
        >
          ✅ Apply
        </button>
        <button
          onClick={resetToDefault}
          className="bg-zinc-500 text-white px-3 py-1 rounded w-full text-sm"
        >
          ♻️ Reset to Default
        </button>
      </div>
    </div>
  );
}
