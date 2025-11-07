// src/context-engine/adapters/contextToMemory.js
export function toMemoryEntry(n) {
  return {
    MemoryID: `CTX-${n.id}`,
    TimeStamp: n.timestamp,
    TopicTag: n.layer || 'surface',
    SageStance: `[Context] ${n.text || ''}`,
    UserOutcomeScore: 0,
    EmotionState: n.tags?.mood ?? '',
    FullTranscript: ''
  };
}