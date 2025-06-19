// components/OdometerLiveCounter.jsx
import React, { useEffect, useRef, useState } from 'react';
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

export default function OdometerLiveCounter({ value, source = 'cached', onRefresh, fontSize = 24, showDot = true, speed = 700 }) {
  const [odometerValue, setOdometerValue] = useState(value ?? 0);
  const [changeAmount, setChangeAmount] = useState(null);
  const [textColor, setTextColor] = useState('#989faf');
  
  const prevValue = useRef(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (typeof value !== 'number') return;

    if (value === prevValue.current) return; // 🛑 Prevent re-renders if same

    const diff = value - prevValue.current;
    if (diff === 0) return;

    setChangeAmount(diff);
    setTextColor(diff > 0 ? '#49e53b' : '#ff000d');

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setChangeAmount(null);
      setTextColor('#989faf');
    }, 800);

    prevValue.current = value;
    setOdometerValue(value);
  }, [value]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="relative flex flex-col items-start">
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-14px); }
        }
        @keyframes floatDown {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(14px); }
        }
        .animate-float-up { animation: floatUp 1s ease-out; }
        .animate-float-down { animation: floatDown 1s ease-out; }

        @keyframes glow {
          0% { box-shadow: 0 0 0 0 rgba(72, 255, 111, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(72, 255, 111, 0); }
          100% { box-shadow: 0 0 0 0 rgba(72, 255, 111, 0); }
        }
        .glow-dot { animation: glow 1.5s infinite ease-out; }
      `}</style>

      {/* Count change bubble */}
      {changeAmount !== null && (
        <span
          className={`absolute right-6 font-bold z-10 ${
            changeAmount > 0 ? 'animate-float-up' : 'animate-float-down'
          }`}
          style={{
            top: '-10px',
            color: changeAmount > 0 ? '#49e53b' : '#ff000d',
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '16px',
          }}
        >
          {changeAmount > 0 ? `+${changeAmount.toLocaleString()}` : `${changeAmount.toLocaleString()}`}
        </span>
      )}

      {/* Odometer and status */}
      <div className="flex items-center gap-2 font-semibold mt-0.5 ml-0.5">
        <span
          aria-live="polite"
          className="odometer text-2xl tabular-nums tracking-wider"
          style={{
            color: textColor,
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: `${fontSize}px`,
            fontWeight: 'normal',
            transition: 'color 0.7s ease',
          }}
        >
          <Odometer value={odometerValue} format="(,ddd)" duration={speed} />
        </span>

        {/* ✅ Conditionally render glow dot */}
        {showDot && (
          <span
            className={`w-2.5 h-2.5 rounded-full ml-1 ${
              source === 'live'
                ? 'bg-green-500 glow-dot'
                : source === 'cached'
                ? 'bg-yellow-400 glow-dot'
                : 'bg-red-500 glow-dot'
            }`}
            title={`Source: ${source.charAt(0).toUpperCase() + source.slice(1)}`}
          ></span>
        )}

        {/* <span className={`text-xs ml-1 font-mono px-1 py-0.5 rounded ${
            source === 'live' ? 'bg-green-600 text-white' :
            source === 'cached' ? 'bg-yellow-500 text-black' :
            'bg-red-600 text-white'
          }`}>
          {source.toUpperCase()}
        </span> */}

        {/* Manual refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-1 text-blue-300 hover:text-white text-xs"
            aria-label="Refresh Count"
            title="Refresh"
          >
            🔁
          </button>
        )}
      </div>
    </div>
  );
}
