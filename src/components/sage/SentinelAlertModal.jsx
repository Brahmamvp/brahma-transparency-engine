import React from 'react';
import { Shield, AlertTriangle, X, Target, Zap, PhoneCall, Globe } from 'lucide-react';

const SENTINEL_RESOURCES = [
  { 
    id: 1, 
    type: 'Critical',
    title: 'Crisis Text Line', 
    description: 'Text HOME to 741741 from anywhere in the US, anytime, about any type of crisis.',
    action: 'Text Now',
    link: 'sms:741741',
    icon: PhoneCall
  },
  { 
    id: 2, 
    type: 'Critical',
    title: '988 Suicide & Crisis Lifeline', 
    description: 'Call or text 988 to connect with trained crisis counselors.',
    action: 'Call 988',
    link: 'tel:988',
    icon: PhoneCall 
  },
  { 
    id: 3, 
    type: 'Safety',
    title: 'Financial Planning Resources', 
    description: 'Connect with a vetted, non-AI financial resource provider (local-first list).',
    action: 'View List',
    link: '#', // Placeholder for local link
    icon: DollarSign
  },
  { 
    id: 4, 
    type: 'Safety',
    title: 'Medical Consultation Disclaimer', 
    description: 'Access the official Brahma medical disclaimer and recommended health services.',
    action: 'Read Policy',
    link: '#', // Placeholder for policy link
    icon: Shield 
  },
];

// --- Helper: Map reason to resource type for display focus ---
const getResourceType = (reason) => {
    const r = reason.toLowerCase();
    if (r.includes("crisis") || r.includes("self-harm") || r.includes("distress")) return "Critical";
    if (r.includes("financial")) return "Financial";
    if (r.includes("medical")) return "Medical";
    return "Cognitive";
}

/**
 * SentinelAlertModal Component
 * Renders a full-screen, un-dismissable modal when the Sentinel Agent pauses the dialogue.
 */
const SentinelAlertModal = ({ 
    show, 
    reason, 
    onUnpauseAgent, 
    onCloseModal, // Passed down from SageChat to explicitly close the modal 
}) => {
    if (!show) return null;

    const resourceType = getResourceType(reason);
    
    // Filter resources to highlight the most relevant ones based on the reason
    const criticalResources = SENTINEL_RESOURCES.filter(r => r.type === 'Critical');
    
    // Find the one resource most directly matching the specific violation (e.g., Financial, Medical)
    const specificResource = SENTINEL_RESOURCES.find(r => r.type.toLowerCase().includes(resourceType.toLowerCase()) && r.type !== 'Critical');
    
    // Combine resources for display, prioritizing critical and specific ones
    const displayedResources = Array.from(new Set([
        ...criticalResources, 
        ...(specificResource ? [specificResource] : [])
    ]));


    return (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-red-500/50 max-w-2xl w-full shadow-2xl p-6 md:p-8 space-y-6 animate-fadeIn">
                
                {/* Header */}
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <Shield className="w-6 h-6 text-red-500"/> 
                        Sentinel Agent Alert
                    </h2>
                    <p className="text-red-300">Dialogue Paused Due to High-Risk Pattern</p>
                </div>

                {/* Reason Block */}
                <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg shadow-inner">
                    <p className="text-sm font-semibold text-red-200 uppercase tracking-wider">Detection Reason:</p>
                    <p className="text-lg text-white mt-1 font-mono">"{reason}"</p>
                </div>

                {/* Immediate Action / Resources */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Immediate Support & Resources</h3>
                    {displayedResources.map((resource) => (
                        <a 
                            key={resource.id} 
                            href={resource.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-lg transition duration-200 border border-transparent hover:border-red-500/50"
                        >
                            <div className="flex items-center gap-3">
                                <resource.icon className={`w-5 h-5 ${resource.type === 'Critical' ? 'text-yellow-400' : 'text-purple-400'} shrink-0`} />
                                <div>
                                    <p className="text-sm font-medium text-white">{resource.title}</p>
                                    <p className="text-xs text-gray-400">{resource.description}</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-red-400 hover:text-red-300 ml-4">{resource.action} &rarr;</span>
                        </a>
                    ))}
                </div>

                {/* Override Action */}
                <div className="pt-4 border-t border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400"/>
                        User Control Override
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">If you have received the support you need, or if this alert was a mistake, you can manually unpause the agent dialogue.</p>
                    
                    <button
                        onClick={() => {
                            // On unpause, also explicitly close the modal via the handler
                            onUnpauseAgent(); 
                            onCloseModal();
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg shadow-green-700/30"
                    >
                        <Zap className="w-5 h-5"/>
                        Unpause Dialogue & Acknowledge Risk
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">The system will remain paused until you use this button.</p>
                </div>
            </div>
        </div>
    );
};

export default SentinelAlertModal;

// Note: The `DollarSign` icon from `lucide-react` is used but needs to be imported:
// import { DollarSign } from 'lucide-react';
// The implementation assumes all necessary Lucide icons are imported correctly at the top.
