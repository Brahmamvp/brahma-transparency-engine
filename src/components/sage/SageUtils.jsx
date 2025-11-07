// src/components/sage/SageUtils.jsx
import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Send, Mic, Heart, Lightbulb, Scale, Eye,
  Clock, DollarSign, Target, Compass, BookOpen, Star,
  Volume2, VolumeX, MoreHorizontal, Pin, Archive, Share2,
  Sparkles, Brain, Zap, ChevronDown, ChevronRight,
  Calendar, Map, Layers, Settings, Download, Upload,
  Trash2, Save, RotateCcw, Search, AlertTriangle, X,
  Play, Pause, RefreshCw, Copy, ExternalLink, GitBranch,
  FileText, History, Plus, Minus, Tag,
} from 'lucide-react';

// =======================================================
// Core Utility Components (Placeholder Implementations)
// These components are referenced in SageDashboard.jsx
// =======================================================

/**
 * 1. SageAvatar: Displays the avatar based on mood and state.
 */
export const SageAvatar = ({ mood = 'peaceful', isThinking = false, size = 'small' }) => {
  const sizeMap = { small: { icon: 14, container: 'w-8 h-8' }, large: { icon: 24, container: 'w-16 h-16' } };
  const iconSize = sizeMap[size].icon;
  const containerClass = sizeMap[size].container;

  let colorClass = 'text-purple-600 bg-purple-200';
  if (mood === 'peaceful') colorClass = 'text-purple-600 bg-purple-200';
  if (mood === 'alert') colorClass = 'text-red-600 bg-red-200';

  return (
    <div className={`rounded-full flex items-center justify-center ${containerClass} ${colorClass} ${isThinking ? 'animate-pulse' : ''}`}>
      <Star size={iconSize} />
    </div>
  );
};

/**
 * 2. ClearChatModal: Confirmation modal for clearing conversation.
 */
export const ClearChatModal = ({ show, onClose, onConfirm }) => (
  <div
    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
  >
    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full transform transition-transform scale-100">
      <h3 className="text-lg font-semibold mb-2">Clear Conversation</h3>
      <p className="text-gray-600 mb-6">Are you sure you want to clear the current conversation? This action cannot be undone unless you use the undo button immediately after.</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white"
        >
          <Trash2 size={16} className="inline mr-1" /> Clear
        </button>
      </div>
    </div>
  </div>
);

/**
 * 3. SaveBranchModal: Modal for saving the current state as a branch.
 */
export const SaveBranchModal = ({ show, onClose, onSave }) => {
  const [branchName, setBranchName] = useState('');
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-2">Save as Journey Branch</h3>
        <p className="text-gray-600 mb-4 text-sm">Create a save point for this decision path.</p>
        <input
          type="text"
          placeholder="Branch Name (e.g., 'Scenario A: Remote')"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(branchName)}
            disabled={!branchName.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            <Save size={16} className="inline mr-1" /> Save Branch
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. OptionCard: Displays a single decision option.
 */
export const OptionCard = ({ option, onExplore, onPin, onArchive, isExpanded, onToggleExpand, theme }) => (
  <div className={`${theme.glass} border rounded-xl p-4 shadow-sm space-y-3`}>
    <div className="flex items-start justify-between">
      <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
        <Compass size={18} className="text-purple-500" />
        {option.title}
      </h4>
      <div className="flex gap-1">
        <button onClick={() => onPin(option.id)} className={`p-1 rounded-full ${option.pinned ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Pin Option">
          <Pin size={16} />
        </button>
        <button onClick={() => onArchive(option.id)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400" title="Archive Option">
          <Archive size={16} />
        </button>
        <button onClick={() => onToggleExpand(option.id)} className="p-1 rounded-full hover:bg-gray-100 text-gray-600">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>

    <p className="text-gray-600 text-sm">{option.description}</p>
    
    {isExpanded && (
      <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
        <div className="flex justify-between text-gray-700">
            <span className="font-medium flex items-center gap-1"><DollarSign size={14} /> Cost/Benefit:</span>
            <span>{option.cost}</span>
        </div>
        <div className="flex justify-between text-gray-700">
            <span className="font-medium flex items-center gap-1"><AlertTriangle size={14} /> Risk:</span>
            <span>{option.risk}</span>
        </div>
        <button
            onClick={() => onExplore(option.id)}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 font-medium"
        >
            <Target size={16} /> Deep Explore
        </button>
      </div>
    )}
  </div>
);

/**
 * 5. InsightCard: Displays an analytical insight generated by Sage.
 */
export const InsightCard = ({ insight, theme }) => (
  <div className={`${theme.glass} border rounded-xl p-4 shadow-sm space-y-2`}>
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
      <Sparkles size={18} className="text-pink-500" />
      <span>{insight.title}</span>
      <span className="ml-auto text-xs font-normal text-gray-500">{insight.type}</span>
    </div>
    <p className="text-gray-700">{insight.content}</p>
    <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-gray-100">
      {insight.tags?.map((tag, i) => (
        <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          <Tag size={10} className="inline mr-1" />{tag}
        </span>
      ))}
    </div>
  </div>
);

/**
 * 6. PrivacyBadge: Indicates the current privacy/data sovereignty status.
 */
export const PrivacyBadge = ({ status = 'Local-First' }) => (
  <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-1 flex items-center gap-1 font-medium">
    <Eye size={12} /> {status}
  </span>
);

/**
 * 7. BranchModal: Modal for viewing and managing saved branches.
 */
export const BranchModal = ({ show, onClose, branches, onLoad, onDelete }) => (
  <div
    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
  >
    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full">
      <h3 className="text-lg font-semibold mb-4">Journey Branches ({branches.length})</h3>
      <div className="h-64 overflow-y-auto space-y-3 mb-6">
        {branches.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No branches saved yet. Save a snapshot to create one!</p>
        ) : (
          branches.map((branch, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <GitBranch size={18} className="text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{branch.name}</p>
                  <p className="text-xs text-gray-500">
                    {branch.timestamp} - {branch.summary}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onLoad(branch.id)}
                  className="px-3 py-1 text-xs rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <Play size={14} className="inline mr-1" /> Load
                </button>
                <button
                  onClick={() => onDelete(branch.id)}
                  className="px-3 py-1 text-xs rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border bg-gray-100 hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);


// =======================================================
// Exported Utility Containers (Defined by User)
// =======================================================

/**
 * 8. Section: Wrapper for grouped cards (used in Options/Insights tabs).
 */
export const Section = ({ title, icon, children }) => (
  <div className="space-y-3">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
      {icon}
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

/**
 * 9. EmptyState: Component for displaying when a section has no content.
 */
export const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center text-center py-12">
    <div className="mb-4">{icon}</div>
    <p className="text-gray-500 text-sm">{text}</p>
  </div>
);
