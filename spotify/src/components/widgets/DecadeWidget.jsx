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

  const [selectedDecades, setSelectedDecades] = useState([]);

  const handleDecadeChange = (decade) => {
    let newSelected;

    if (selectedDecades.some(d => d.label === decade.label)) {
      // Deseleccionar si ya está seleccionado
      newSelected = selectedDecades.filter(d => d.label !== decade.label);
    } else {
      // Seleccionar si no está
      newSelected = [...selectedDecades, decade];
    }

    // Ordenar por año
    newSelected.sort((a, b) => a.min - b.min);
    setSelectedDecades(newSelected);

    // Convertir a formato que espera spotify.js: ['1950', '1960', ...]
    const decadesToPass = newSelected.map(d => d.min.toString());
    onDecadesChange(decadesToPass);
  };

  const handleSelectAll = () => {
    if (selectedDecades.length === decades.length) {
      // Deseleccionar todos
      setSelectedDecades([]);
      onDecadesChange([]);
    } else {
      // Seleccionar todos
      setSelectedDecades(decades);
      const allDecades = decades.map(d => d.min.toString());
      onDecadesChange(allDecades);
    }
  };

  const handleClearSelection = () => {
    setSelectedDecades([]);
    onDecadesChange([]);
  };

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <h3 className="text-base font-semibold text-white dark:text-white tracking-tight">
           Decadas
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            title={selectedDecades.length === decades.length ? 'Deselect all' : 'Select all'}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-green-500 transition-all"
          >
            {selectedDecades.length === decades.length ? '✓ All' : 'All'}
          </button>
          {selectedDecades.length > 0 && (
            <button
              onClick={handleClearSelection}
              title="Clear selection"
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-red-500 transition-all"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Decades Grid */}
      <div className="grid grid-cols-2 gap-3">
        {decades.map((decade) => {
          const isSelected = selectedDecades.some(d => d.label === decade.label);
          return (
            <label
              key={decade.label}
              className={`flex items-center gap-2 p-2.5 rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-green-500 text-white border-green-600 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-green-500'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleDecadeChange(decade)}
                className="w-4 h-4 cursor-pointer accent-green-500"
              />
              <span className="text-sm font-medium">{decade.label}</span>
            </label>
          );
        })}
      </div>

      {/* Selected Info */}
      {selectedDecades.length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border-l-3 border-green-500 rounded-sm">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {selectedDecades.length} decade{selectedDecades.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDecades.map(decade => (
              <span
                key={decade.label}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full"
              >
                {decade.label}
                <button
                  onClick={() => handleDecadeChange(decade)}
                  aria-label={`Remove ${decade.label}`}
                  className="ml-1 hover:opacity-70 transition-opacity font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}