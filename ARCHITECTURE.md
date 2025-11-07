# Brahma — Context + Transparency (Cognitive Field)

## High-Level
- **Transparency Engine**: decision support, values checks, audit, conversation UI
- **Context Engine**: capture notes/insights; feeds context
- **Cognitive Field**: shared store that connects them

## Key Integration Points
- `src/store/cognitiveField.js` — global context store (timeOfDay, tone, layer, etc.)
- `src/bridges/transparencyBridge.js` — attaches a `ContextHint` to LLM prompts
- `src/services/llmService.js` — injects Cognitive Field into Sage’s system prompt
- `src/context-engine/ContextEngineRoot.jsx` — writes layer/captures → CF + LocalMemory
- `src/components/transparency/TransparencyEngine.jsx` — reads CF, updates on explore
- `src/context/LocalMemoryContext.jsx` — local-first state + audit trail

## Daily Flow
1. Capture context (Context Engine) → CF updates `currentLayer`, `totals`
2. Explore decisions (Transparency Engine) → CF updates `lastDecisionTopic`
3. LLM calls → `transparencyBridge` injects `ContextHint` (mode, layer, tone, time)

## Files to Read First
- `ARCHITECTURE.md` (this)
- `README.md`
- `src/store/cognitiveField.js`
- `src/services/llmService.js`
- `src/components/transparency/TransparencyEngine.jsx`
- `src/context-engine/ContextEngineRoot.jsx`
- `src/context/LocalMemoryContext.jsx`

