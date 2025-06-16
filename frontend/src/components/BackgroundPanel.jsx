import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const themePresets = {
  Neon: { type: 'color', value: '#39ff14' },
  Retro: { type: 'image', value: 'https://i.imgur.com/vx0B0zF.jpg' },
  Vaporwave: { type: 'gradient', value: 'linear-gradient(270deg, #ff00cc, #3333ff)' },
  Cyber: { type: 'image', value: 'https://i.imgur.com/FcqRrgE.jpg' },
  Sunset: { type: 'gradient', value: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
  Ocean: { type: 'gradient', value: 'linear-gradient(135deg, #2BC0E4 0%, #EAECC6 100%)' },
  Space: { type: 'gradient', value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
  Pastel: { type: 'gradient', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  Aurora: { type: 'gradient', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  Tropical: { type: 'gradient', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  Candy: { type: 'gradient', value: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' },
};

export default function BackgroundPanel({
  customBackgrounds,
  setCustomBackgrounds,
  cardCount,
  userId,
  visible,
  toggleVisibility,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempBg, setTempBg] = useState({ type: 'color', value: '#ffffff', animate: false, speed: 8 });
  const [animateGradient, setAnimateGradient] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().customBackgrounds) {
        setCustomBackgrounds(snap.data().customBackgrounds);
      }
    };
    fetchData();
  }, [userId, setCustomBackgrounds]);

  useEffect(() => {
    const current = customBackgrounds[currentIndex];
    setTempBg({
      type: current?.type || 'color',
      value: current?.value || '#ffffff',
      animate: current?.animate || false,
      speed: current?.speed || 8,
    });
    setAnimateGradient(current?.animate || false);
  }, [currentIndex, customBackgrounds]);

  const applyBackground = () => {
    const updated = {
      ...customBackgrounds,
      [currentIndex]: {
        type: tempBg.type,
        value: tempBg.value,
        animate: animateGradient,
        speed: tempBg.speed || 8,
      },
    };
    setCustomBackgrounds(updated);
  };

  const saveToFirestore = useCallback(async (updated) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    await setDoc(ref, { customBackgrounds: updated }, { merge: true });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      saveToFirestore(customBackgrounds);
    }, 800);
    return () => clearTimeout(debounceTimeout.current);
  }, [customBackgrounds, saveToFirestore, userId]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setCustomBackgrounds(parsed);
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(customBackgrounds, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backgrounds.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRandomBackground = () => {
    const types = ['color', 'image', 'gradient'];
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === 'color') {
      const colors = ['#ff6b6b', '#48dbfb', '#feca57', '#1dd1a1', '#f368e0'];
      return { type: 'color', value: colors[Math.floor(Math.random() * colors.length)] };
    } else if (type === 'image') {
      const urls = [
        'https://i.imgur.com/space.jpg',
        'https://i.imgur.com/forest.jpg',
        'https://i.imgur.com/pixel-art.gif',
      ];
      return { type: 'image', value: urls[Math.floor(Math.random() * urls.length)] };
    } else {
      const gradients = [
        'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(270deg, #30cfd0 0%, #330867 100%)',
      ];
      return { type: 'gradient', value: gradients[Math.floor(Math.random() * gradients.length)], animate: true, speed: 8 };
    }
  };

  if (!visible) return null;

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-800 text-black dark:text-white w-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Customize Card Backgrounds</h2>
        <button onClick={toggleVisibility} className="text-sm text-gray-400 hover:text-white">✕ Close</button>
      </div>

      <label className="block text-sm font-medium mb-1">Select Card:</label>
      <select
        value={currentIndex}
        onChange={(e) => setCurrentIndex(Number(e.target.value))}
        className="w-full p-1 mb-3 rounded border dark:bg-gray-700"
      >
        {Array.from({ length: cardCount }).map((_, idx) => (
          <option key={idx} value={idx}>Card #{idx + 1}</option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">Background Type:</label>
      <select
        value={tempBg.type}
        onChange={(e) => setTempBg({ ...tempBg, type: e.target.value })}
        className="w-full p-1 mb-2 rounded border dark:bg-gray-700"
      >
        <option value="color">Color</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
        <option value="gradient">Gradient</option>
      </select>

      <label className="block text-sm font-medium mb-1">Value:</label>
      <input
        type="text"
        value={tempBg.value}
        onChange={(e) => setTempBg({ ...tempBg, value: e.target.value })}
        placeholder={tempBg.type === 'color' ? '#RRGGBB' : 'https://example.com/file'}
        className="w-full p-1 mb-3 rounded border dark:bg-gray-700"
      />

      {tempBg.type === 'gradient' && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium">Animate Gradient</label>
            <input
              type="checkbox"
              checked={animateGradient}
              onChange={() => setAnimateGradient((prev) => !prev)}
            />
          </div>
          {animateGradient && (
            <div className="mb-3">
              <label className="text-sm font-medium block mb-1">Animation Speed (seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={tempBg.speed || 8}
                onChange={(e) => setTempBg((prev) => ({ ...prev, speed: Number(e.target.value) }))}
                className="w-full p-1 rounded border dark:bg-gray-700"
              />
            </div>
          )}
          {animateGradient && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Gradient Direction:</label>
              <select
                value={tempBg.direction || 'horizontal'}
                onChange={(e) => setTempBg({ ...tempBg, direction: e.target.value })}
                className="w-full p-1 rounded border dark:bg-gray-700"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="diagonal">Diagonal</option>
              </select>
            </div>
          )}

        </>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={applyBackground} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Apply</button>
        <button
          onClick={() => {
            const updated = { ...customBackgrounds };
            delete updated[currentIndex];
            setCustomBackgrounds(updated);
          }}
          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
        >
          ResetCard
        </button>
        <button
          onClick={() => {
            if (window.confirm('Reset all backgrounds?')) setCustomBackgrounds({});
          }}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          ResetAll
        </button>
        <button
          onClick={() => setTempBg(getRandomBackground())}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          🎲 Randomize
        </button>
      </div>

      <label className="block text-sm font-medium mb-1">Theme Presets:</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(themePresets).map(([name, preset]) => (
          <button
            key={name}
            onClick={() => setTempBg({ ...preset, animate: false, speed: 8 })}
            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {name}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium mb-1">Live Preview:</label>
      <div className="h-20 w-full border rounded mb-4 relative overflow-hidden">
        {tempBg.type === 'color' && (
          <div className="w-full h-full" style={{ backgroundColor: tempBg.value }} />
        )}
        {tempBg.type === 'image' && (
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${tempBg.value})` }} />
        )}
        {tempBg.type === 'video' && (
          <video
            src={tempBg.value}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
            aria-label="Background video preview"
          />
        )}
        {tempBg.type === 'gradient' && (
          <div
            className={`w-full h-full ${animateGradient ? 'animate-gradient' : ''}`}
            style={{
              backgroundImage: tempBg.value,
              animationDuration: `${tempBg.speed || 8}s`,
            }}
          />
        )}
      </div>

      <label className="block text-sm font-medium mb-1">Upload Background Config (JSON):</label>
      <input type="file" accept="application/json" onChange={handleFileUpload} />

      <div className="mt-3">
        <button onClick={handleExport} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          Export Current Config
        </button>
      </div>
    </div>
  );
}
