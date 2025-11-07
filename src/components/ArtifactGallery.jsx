import React, { useState, useEffect, useRef } from 'react';

// Import the sub-components
import ArtifactCard from './ArtifactCard';
import AddArtifactForm from './AddArtifactForm';

const ArtifactGallery = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('brahma-artifacts');
    if (saved) {
      try {
        setArtifacts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load artifacts:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (artifacts.length > 0) {
      localStorage.setItem('brahma-artifacts', JSON.stringify(artifacts));
    }
  }, [artifacts]);

  const addArtifact = (newArtifact) => {
    const artifact = {
      ...newArtifact,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      reflections: newArtifact.reflection ? [{
        id: Date.now(),
        text: newArtifact.reflection,
        timestamp: new Date().toISOString(),
        type: 'initial'
      }] : []
    };
    setArtifacts(prev => [artifact, ...prev]);
    setShowAddForm(false);
  };

  const filteredArtifacts = artifacts.filter(artifact => {
    if (filterMode === 'all') return true;
    if (filterMode === 'casual') return artifact.mode === 'casual';
    if (filterMode === 'reflective') return artifact.mode === 'reflective';
    if (filterMode === 'private') return artifact.privacy === 'private';
    if (filterMode === 'sacred') return artifact.privacy === 'sacred';
    return true;
  }).filter(artifact => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      artifact.title?.toLowerCase().includes(query) ||
      artifact.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      artifact.emotion?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">🖼️</span>
          <h2 className="text-2xl font-light text-white">Artifact Gallery</h2>
        </div>
        <p className="text-gray-300 font-light">Sacred space for meaningful moments and deep reflection</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center gap-3"
        >
          <span className="text-xl">📸</span>
          <span>Add New Artifact</span>
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tag, or emotion..."
              className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-3 pl-10 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', icon: '', count: artifacts.length },
              { key: 'casual', label: 'Casual', icon: '📷', count: artifacts.filter(a => a.mode === 'casual').length },
              { key: 'reflective', label: 'Reflective', icon: '🌸', count: artifacts.filter(a => a.mode === 'reflective').length },
              { key: 'private', label: 'Private', icon: '🔒', count: artifacts.filter(a => a.privacy === 'private').length },
              { key: 'sacred', label: 'Sacred', icon: '🕊️', count: artifacts.filter(a => a.privacy === 'sacred').length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterMode(filter.key)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  filterMode === filter.key
                    ? 'bg-purple-600/50 text-white'
                    : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                }`}
              >
                {filter.icon} {filter.label}
                {filter.count > 0 && (
                  <span className="bg-white/20 rounded-full px-2 py-1 text-xs ml-1">{filter.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredArtifacts.map(artifact => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            onClick={() => setSelectedArtifact(artifact)}
          />
        ))}
        
        {filteredArtifacts.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="text-xl font-light text-gray-300 mb-2">
              {searchQuery || filterMode !== 'all' 
                ? 'No artifacts match your filters'
                : 'Your gallery awaits its first story'
              }
            </h3>
            <p className="text-gray-400 text-sm font-light">
              {!searchQuery && filterMode === 'all' && 'Every meaningful moment deserves a place to live'}
            </p>
          </div>
        )}
      </div>

      {showAddForm && (
        <AddArtifactForm
          onAdd={addArtifact}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default ArtifactGallery;
