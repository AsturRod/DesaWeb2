'use client';

export default function PopularityWidget({ selectedPopularity, onPopularityChange }) {
  const handleMinChange = (value) => {
    const newMin = parseInt(value);
    if (newMin <= selectedPopularity[1]) {
      onPopularityChange([newMin, selectedPopularity[1]]);
    }
  };

  const handleMaxChange = (value) => {
    const newMax = parseInt(value);
    if(newMax >= selectedPopularity[0]) {
      onPopularityChange([selectedPopularity[0], newMax]);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Popularidad</h3>

      {/* Range Display */}
      <div className="mb-4 p-3 bg-stone-800 rounded text-center">
        <p className="text-white font-semibold">
          {selectedPopularity[0]} - {selectedPopularity[1]}
        </p>
        <p className="text-xs text-gray-400 mt-1">Rango de popularidad</p>
      </div>

      {/* Min Slider */}
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">
          Mínimo: {selectedPopularity[0]}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={selectedPopularity[0]}
          onChange={(e) => handleMinChange(e.target.value)}
          className="w-full h-2 rounded appearance-none cursor-pointer accent-purple-500"
          style={{
            background: `linear-gradient(to right, #374151 0%, #374151 ${selectedPopularity[0]}%, #a855f7 ${selectedPopularity[0]}%, #a855f7 100%)`
          }}
        />
      </div>

      {/* Max Slider */}
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">
          Máximo: {selectedPopularity[1]}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={selectedPopularity[1]}
          onChange={(e) => handleMaxChange(e.target.value)}
          className="w-full h-2 rounded appearance-none cursor-pointer accent-purple-500"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${selectedPopularity[1]}%, #374151 ${selectedPopularity[1]}%, #374151 100%)`
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400 space-y-1">
        <p>📊 80-100: Hits mainstream</p>
        <p>📊 50-80: Canciones populares</p>
        <p>📊 0-50: Joyas ocultas</p>
      </div>
    </div>
  );
}