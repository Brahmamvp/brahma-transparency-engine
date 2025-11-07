import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

const UsageGraph = ({ data, title = "Feature Usage Over Time" }) => {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line'

  // Generate sample data if none provided
  const sampleData = data || [
    { time: '00:00', contextEngine: 4, transparencyEngine: 2, tts: 1, sage: 6 },
    { time: '00:15', contextEngine: 6, transparencyEngine: 1, tts: 3, sage: 8 },
    { time: '00:30', contextEngine: 8, transparencyEngine: 3, tts: 2, sage: 10 },
    { time: '00:45', contextEngine: 5, transparencyEngine: 4, tts: 5, sage: 7 },
    { time: '01:00', contextEngine: 9, transparencyEngine: 2, tts: 4, sage: 12 },
    { time: '01:15', contextEngine: 7, transparencyEngine: 5, tts: 3, sage: 9 },
  ];

  const colors = {
    contextEngine: '#8B5CF6',
    transparencyEngine: '#EC4899', 
    tts: '#10B981',
    sage: '#F59E0B'
  };

  return (
    <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-gray-800 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <span>{title}</span>
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'bar' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-all ${
              chartType === 'line' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: 'none', 
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)'
                }} 
              />
              <Bar dataKey="contextEngine" fill={colors.contextEngine} name="Context Engine" />
              <Bar dataKey="transparencyEngine" fill={colors.transparencyEngine} name="Transparency Engine" />
              <Bar dataKey="tts" fill={colors.tts} name="Text-to-Speech" />
              <Bar dataKey="sage" fill={colors.sage} name="Sage Conversations" />
            </BarChart>
          ) : (
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  border: 'none', 
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)'
                }} 
              />
              <Line type="monotone" dataKey="contextEngine" stroke={colors.contextEngine} name="Context Engine" strokeWidth={2} />
              <Line type="monotone" dataKey="transparencyEngine" stroke={colors.transparencyEngine} name="Transparency Engine" strokeWidth={2} />
              <Line type="monotone" dataKey="tts" stroke={colors.tts} name="Text-to-Speech" strokeWidth={2} />
              <Line type="monotone" dataKey="sage" stroke={colors.sage} name="Sage Conversations" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {Object.entries(colors).map(([key, color]) => (
          <div key={key} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageGraph;