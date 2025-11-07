// src/bridges/transparencyBridge.js
// ✅ FIXED: Changed import path to .jsx
import { buildContextPromptSnippet } from "../store/cognitiveField.jsx";

/**
 * Attaches the current Cognitive Field state as a context hint to the LLM prompt.
 * This function should be called inside your LLM request builder or hook (e.g., useSageResponder).
 *
 * @param {object} params
 * @param {string} params.system - The existing system prompt.
 * @param {string} params.user - The existing user prompt.
 * @param {object} params.cfState - The state object from useCognitiveField().
 * @returns {object} The system and user prompts updated with the ContextHint.
 */
export function attachContextToPrompt({ system, user, cfState }) {
  if (!cfState) return { system, user };
  
  const hint = buildContextPromptSnippet(cfState);
  
  // Prepend the hint to the system prompt
  return {
    system: system ? `${system}\n\n${hint}` : hint,
    user
  };
}
