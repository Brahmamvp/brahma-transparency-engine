// src/components/SentinelAlertModal.jsx

import React from "react";
import { AlertTriangle, Shield, X, Phone, Users } from "lucide-react";

/**
 * Renders the full-screen Sentinel Alert modal when the agent detects a
 * Critical Threshold Event (Crisis, Self-Harm, or Hard-Coded Rule Violation).
 * It enforces user control and provides escalation paths.
 *
 * @param {object} props
 * @param {boolean} props.show
 * @param {function} props.onClose - Function to close the modal
 * @param {function} props.onUnpause - Function to override the Sentinel and unpause the agent
 * @param {string} props.reason - The detected reason (e.g., 'Crisis Signal', 'Hard Rule Violation')
 * @param {object} props.theme - Optional theme object for styling
 */
const SentinelAlertModal = ({ show, onClose, onUnpause, reason, theme }) => {
  if (!show) return null;

  const currentTheme = theme || {
    bg: "bg-slate-900",
    border: "border-red-600/50",
    header: "bg-red-900/40",
    text: "text-white",
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden ${currentTheme.bg} ${currentTheme.border} border-4`}
      >
        {/* Header */}
        <div className={`p-6 ${currentTheme.header} border-b ${currentTheme.border} relative`}>
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
            <h2 className={`text-2xl font-bold uppercase tracking-wider ${currentTheme.text}`}>
              Sentinel Agent Override
            </h2>
          </div>
          <p className="text-sm text-red-300 mt-2">
            **Critical Threshold Event Detected**
          </p>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1 rounded-full text-red-300 hover:bg-red-900/60 transition-colors`}
            title="Close Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/50">
            <h3 className={`font-semibold text-red-300 flex items-center gap-2 mb-2`}>
              <Shield className="w-5 h-5" />
              Agent Status: PAUSED
            </h3>
            <p className="text-red-200 text-sm">
              The Sentinel Agent has automatically paused the dialogue to ensure safety and ethical compliance.
              <br />
              **Detected Context:** **{reason}**
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Your Options (User Sovereignty)</h4>
            
            {/* Action 1: User Override */}
            <button
              onClick={onUnpause}
              className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              <Shield className="w-5 h-5" />
              Override Sentinel & Unpause Conversation
            </button>

            {/* Action 2: Crisis Signal Pipeline (Mock External Link) */}
            <a
              href="mailto:support@brahma.ai?subject=CRISIS%20SIGNAL%20ESCALATION"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-3 rounded-xl transition-all shadow-md"
            >
              <Phone className="w-5 h-5" />
              Access Crisis Signal Pipeline (Suggested Support)
            </a>

            {/* Action 3: Continue Paused */}
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 text-sm text-gray-400 hover:text-white transition-colors py-2"
            >
              <Users className="w-4 h-4" />
              Close this window, but keep the agent PAUSED.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentinelAlertModal;
