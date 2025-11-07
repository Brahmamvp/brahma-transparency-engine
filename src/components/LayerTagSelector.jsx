import React from 'react';

export default function LayerTagSelector({ selectedLayer, onLayerChange }) {
  const layers = [
    { id: 'surface', name: 'Surface', color: 'bg-blue-500' },
    { id: 'systemic', name: 'Systemic', color: 'bg-purple-500' },
    { id: 'legacy', name: 'Legacy', color: 'bg-pink-500' },
    { id: 'world', name: 'World', color: 'bg-green-500' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {layers.map(layer => (
        <button
          key={layer.id}
          onClick={() => onLayerChange(layer.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedLayer === layer.id
              ? `${layer.color} text-white shadow-lg`
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {layer.name}
        </button>
      ))}
    </div>
  );
}
