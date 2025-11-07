// src/context-engine/adapters/llm.ts
import useLLMClient from '../hooks/useLLMClient.jsx';
export function useContextLLM() {
  const { generateResponse, isSystemReady } = useLLMClient();
  return { generateResponse, isSystemReady };
}