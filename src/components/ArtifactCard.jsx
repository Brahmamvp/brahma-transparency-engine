import React from 'react';

const ArtifactCard = ({ artifact, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'sacred': return '🕊️';
      case 'shareable': return '🔁';
      default: return '🔒';
    }
  };

  const getModeIcon = (mode) => {
    return mode === 'reflective' ? '🌸' : '📷';
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/20 hover:scale-105 hover:bg-white/15"
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <img
          src={artifact.imageUrl || '/api/placeholder/300/300'}
          alt={artifact.title || 'Artifact'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Mode & Privacy Indicators */}
        <div className="absolute top-2 left-2 flex gap-1">
          <div className="bg-black/60 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-sm border border-white/20">
            {getModeIcon(artifact.mode)}
          </div>
          <div className="bg-black/60 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-sm border border-white/20">
            {getPrivacyIcon(artifact.privacy)}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
            <span className="text-sm font-medium text-white">View Reflection</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-white text-sm truncate flex-1">
            {artifact.title || 'Untitled'}
          </h3>
          <span className="text-xs text-gray-400 ml-2">
            {formatDate(artifact.createdAt)}
          </span>
        </div>

        {/* Location */}
        {artifact.location && (
          <div className="text-xs text-gray-300">
            📍 {artifact.location}
          </div>
        )}

        {/* Tags */}
        {artifact.tags && artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artifact.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-purple-500/30 text-purple-200 text-xs px-2 py-1 rounded-full border border-purple-400/30"
              >
                #{tag}
              </span>
            ))}
            {artifact.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{artifact.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Emotion Badge */}
        {artifact.emotion && (
          <div className="flex items-center gap-1">
            <span className="bg-pink-500/30 text-pink-200 text-xs px-2 py-1 rounded-full border border-pink-400/30">
              {artifact.emotion}
            </span>
          </div>
        )}

        {/* Reflection Count */}
        {artifact.reflections && artifact.reflections.length > 0 && (
          <div className="text-xs text-gray-300">
            💭 {artifact.reflections.length} reflection{artifact.reflections.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactCard;
