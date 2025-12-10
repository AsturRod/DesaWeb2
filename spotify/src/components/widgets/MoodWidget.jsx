'use client';

import { useState } from 'react';

const MOODS = {
  happy: {
    name: '😊 Feliz',
    valence: [0.6, 1.0],
    energy: [0.5, 1.0],
    danceability: [0.5, 1.0]
  },
  sad: {
    name: '😢 Triste',
    valence: [0.0, 0.4],
    energy: [0.0, 0.5],
    danceability: [0.0, 0.6]
  },
  energetic: {
    name: '⚡ Energético',
    valence: [0.4, 1.0],
    energy: [0.7, 1.0],
    danceability: [0.6, 1.0]
  },
  calm: {
    name: '🧘 Tranquilo',
    valence: [0.3, 0.7],
    energy: [0.0, 0.4],
    danceability: [0.0, 0.5]
  }
};

export default function MoodWidget({ selectedMood = null, onMoodChange }) {
  const [customMode, setCustomMode] = useState(false);
  const [energy, setEnergy] = useState(50);
  const [valence, setValence] = useState(50);
  const [danceability, setDanceability] = useState(50);
  const [acousticness, setAcousticness] = useState(50);

  const handleMoodClick = (moodKey) => {
    setCustomMode(false);
    const mood = MOODS[moodKey];
    onMoodChange({
      mood: moodKey,
      energy: mood.energy,
      valence: mood.valence,
      danceability: mood.danceability,
      acousticness: [0.0, 1.0]
    });
  };

  const handleCustomMode = () => {
    setCustomMode(!customMode);
    if (!customMode) {
      onMoodChange({
        mood: 'custom',
        energy: [energy / 100, energy / 100],
        valence: [valence / 100, valence / 100],
        danceability: [danceability / 100, danceability / 100],
        acousticness: [acousticness / 100, acousticness / 100]
      });
    }
  };

  const handleSliderChange = (setter, value) => {
    setter(value);
    onMoodChange({
      mood: 'custom',
      energy: [energy / 100, energy / 100],
      valence: [valence / 100, valence / 100],
      danceability: [danceability / 100, danceability / 100],
      acousticness: [acousticness / 100, acousticness / 100]
    });
  };

  return (
    <div className=" p-4">
      <h3 className="text-lg font-semibold mb-4">🎵 Mood</h3>

      {/* Mood Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(MOODS).map(([key, mood]) => (
          <button
            key={key}
            onClick={() => handleMoodClick(key)}
            className={`px-3 py-2 rounded text-sm font-medium transition ${
              selectedMood?.mood === key && !customMode
                ? 'bg-green-600 text-white'
                : 'bg-stone-800 text-gray-200 hover:bg-gray-600'
            }`}
          >
            {mood.name}
          </button>
        ))}
      </div>

      {/* Custom Mode Toggle */}
      <button
        onClick={handleCustomMode}
        className={`w-full px-3 py-2 rounded text-sm font-medium transition mb-4 ${
          customMode
            ? 'bg-blue-600 text-white'
            : 'bg-stone-800 text-gray-200 hover:bg-gray-600'
        }`}
      >
        {customMode ? '✓ Modo Personalizado' : '⚙️ Personalizar'}
      </button>

      {/* Sliders de Mood */}
      {customMode && (
        <div className="space-y-4 bg-stone-800 p-3 rounded">
          {/* Energy */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              ⚡ Energía: {energy}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={energy}
              onChange={(e) => handleSliderChange(setEnergy, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Valence (Positivity) */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              😊 Positividad: {valence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={valence}
              onChange={(e) => handleSliderChange(setValence, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Danceability */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              💃 Bailable: {danceability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={danceability}
              onChange={(e) => handleSliderChange(setDanceability, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Acousticness */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              🎸 Acústica: {acousticness}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={acousticness}
              onChange={(e) => handleSliderChange(setAcousticness, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {selectedMood && !customMode && (
        <p className="text-xs text-gray-400 mt-3">
          Mood: <span className="text-green-400 font-semibold">{MOODS[selectedMood.mood]?.name}</span>
        </p>
      )}
    </div>
  );
}