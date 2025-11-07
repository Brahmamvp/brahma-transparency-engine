import React, { useState } from "react";
import { Shield, CheckCircle, Lock, BookOpen, Signature, Zap, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { audit } from "../../kernel/memoryKernel.js";
// FIX: Using the clean default export
import useLLMClient from "../../hooks/useLLMClient.jsx";

const LifetimePrivacyContract = ({ onContractSigned }) => {
  const [hasRead, setHasRead] = useState(false);
  const [signature, setSignature] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState(null);
  
  // Destructure the required state and setter from the hook
  const { isLLMReady, setSystemReady } = useLLMClient();

  const handleActivate = async () => {
    if (!hasRead || !signature.trim()) { 
      setError('Please read the contract and provide your signature.'); 
      return; 
    }
    
    setError(null); 
    setIsActivating(true);
    
    try {
      // 1. Audit the final, immutable event of acceptance
      audit('contract_signed', { 
        contractVersion: '1.0.0 (Brahma v2.0)', 
        signature, 
        timestamp: new Date().toISOString() 
      });
      
      // 2. Signal the core system (LLM client) that the governance gate is passed
      setSystemReady(true);
      
      // 3. Simulate a brief activation delay for UX
      await new Promise(r => setTimeout(r, 1200));
      
      // 4. Trigger the parent component's success handler, passing LLM status
      if (onContractSigned) {
        onContractSigned({ signature, isLLMReady });
      }

    } catch (e) {
      console.error('Contract activation failed:', e);
      setError('System activation failed. Check the console for details.');
    } finally { 
      setIsActivating(false); 
    }
  };

  const Clause = ({ icon: Icon, title, description, isCritical = false }) => (
    <div className={`flex items-start gap-4 p-4 rounded-lg transition-colors border ${isCritical ? 'bg-red-900/40 border-red-700/50' : 'bg-gray-700/50 border-white/10'}`}>
      <Icon size={24} className={isCritical ? 'text-red-400 mt-0.5' : 'text-purple-400 mt-0.5'} />
      <div>
        <h4 className={`font-semibold ${isCritical ? 'text-red-300' : 'text-white'} text-md`}>{title}</h4>
        <p className="text-sm text-gray-300 mt-1">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-white/20 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-full">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-800 to-pink-800 border-b border-white/20">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white"><Shield size={32} />Lifetime Privacy Contract</h1>
          <p className="text-gray-200 mt-1">Activating Brahma requires your explicit consent to the <b>User Sovereignty</b> model.</p>
        </div>

        {/* Contract Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen size={20} className='text-yellow-400'/> Core Principles</h2>
          
          <Clause icon={Lock} title="Local-First Data Ownership" description="All memory and context are stored locally by default." />
          <Clause icon={CheckCircle} title="Immutable Audit Trail Right" description="Every agent action is logged and exportable." />
          <Clause icon={XCircle} title="Irrevocable Redaction Right" description="You can permanently purge sensitive local data." />
          <Clause 
            icon={Zap} 
            title="Sentinel Governance Acceptance" 
            description="You acknowledge the Sentinel override for crisis protection." 
            isCritical 
          />
          
          {/* Read Confirmation */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <input 
              type="checkbox" 
              id="has-read" 
              checked={hasRead} 
              onChange={(e) => setHasRead(e.target.checked)} 
              className="w-5 h-5 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500" 
            />
            <label htmlFor="has-read" className="text-sm font-medium text-gray-200 cursor-pointer">I have read and understand this contract.</label>
          </div>
        </div>

        {/* Footer (Signature and Activation) */}
        <div className="p-6 border-t border-white/10 bg-gray-900/90 space-y-3">
          <label className="block text-sm font-medium text-gray-200 flex items-center gap-2"><Signature size={16} className='text-pink-400'/> Signature:</label>
          <input 
            type="text" 
            value={signature} 
            onChange={(e) => setSignature(e.target.value)} 
            placeholder="Type your name to confirm" 
            disabled={!hasRead || isActivating} 
            className="w-full bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-purple-500 disabled:opacity-50" 
          />
          
          {error && (
            <div className="text-sm text-red-400 bg-red-900/50 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16}/> {error}
            </div>
          )}
          
          <button 
            onClick={handleActivate} 
            disabled={!hasRead || !signature.trim() || isActivating} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-6 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
          >
            {isActivating ? (
              <><RefreshCw size={18} className='animate-spin'/> Activating System…</>
            ) : (
              <><Zap size={18}/> Finalize Contract & Activate Brahma</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifetimePrivacyContract;

