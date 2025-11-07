import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, Heart } from 'lucide-react';

const LiveSessionGauge = ({ userId = 'user-001' }) => {
  const [metrics, setMetrics] = useState({
    sessionDuration: 0,
    actionsPerMinute: 0,
    engagementScore: 85,
    emotionalState: 'curious'
  });

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        sessionDuration: prev.sessionDuration + 1,
        actionsPerMinute: Math.max(0, prev.actionsPerMinute + (Math.random() - 0.5) * 2),
        engagementScore: Math.max(0, Math.min(100, prev.engagementScore + (Math.random() - 0.5) * 10)),
        emotionalState: ['curious', 'contemplative', 'hopeful', 'focused', 'reflective'][Math.floor(Math.random() * 5)]
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEmotionalStateColor = (state) => {
    const colors = {
      curious: 'text-purple-600 bg-purple-100',
      contemplative: 'text-blue-600 bg-blue-100',
      hopeful: 'text-green-600 bg-green-100',
      focused: 'text-orange-600 bg-orange-100',
      reflective: 'text-pink-600 bg-pink-100'
    };
    return colors[state] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-gray-800 flex items-center space-x-2">
          <Activity className="w-6 h-6 text-green-500" />
          <span>Live Session</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-white/40 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
            {userId.charAt(userId.length - 1)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{userId}</p>
            <p className="text-sm text-gray-600">Active session</p>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Session Duration */}
        <div className="text-center p-4 bg-white/20 rounded-lg">
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-light text-gray-800">{formatDuration(metrics.sessionDuration)}</p>
          <p className="text-sm text-gray-600">Duration</p>
        </div>

        {/* Actions Per Minute */}
        <div className="text-center p-4 bg-white/20 rounded-lg">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-light text-gray-800">{metrics.actionsPerMinute.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Actions/min</p>
        </div>

        {/* Engagement Score */}
        <div className="text-center p-4 bg-white/20 rounded-lg">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeDasharray={`${metrics.engagementScore}, 100`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-800">{Math.round(metrics.engagementScore)}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Engagement</p>
        </div>

        {/* Emotional State */}
        <div className="text-center p-4 bg-white/20 rounded-lg">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className={`text-lg font-medium px-3 py-1 rounded-full ${getEmotionalStateColor(metrics.emotionalState)}`}>
            {metrics.emotionalState}
          </p>
          <p className="text-sm text-gray-600 mt-1">Current State</p>
        </div>
      </div>

      {/* Engagement Trend */}
      <div className="mt-6 p-4 bg-white/20 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Trend (Last Hour)</h4>
        <div className="flex items-end space-x-1 h-16">
          {Array.from({ length: 12 }, (_, i) => {
            const height = Math.random() * 60 + 20;
            return (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-sm transition-all duration-500"
                style={{ height: `${height}%` }}
                title={`${Math.round(height)}% engagement`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1h ago</span>
          <span>30m ago</span>
          <span>now</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-center space-x-3">
          <button
            onClick={refreshCloud}
            className="text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-all"
          >
            Refresh Metrics
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`text-sm px-3 py-2 rounded-lg transition-all ${
              isLive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isLive ? 'Pause Live' : 'Resume Live'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionGauge;