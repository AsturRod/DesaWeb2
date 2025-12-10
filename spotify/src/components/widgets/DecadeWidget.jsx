'use client';

import { useState } from 'react';

export default function DecadeWidget({ onDecadesChange }) {
  const decades = [
    { label: '1950s', min: 1950, max: 1959 },
    { label: '1960s', min: 1960, max: 1969 },
    { label: '1970s', min: 1970, max: 1979 },
    { label: '1980s', min: 1980, max: 1989 },
    { label: '1990s', min: 1990, max: 1999 },
    { label: '2000s', min: 2000, max: 2009 },
    { label: '2010s', min: 2010, max: 2019 },
    { label: '2020s', min: 2020, max: 2029 },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDecades, setSelectedDecades] = useState([]);

  const handleDecadeChange = (decade) => {
    let newSelected;

    if (selectedDecades.some(d => d.label === decade.label)) {
      
      newSelected = selectedDecades.filter(d => d.label !== decade.label);
    } else {
      
      newSelected = [...selectedDecades, decade];
    }

    
    newSelected.sort((a, b) => a.min - b.min);
    setSelectedDecades(newSelected);

   
    const decadesToPass = newSelected.map(d => d.min.toString());
    onDecadesChange(decadesToPass);
  };

  const handleSelectAll = () => {
    if (selectedDecades.length === decades.length) {
      
      setSelectedDecades([]);
      onDecadesChange([]);
    } else {
     
      setSelectedDecades(decades);
      const allDecades = decades.map(d => d.min.toString());
      onDecadesChange(allDecades);
    }
  };

  const handleClearSelection = () => {
    setSelectedDecades([]);
    onDecadesChange([]);
  };

  const getDecadeRange = () => {
    if (selectedDecades.length === 0) return '';
    const sorted = [...selectedDecades].sort((a, b) => a.min - b.min);
    const first = sorted[0].label;
    const last = sorted[sorted.length - 1].label;
    return first === last ? first : `${first} - ${last}`;
  };

  return (
    <div className="rounded-lg overflow-hidden ">
      {/* Header - Desplegable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/50 transition"
      >
        <div className="text-left">
          <h3 className="font-semibold text-white">⏰ Décadas</h3>
          {selectedDecades.length > 0 && (
            <p className="text-xs text-green-400 mt-1">
              {selectedDecades.length} seleccionada{selectedDecades.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <span className={`text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Contenido Desplegable */}
      {isOpen && (
        <div className="border-t border-gray-700 p-4 space-y-4 ">
          
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition transform hover:scale-105 ${
                selectedDecades.length === decades.length
                  ? 'bg-green-500 text-black'
                  : 'bg-stone-800 text-white hover:bg-gray-600'
              }`}
            >
              {selectedDecades.length === decades.length ? '✓ Todas' : 'Todas'}
            </button>
            {selectedDecades.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-700/50 text-white hover:bg-gray-600 transition transform hover:scale-105"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Decades Grid */}
          <div className="grid grid-cols-2 gap-2">
            {decades.map((decade) => {
              const isSelected = selectedDecades.some(d => d.label === decade.label);
              return (
                <button
                  key={decade.label}
                  onClick={() => handleDecadeChange(decade)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition transform ${
                    isSelected
                      ? 'bg-green-500 text-black scale-105'
                      : 'bg-stone-800 text-white hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  {decade.label}
                </button>
              );
            })}
          </div>

          {/* Info */}
          {selectedDecades.length > 0 && (
            <div className="pt-3 border-t border-gray-700 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Seleccionadas ({selectedDecades.length}/{decades.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDecades.map(decade => (
                  <button
                    key={decade.label}
                    onClick={() => handleDecadeChange(decade)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black text-xs font-semibold rounded-full transition transform hover:scale-105"
                  >
                    {decade.label}
                    <span className="ml-1 font-bold">×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          
          {selectedDecades.length > 0 && (
            <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-xs text-blue-300 text-center">
              📅 {getDecadeRange()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}