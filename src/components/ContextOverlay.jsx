// src/components/ContextOverlay.jsx
import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  MapPin, 
  Settings, 
  DollarSign, 
  Heart, 
  RefreshCw, 
  X, 
  Eye,
  MessageCircle,
  Volume2,
  Download, // NEW: For export actions
  Shield // NEW: For audit trail
} from "lucide-react";
import { useLocalMemory } from "../context/LocalMemoryContext"; 
import { useSageVoice } from "../hooks/useSageVoice.jsx";
import { useSageChatContext } from "../context/SageChatContext";
import ContextEditorModal from "./ContextEditorModal.jsx";

const ContextOverlay = ({ isOpen, onClose }) => {
  // Destructure the necessary context and actions
  const { localContext, updateLocalContext, queryAmbientData, getAuditTrail, getManifest } = useLocalMemory();
  const { speak: speakText } = useSageVoice(); 
  const { sendMessageToSage } = useSageChatContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false); 

  if (!isOpen) return null;

  const handleOpenEditor = () => setIsEditorOpen(true);
  const handleCloseEditor = () => setIsEditorOpen(false);

  const userContext = localContext || {
    userLocation: {
        zipCodePrefix: "N/A",
        neighborhoodTag: "Context Unspecified",
        transitDependency: false,
    },
    logisticalFriction: ["No data recorded"],
    culturalContext: ["No data recorded"],
    economicCeiling: [],
    identitySignals: ["No data recorded"],
    currentEmotionalTone: "Uncertain",
    lastTopic: "None"
  };

  /**
   * SOVEREIGNTY HELPER: Reusable function to trigger file download.
   * (Matches logic from the Brahma Code 2 blueprint for immutability)
   */
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * SOVEREIGNTY ACTION: Exports the full, immutable Audit Trail.
   */
  const handleExportAudit = () => {
    const audit = getAuditTrail();
    downloadFile(JSON.stringify(audit, null, 2), `brahma-audit-${Date.now()}.json`, "application/json");
  };

  /**
   * SOVEREIGNTY ACTION: Exports the current Manifest (localContext + memory pointers).
   */
  const handleExportManifest = () => {
    const manifest = getManifest();
    downloadFile(JSON.stringify(manifest, null, 2), "brahma-manifest.json", "application/json");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshedData = await queryAmbientData();
      updateLocalContext(refreshedData);
    } catch (error) {
      console.error("Error refreshing ambient context:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSpeakSummary = () => {
    const summary = `
      Here's your ambient awareness summary. 
      Emotionally, you're currently feeling: ${userContext.currentEmotionalTone}. 
      The last topic you focused on was: ${userContext.lastTopic}.
      Your neighborhood tag is: ${userContext.userLocation.neighborhoodTag}, and your ZIP code prefix is ${userContext.userLocation.zipCodePrefix}.
      You have ${userContext.logisticalFriction?.length || 0} logistical barriers, 
      and transit dependency is marked as ${userContext.userLocation.transitDependency ? "high" : "low"}.
      ${userContext.culturalContext?.length || 0} cultural signals were detected, and your economic ceiling includes ${userContext.economicCeiling?.length || 0} events.
    `;
    speakText(summary);
  };

  const handleAskWhatIveLearned = () => {
    sendMessageToSage("What have I learned recently?");
    onClose(); // Optional: Close panel after triggering message
  };

  const ContextSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-xl space-y-3">
      <h3 className="flex items-center gap-2 text-md font-semibold text-purple-400">
        <Icon size={18} className="text-purple-300" />
        {title}
      </h3>
      <div className="text-sm text-gray-200">{children}</div>
    </div>
  );

  const ContextListItem = ({ label, value, colorClass = 'text-white' }) => (
    <div className="flex justify-between items-start border-b border-white/5 py-2 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-gray-400 font-medium">{label}:</span>
      <span className={`text-right ${colorClass} max-w-[60%]`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end transition-opacity duration-300">
      <div className="h-full w-full md:w-1/2 lg:w-1/3 bg-gray-900 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header (Sticky Top) */}
        <div className="shrink-0 p-6 border-b border-white/10 bg-gray-900/90 backdrop-blur-sm z-10">
          <div className="flex justify-between items-center">
            <h2 className="flex items-center text-xl font-bold text-white">
              <BrainCircuit size={24} className="mr-3 text-purple-500" />
              Ambient Awareness Summary
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-gray-400 hover:bg-white/10 transition-colors"
              title="Close Panel"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            This is what Sage 'sees' about your lived reality.
          </p>
        </div>

        {/* Content Sections (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <ContextSection title="Emotional & Identity Layer" icon={Heart}>
            <ContextListItem 
              label="Current Emotional Tone" 
              value={userContext.currentEmotionalTone || "Uncertain"}
              colorClass={userContext.currentEmotionalTone === "Drained" ? 'text-red-300' : 'text-emerald-300'}
            />
            <ContextListItem 
              label="Recent Topic" 
              value={userContext.lastTopic || "None"} 
              colorClass="text-yellow-300"
            />
            <ContextListItem 
              label="Identity Signals Tracked" 
              value={
                Array.isArray(userContext.identitySignals) && userContext.identitySignals.length > 0 
                  ? userContext.identitySignals.join(", ") 
                  : "Likely no strong, confirmed signals"
              } 
            />
          </ContextSection>

          <ContextSection title="Geographic & Logistical Layer" icon={MapPin}>
            <ContextListItem label="Neighborhood Tag" value={userContext.userLocation.neighborhoodTag} />
            <ContextListItem label="ZIP Code Prefix" value={userContext.userLocation.zipCodePrefix} />
            <ContextListItem 
              label="Logistical Friction Points" 
              value={
                Array.isArray(userContext.logisticalFriction) && userContext.logisticalFriction.length > 0
                  ? `${userContext.logisticalFriction.length} barriers`
                  : '0 (Low)'
              }
              colorClass={userContext.logisticalFriction?.length > 1 ? 'text-red-400' : 'text-emerald-400'}
            />
            <ContextListItem 
              label="Transit Dependency" 
              value={userContext.userLocation.transitDependency ? 'High (Car not assumed)' : 'Low/Flexible'} 
              colorClass={userContext.userLocation.transitDependency ? 'text-yellow-400' : 'text-gray-400'}
            />
          </ContextSection>

          <ContextSection title="Cultural & Economic Layer" icon={DollarSign}>
            <ContextListItem 
              label="Cultural Specificity Tags" 
              value={
                Array.isArray(userContext.culturalContext) && userContext.culturalContext.length > 0
                  ? `${userContext.culturalContext.length} nuances detected`
                  : 'None detected'
              }
            />
            <ContextListItem 
              label="Economic Ceiling Events" 
              value={
                Array.isArray(userContext.economicCeiling) && userContext.economicCeiling.length > 0
                  ? `${userContext.economicCeiling.length} tracked`
                  : '0 (Untracked)'
              }
              colorClass={userContext.economicCeiling?.length > 0 ? 'text-orange-400' : 'text-gray-400'}
            />
          </ContextSection>

          <ContextSection title="Raw Context Object" icon={Eye}>
            <pre className="text-xs bg-black/20 p-3 rounded-lg overflow-x-auto border border-white/5">
              {JSON.stringify(userContext, null, 2)}
            </pre>
          </ContextSection>
        </div>

        {/* Footer (Sticky Bottom) */}
        <div className="shrink-0 p-6 border-t border-white/10 bg-gray-900/90 backdrop-blur-sm space-y-3">
          {/* Action Row 1: Editing and Refreshing */}
          <div className="flex gap-3">
            <button
              onClick={handleOpenEditor}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <Settings size={16} />
              Edit Context
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isRefreshing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {/* Action Row 2: Voice and Inquiry */}
          <div className="flex gap-3">
            <button
              onClick={handleSpeakSummary}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Volume2 size={16} />
              Narrate Summary
            </button>

            <button
              onClick={handleAskWhatIveLearned}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <MessageCircle size={16} />
              What have I learned?
            </button>
          </div>
          
          {/* Action Row 3: SOVEREIGNTY (New Exports) */}
          <div className="flex gap-3 pt-3 border-t border-white/10">
            <button
              onClick={handleExportAudit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-red-800/50 hover:bg-red-800/70 text-red-300 transition-colors border border-red-800"
              title="Export the immutable, chronological log of all agent actions."
            >
              <Shield size={16} />
              Export Audit Trail
            </button>
            <button
              onClick={handleExportManifest}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-800/50 hover:bg-indigo-800/70 text-indigo-300 transition-colors border border-indigo-800"
              title="Export the current snapshot of your core context and memory structure."
            >
              <Download size={16} />
              Export Manifest
            </button>
          </div>
        </div>
      </div>

      <ContextEditorModal 
        isOpen={isEditorOpen} 
        onClose={handleCloseEditor} 
        currentContext={userContext} 
        updateContext={updateLocalContext} 
      />
    </div>
  );
};

export default ContextOverlay;
