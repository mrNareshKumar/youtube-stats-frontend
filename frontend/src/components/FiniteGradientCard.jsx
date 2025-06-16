import React, { useEffect, useState } from 'react';

export default function FiniteGradientCard() {
  const gradientList = [
    'linear-gradient(135deg, #ff9a9e, #fad0c4)',
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #d4fc79, #96e6a1)',
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #667eea, #764ba2)',
  ];

  const [currentGradient, setCurrentGradient] = useState(gradientList[0]);
  const [usedGradients, setUsedGradients] = useState([gradientList[0]]);

  function getNextGradient(used, all) {
    const available = all.filter((g) => !used.includes(g));
    if (available.length === 0) return all[0]; // restart from beginning
    return available[Math.floor(Math.random() * available.length)];
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getNextGradient(usedGradients, gradientList);
      setCurrentGradient(next);
      setUsedGradients((prev) => {
        const updated = [...prev, next];
        return updated.length === gradientList.length ? [next] : updated;
      });
    }, 4000); // every 4 seconds

    return () => clearInterval(interval);
  }, [usedGradients]);

  return (
    <div
      className="shadow-lg transition-all duration-1000"
      style={{
        backgroundImage: currentGradient,
        transition: 'background-image 1s ease-in-out',
      }}
    >
        {String(index + 1).padStart(2, '0')}
        {channel.countryCode && (
          <img
            src={`https://flagcdn.com/w40/${channel.countryCode.toLowerCase()}.png`}
            alt={channel.countryCode.toUpperCase()}
            className="w-10 h-6 mt-6 rounded-sm cursor-pointer"
          />
        )}
    </div>
  );
}
