import React, { useState, useRef } from 'react';

const AddArtifactForm = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    emotion: '',
    tags: [],
    privacy: 'private',
    mode: 'casual',
    reflection: '',
    imageUrl: null,
    location: '',
    symbolicResonance: '',
    allowSageAnalysis: false
  });
  const [isDragging, setIsDragging] = useState(false);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef(null);

  const emotions = ['peaceful', 'hopeful', 'nostalgic', 'joyful', 'contemplative', 'energized', 'melancholic', 'grateful', 'anxious', 'excited'];

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    if (!formData.imageUrl) return;
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">📸</span>
              <h2 className="text-2xl font-bold text-white">Add New Artifact</h2>
            </div>
            <p className="text-gray-300 text-sm">Capture a moment worth remembering</p>
          </div>

          {!formData.imageUrl ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all mb-6 ${
                isDragging ? 'border-purple-400 bg-purple-500/20' : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <div className="text-4xl mb-3">{isDragging ? '✨' : '📁'}</div>
              <p className="text-white font-medium mb-2">{isDragging ? 'Drop your image here' : 'Drag & drop an image'}</p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
              >
                Choose File
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden relative border border-white/20">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: null }))}
                  className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors border border-white/20"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Title (optional)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give this artifact a name..."
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-200">Mode</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, mode: 'casual' }))}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                        formData.mode === 'casual'
                          ? 'bg-gray-600 text-white border-gray-500'
                          : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border-white/20'
                      }`}
                    >
                      💨 Casual
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, mode: 'reflective' }))}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                        formData.mode === 'reflective'
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border-white/20'
                      }`}
                    >
                      🌱 Reflective
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Privacy Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'private', label: 'Private', icon: '🔒' },
                      { key: 'shareable', label: 'Shareable', icon: '🔁' },
                      { key: 'sacred', label: 'Sacred Lock', icon: '🕊️' }
                    ].map(privacy => (
                      <button
                        key={privacy.key}
                        onClick={() => setFormData(prev => ({ ...prev, privacy: privacy.key }))}
                        className={`px-3 py-3 rounded-xl text-xs font-medium transition-all border text-center ${
                          formData.privacy === privacy.key
                            ? 'bg-purple-600/50 text-white border-purple-500'
                            : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border-white/20'
                        }`}
                      >
                        <div className="text-lg mb-1">{privacy.icon}</div>
                        <div>{privacy.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-4 py-3 rounded-xl font-medium transition-colors border border-white/20">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.imageUrl}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-medium transition-all"
                  >
                    Save Artifact
                  </button>
                </div>
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default AddArtifactForm;
