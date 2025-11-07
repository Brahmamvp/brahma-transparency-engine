import React, { useState, useEffect } from 'react';
import { Activity, Users, Brain, Bug, Database, Eye, Settings, Download, Trash2, Play } from 'lucide-react';

const InstrumentCluster = () => {
  const [sessionData, setSessionData] = useState({
    startTime: new Date(),
    pageViews: 0,
    moduleUsage: {
      contextEngine: 0,
      transparencyEngine: 0,
      tts: 0,
      sage: 0
    },
    emotionalTags: [],
    silhouettes: [],
    errors: [],
    memoryUsage: 0
  });

  const [activeUsers, setActiveUsers] = useState(1);
  const [dataMode, setDataMode] = useState('LOCAL-ONLY');
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        pageViews: prev.pageViews + Math.random() > 0.7 ? 1 : 0,
        moduleUsage: {
          ...prev.moduleUsage,
          contextEngine: prev.moduleUsage.contextEngine + (Math.random() > 0.8 ? 1 : 0),
          transparencyEngine: prev.moduleUsage.transparencyEngine + (Math.random() > 0.9 ? 1 : 0),
          tts: prev.moduleUsage.tts + (Math.random() > 0.85 ? 1 : 0),
          sage: prev.moduleUsage.sage + (Math.random() > 0.75 ? 1 : 0)
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calculate memory usage
  useEffect(() => {
    const calculateMemoryUsage = () => {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length;
        }
      }
      setSessionData(prev => ({ ...prev, memoryUsage: total }));
    };
    
    calculateMemoryUsage();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sessionDuration = Math.floor((new Date() - sessionData.startTime) / 1000 / 60);

  const exportAnalytics = () => {
    const analyticsData = {
      sessionStart: sessionData.startTime,
      sessionDuration: `${sessionDuration} minutes`,
      totalPageViews: sessionData.pageViews,
      moduleUsage: sessionData.moduleUsage,
      memoryUsage: formatBytes(sessionData.memoryUsage),
      emotionalTags: sessionData.emotionalTags,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brahma-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetData = () => {
    if (confirm('Reset all dashboard data? This cannot be undone.')) {
      localStorage.clear();
      setSessionData({
        startTime: new Date(),
        pageViews: 0,
        moduleUsage: {
          contextEngine: 0,
          transparencyEngine: 0,
          tts: 0,
          sage: 0
        },
        emotionalTags: [],
        silhouettes: [],
        errors: [],
        memoryUsage: 0
      });
    }
  };

  const simulateSession = () => {
    setSessionData(prev => ({
      ...prev,
      pageViews: prev.pageViews + 15,
      moduleUsage: {
        contextEngine: prev.moduleUsage.contextEngine + 8,
        transparencyEngine: prev.moduleUsage.transparencyEngine + 3,
        tts: prev.moduleUsage.tts + 5,
        sage: prev.moduleUsage.sage + 12
      },
      emotionalTags: [...prev.emotionalTags, 'curious', 'hopeful', 'contemplative'],
      silhouettes: [...prev.silhouettes, { timestamp: new Date(), type: 'reflection', content: 'Mock reflection entry' }]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light text-gray-800">Brahma Instrument Cluster</h1>
            <p className="text-gray-600 font-light">Internal monitoring & analytics</p>
          </div>
          
          {/* Privacy Status Badge */}
          <div className="flex items-center space-x-4">
            <div className="backdrop-blur-md bg-white/40 rounded-lg px-4 py-2 border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Data Mode: {dataMode}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={exportAnalytics}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={resetData}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Session Duration */}
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Session Duration</p>
              <p className="text-2xl font-light text-gray-800">{sessionDuration}m</p>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-light text-gray-800">{activeUsers}</p>
            </div>
          </div>
        </div>

        {/* Page Views */}
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <Eye className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Page Views</p>
              <p className="text-2xl font-light text-gray-800">{sessionData.pageViews}</p>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-2xl font-light text-gray-800">{formatBytes(sessionData.memoryUsage)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Usage Breakdown */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Module Usage Chart */}
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-6 flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <span>Module Engagement</span>
          </h3>
          
          <div className="space-y-4">
            {Object.entries(sessionData.moduleUsage).map(([module, count]) => {
              const maxCount = Math.max(...Object.values(sessionData.moduleUsage));
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={module} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-gray-700">{module.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-gray-600">{count} uses</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotional Telemetry */}
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-6">Emotional Signals</h3>
          
          {sessionData.emotionalTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sessionData.emotionalTags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-pink-200 to-purple-200 text-purple-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No emotional signals captured yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-800 flex items-center space-x-2">
              <Bug className="w-6 h-6 text-red-500" />
              <span>System Health & Debug</span>
            </h3>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>{showDebugPanel ? 'Hide' : 'Show'} Debug</span>
              </button>
              
              <button
                onClick={simulateSession}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Simulate Activity</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-light text-gray-800">{sessionData.errors.length}</p>
              <p className="text-sm text-gray-600">Errors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-light text-gray-800">{sessionData.silhouettes.length}</p>
              <p className="text-sm text-gray-600">Reflections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-light text-gray-800">{Object.values(sessionData.moduleUsage).reduce((a, b) => a + b, 0)}</p>
              <p className="text-sm text-gray-600">Total Actions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-light text-gray-800">{sessionDuration}</p>
              <p className="text-sm text-gray-600">Minutes Active</p>
            </div>
          </div>

          {/* Debug Panel */}
          {showDebugPanel && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">Debug Information</h4>
              
              {/* LocalStorage Dump */}
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
                <h5 className="text-green-400 font-mono text-sm mb-2">localStorage Contents:</h5>
                <pre className="text-green-300 font-mono text-xs">
                  {JSON.stringify(
                    Object.keys(localStorage).reduce((acc, key) => {
                      acc[key] = localStorage.getItem(key)?.substring(0, 100) + (localStorage.getItem(key)?.length > 100 ? '...' : '');
                      return acc;
                    }, {}), 
                    null, 
                    2
                  )}
                </pre>
              </div>

              {/* Browser Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="text-blue-800 font-medium mb-2">Browser Environment:</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">User Agent:</span>
                    <p className="text-gray-700 font-mono text-xs">{navigator.userAgent.substring(0, 60)}...</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Speech Synthesis:</span>
                    <p className="text-gray-700">{speechSynthesis ? '✅ Available' : '❌ Not Available'}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Viewport:</span>
                    <p className="text-gray-700">{window.innerWidth} × {window.innerHeight}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Connection:</span>
                    <p className="text-gray-700">{navigator.onLine ? '🟢 Online' : '🔴 Offline'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-6">Live Activity Stream</h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {/* Simulated activity entries */}
            <div className="flex items-center space-x-3 p-3 bg-white/40 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">User started Context Engine session</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white/40 rounded-lg">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-sm text-gray-700">TTS playback initiated</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date(Date.now() - 60000).toLocaleTimeString()}</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white/40 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Sage conversation started</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date(Date.now() - 120000).toLocaleTimeString()}</span>
            </div>
            
            {sessionData.emotionalTags.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Waiting for user activity...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500">
          Brahma Instrument Cluster v1.0 • Session started {sessionData.startTime.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default InstrumentCluster;