// src/components/transparency/sageMemorySystem.jsx
// Proxy re-export: Allows clean imports from transparency/ without fragile ../../Lib paths.
// Real engine: src/Lib/sageMemoryEngine.js

// Re-export all named API exactly as-is (no star import needed)
export {
  recordSageStance,
  updateOutcome,
  queryMemoriesByTopic,
  extractTopicTag,
  inferFailureReason,
  checkForSelfRevision,
  makeRevisionPreamble,
  exportWisdomMemories,
  importWisdomMemories,
  debugGetAll
} from "../../Lib/sageMemoryEngine.js";

// Synthetic default: Namespace object for backward compatibility
// (e.g., import SageEngine from './sageMemorySystem.jsx'; SageEngine.recordSageStance(...))
const SageMemoryEngine = {
  recordSageStance,
  updateOutcome,
  queryMemoriesByTopic,
  extractTopicTag,
  inferFailureReason,
  checkForSelfRevision,
  makeRevisionPreamble,
  exportWisdomMemories,
  importWisdomMemories,
  debugGetAll
};

export default SageMemoryEngine;
