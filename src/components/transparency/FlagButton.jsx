import React, { useState } from 'react';
import { useWisdomMemory } from '../../hooks/useWisdomMemory'; // Corrected import path
import governanceConfig from '../../config/governance.json'; // Assumes path: ../../config/governance.json

const FlagButton = ({ decisionId, userContext, onFlagged }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState('');
  const [customReason, setCustomReason] = useState('');
  
  // Simulated logging utility (to be wired to WisdomMemory)
  const logFlagEvent = useWisdomMemory(); 

  const handleFlagSubmit = () => {
    if (!selectedFlag) return;

    // 1. Log the event to the #governance audit trail
    const flagPayload = {
      decisionId,
      userContext, // Full context map at time of decision
      reason: selectedFlag === 'Other' ? customReason : selectedFlag,
      timestamp: new Date().toISOString(),
      tags: ['#governance', '#audit', governanceConfig.version],
    };

    // Replace with actual WisdomMemory/Logging call
    logFlagEvent.log(flagPayload); 
    
    // 2. Trigger parent component action (e.g., Decision Explorer update)
    if (onFlagged) {
      onFlagged(flagPayload);
    }

    // 3. Close and reset
    setIsModalOpen(false);
    setSelectedFlag('');
    setCustomReason('');
    // Placeholder alert, replace with a proper toast notification
    alert(`Decision ${decisionId} flagged under #governance. Thank you for your oversight.`);
  };

  return (
    <>
      <button 
        className="flag-button button-minimal"
        onClick={() => setIsModalOpen(true)}
      >
        🚩 Flag This Decision
      </button>

      {/* Simplified Modal Structure */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Flag Decision: {decisionId}</h3>
            <p>Why do you need to flag this decision? (Logs to Audit Trail)</p>
            
            {governanceConfig.default_flags.map((flag) => (
              <label key={flag.type}>
                <input
                  type="radio"
                  name="flagReason"
                  value={flag.type}
                  checked={selectedFlag === flag.type}
                  onChange={() => { setSelectedFlag(flag.type); setCustomReason(''); }}
                />
                {flag.description}
              </label>
            ))}

            <label>
                <input
                  type="radio"
                  name="flagReason"
                  value="Other"
                  checked={selectedFlag === 'Other'}
                  onChange={() => setSelectedFlag('Other')}
                />
                Other (Specify below)
            </label>

            {selectedFlag === 'Other' && (
              <textarea
                placeholder="Enter custom reason for flagging..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <button onClick={handleFlagSubmit} disabled={!selectedFlag || (selectedFlag === 'Other' && !customReason)}>
              Submit Flag
            </button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FlagButton;