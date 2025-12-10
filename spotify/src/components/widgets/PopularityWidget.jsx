'use client';

import { useState } from 'react';

export default function PopularityWidget({ selectedPopularity, onPopularityChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMinChange = (value) => {
    const newMin = parseInt(value);
    if (newMin <= selectedPopularity[1]) {
      onPopularityChange([newMin, selectedPopularity[1]]);
    }
  };

  const handleMaxChange = (value) => {
    const newMax = parseInt(value);
    if (newMax >= selectedPopularity[0]) {
      onPopularityChange([selectedPopularity[0], newMax]);
    }
  };

  // Determinar categoría actual
  const getCategory = () => {
    const [min, max] = selectedPopularity;
    if (max >= 80) return 'Hits mainstream';
    if (max >= 50) return 'Populares';
    return 'Joyas ocultas';
  };

  return (
    <div className=" border-gray-700 rounded-lg overflow-hidden hover:border-green-500/50 transition">
      {/* Header - Desplegable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition"
      >
        <div className="text-left">
          <h3 className="font-semibold text-white">📊 Popularidad</h3>
          <p className="text-xs text-green-400 mt-1">
            {selectedPopularity[0]} - {selectedPopularity[1]}
          </p>
        </div>
        <span className={`text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Contenido Desplegable */}
      {isOpen && (
        <div className="border-t border-gray-700 p-4 space-y-4 ">
          
          <div className="p-3 bg-linear-to-r from-purple-900/30 to-purple-800/30 border border-purple-700/50 rounded-lg text-center">
            <p className="text-white font-bold text-lg">
              {selectedPopularity[0]} - {selectedPopularity[1]}
            </p>
            <p className="text-xs text-purple-300 mt-1">{getCategory()}</p>
          </div>

          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Mínimo: <span className="text-green-400 font-semibold">{selectedPopularity[0]}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedPopularity[0]}
              onChange={(e) => handleMinChange(e.target.value)}
              className="w-full h-2 rounded appearance-none cursor-pointer accent-purple-500 bg-gray-700"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${selectedPopularity[0]}%, #374151 ${selectedPopularity[0]}%, #374151 100%)`
              }}
            />
          </div>

          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Máximo: <span className="text-green-400 font-semibold">{selectedPopularity[1]}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedPopularity[1]}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="w-full h-2 rounded appearance-none cursor-pointer accent-purple-500 bg-gray-700"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${selectedPopularity[1]}%, #374151 ${selectedPopularity[1]}%, #374151 100%)`
              }}
            />
          </div>

          {/* Legenda */}
          <div className="pt-3 border-t border-gray-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">🔥 Hits mainstream</span>
              <span className="text-gray-500">80-100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">⭐ Canciones populares</span>
              <span className="text-gray-500">50-80</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">💎 Joyas ocultas</span>
              <span className="text-gray-500">0-50</span>
            </div>
          </div>

          {/* Info  */}
          <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded text-xs text-blue-300 text-center">
            Rango seleccionado: {selectedPopularity[1] - selectedPopularity[0]} puntos
          </div>
        </div>
      )}
    </div>
  );
}